import type * as Party from "partykit/server";
import { REGISTRY_ROOM_ID } from "./registry";

// Protocol types
interface Command {
  args: unknown;
  commandId: string;
  tool: string;
}

interface CommandResult {
  commandId: string;
  error?: string;
  result?: unknown;
}

// Plugin registration message (first message after connect)
interface RegisterMessage {
  fileRootId: string;
  type: "register";
  userHash: string;
  userName?: string;
}

// Messages from the MCP server (via HTTP request to PartyKit)
interface McpRequest {
  args: unknown;
  commandId: string;
  secret: string; // simple protection
  tool: string;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

export default class FigmaBridge implements Party.Server {
  // Stores resolve/reject for each pending command
  pending = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason: string) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();

  readonly room: Party.Room;

  constructor(room: Party.Room) {
    this.room = room;
  }

  /** Periodic cleanup of stale sessions (0 connections) in registry */
  static async onCron(
    _cron: Party.Cron,
    lobby: Party.CronLobby,
    _ctx: Party.ExecutionContext
  ): Promise<void> {
    const parties = lobby.parties as {
      registry?: {
        get: (id: string) => { fetch: (req: Request) => Promise<Response> };
      };
    };
    if (!parties?.registry) {
      return;
    }
    const secret = lobby.env.BRIDGE_SECRET as string;
    const registryRoom = parties.registry.get(REGISTRY_ROOM_ID);
    await registryRoom.fetch(
      new Request("https://_/parties/registry/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cleanup", secret }),
      })
    );
  }

  /** Health check for Figma plugin (avoids CORS issues vs /parties/health/status) */
  static async onFetch(req: Party.Request): Promise<Response> {
    const url = new URL(req.url);
    await Promise.resolve(); // satisfy linter: async needs await
    const path = url.pathname || "/";
    if (path === "/health" || path.endsWith("/health")) {
      const headers = new Headers(CORS_HEADERS);
      headers.set("Content-Type", "application/json");
      if (req.method === "OPTIONS") {
        return new Response(null, { status: 204, headers });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers,
      });
    }
    return new Response("Not found", { status: 404 });
  }

  // Figma plugin connects via WebSocket
  onConnect() {
    console.error(`Plugin connected to room: ${this.room.id}`);
  }

  async onClose() {
    console.error(`Plugin disconnected from room: ${this.room.id}`);
    await this.unregisterFromRegistry();
  }

  private async unregisterFromRegistry(): Promise<void> {
    try {
      const parties = this.room.context?.parties as
        | {
            registry?: {
              get: (id: string) => {
                fetch: (req: Request) => Promise<Response>;
              };
            };
          }
        | undefined;
      if (!parties?.registry) {
        return;
      }
      const secret = this.room.env.BRIDGE_SECRET as string;
      const registryRoom = parties.registry.get(REGISTRY_ROOM_ID);
      await registryRoom.fetch(
        new Request("https://_/parties/registry/sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "unregister",
            roomId: this.room.id,
            secret,
          }),
        })
      );
    } catch (e) {
      console.error("Registry unregister failed:", e);
    }
  }

  // Plugin sent the result of the command execution, or register message
  async onMessage(message: string, sender: Party.Connection) {
    let data: unknown;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }
    const msg = data as { type?: string; [k: string]: unknown };
    if (msg.type === "register") {
      await this.handleRegister(msg as unknown as RegisterMessage, sender);
      return;
    }
    const commandResult = data as CommandResult;
    const pending = this.pending.get(commandResult.commandId);

    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(commandResult.commandId);

    if (commandResult.error) {
      pending.reject(commandResult.error);
    } else {
      pending.resolve(commandResult.result);
    }
  }

  private async handleRegister(
    body: RegisterMessage,
    sender: Party.Connection
  ): Promise<void> {
    const parties = this.room.context?.parties as
      | {
          registry?: {
            get: (id: string) => {
              fetch: (req: Request) => Promise<Response>;
            };
          };
        }
      | undefined;
    if (!parties?.registry) {
      sender.send(
        JSON.stringify({ type: "error", error: "Registry unavailable" })
      );
      return;
    }
    const secret = this.room.env.BRIDGE_SECRET as string;
    const registryRoom = parties.registry.get(REGISTRY_ROOM_ID);
    const res = await registryRoom.fetch(
      new Request("https://_/parties/registry/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register",
          userHash: body.userHash,
          fileRootId: body.fileRootId,
          roomId: this.room.id,
          userName: body.userName,
          secret,
        }),
      })
    );
    if (res.status === 409) {
      sender.send(JSON.stringify({ type: "alreadyActive" }));
      return;
    }
    if (!res.ok) {
      const err = (await res.json()) as { error?: string };
      sender.send(
        JSON.stringify({
          type: "error",
          error: err.error ?? String(res.status),
        })
      );
      return;
    }
    const data = (await res.json()) as { sessionsCount?: number };
    sender.send(
      JSON.stringify({
        type: "registered",
        sessionsCount: data.sessionsCount ?? 1,
      })
    );
  }

  // MCP server sends a command via HTTP POST; GET returns connection count for registry
  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method === "GET") {
      const auth = req.headers.get("Authorization");
      const token = auth?.startsWith("Bearer ") ? auth.slice(7) : "";
      if (token !== this.room.env.BRIDGE_SECRET) {
        return new Response("Unauthorized", { status: 401 });
      }
      const connections = [...this.room.getConnections()].length;
      return Response.json({ connections });
    }

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body = (await req.json()) as {
      action?: string;
      secret?: string;
      sessionsCount?: number;
      commandId?: string;
      tool?: string;
      args?: unknown;
    };

    // Simple protection — check the secret
    if (body.secret !== this.room.env.BRIDGE_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Registry requests: push sessionsCountUpdate to connected clients
    if (
      body.action === "notifyClient" &&
      typeof body.sessionsCount === "number"
    ) {
      const connections = [...this.room.getConnections()];
      const msg = JSON.stringify({
        type: "sessionsCountUpdate",
        sessionsCount: body.sessionsCount,
      });
      for (const conn of connections) {
        conn.send(msg);
      }
      return Response.json({ ok: true });
    }

    // MCP command
    const mcpBody = body as McpRequest;
    if (!(mcpBody.commandId && mcpBody.tool)) {
      return new Response(
        { error: "Missing commandId or tool" },
        { status: 400 }
      );
    }

    // Check if the plugin is connected
    const connections = [...this.room.getConnections()];
    if (connections.length === 0) {
      return Response.json({ error: "Plugin not connected" }, { status: 503 });
    }

    // Send the command to the plugin (take the first connection)
    const command: Command = {
      commandId: mcpBody.commandId,
      tool: mcpBody.tool,
      args: mcpBody.args,
    };
    connections[0].send(JSON.stringify(command));

    // Wait for the result
    try {
      const result = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.pending.delete(mcpBody.commandId);
          reject("Timeout after 30s");
        }, 30_000);

        this.pending.set(mcpBody.commandId, { resolve, reject, timer });
      });

      return Response.json({ result });
    } catch (error) {
      return Response.json({ error }, { status: 500 });
    }
  }
}
