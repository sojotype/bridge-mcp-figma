import type * as Party from "partykit/server";

// Protocol types
interface Command {
  commandId: string;
  tool: string;
  args: unknown;
}

interface CommandResult {
  commandId: string;
  result?: unknown;
  error?: string;
}

// Messages from the MCP server (via HTTP request to PartyKit)
interface McpRequest {
  commandId: string;
  tool: string;
  args: unknown;
  secret: string; // simple protection
}

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

  // Figma plugin connects via WebSocket
  onConnect() {
    console.error(`Plugin connected to room: ${this.room.id}`);
  }

  onClose() {
    console.error(`Plugin disconnected from room: ${this.room.id}`);
  }

  // Plugin sent the result of the command execution
  onMessage(message: string) {
    const data: CommandResult = JSON.parse(message);
    const pending = this.pending.get(data.commandId);

    if (!pending) {
      return;
    }

    clearTimeout(pending.timer);
    this.pending.delete(data.commandId);

    if (data.error) {
      pending.reject(data.error);
    } else {
      pending.resolve(data.result);
    }
  }

  // MCP server sends a command via HTTP POST
  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const body: McpRequest = await req.json();

    // Simple protection — check the secret
    if (body.secret !== this.room.env.BRIDGE_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    // Check if the plugin is connected
    const connections = [...this.room.getConnections()];
    if (connections.length === 0) {
      return Response.json({ error: "Plugin not connected" }, { status: 503 });
    }

    // Send the command to the plugin (take the first connection)
    const command: Command = {
      commandId: body.commandId,
      tool: body.tool,
      args: body.args,
    };
    connections[0].send(JSON.stringify(command));

    // Wait for the result
    try {
      const result = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          this.pending.delete(body.commandId);
          reject("Timeout after 30s");
        }, 30_000);

        this.pending.set(body.commandId, { resolve, reject, timer });
      });

      return Response.json({ result });
    } catch (error) {
      return Response.json({ error }, { status: 500 });
    }
  }
}
