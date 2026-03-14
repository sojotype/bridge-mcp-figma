/**
 * Embedded WebSocket server for plugin connections.
 * Handles register, command/result protocol.
 * Serves GET /health for liveness checks.
 */

import { createServer } from "node:http";
import type { WebSocket } from "ws";
import { WebSocketServer } from "ws";
import { type SessionEntry, SessionRegistry } from "./session-registry.js";

const COMMAND_TIMEOUT_MS = 30_000;

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

interface RegisterMessage {
  type: "register";
  userHash: string;
  fileRootId: string;
  userName?: string;
  takeOver?: boolean;
}

export interface WsServerCallbacks {
  onSessionsCountUpdate?: (connectionId: string, sessionsCount: number) => void;
}

export class BridgeWsServer {
  private httpServer: ReturnType<typeof createServer> | null = null;
  private wss: WebSocketServer | null = null;
  private registry = new SessionRegistry();
  private readonly connections = new Map<string, WebSocket>();
  private readonly pending = new Map<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason: string) => void;
      timer: ReturnType<typeof setTimeout>;
    }
  >();
  private callbacks: WsServerCallbacks = {};

  setCallbacks(cb: WsServerCallbacks): void {
    this.callbacks = cb;
  }

  start(port: number): void {
    const httpServer = createServer(
      (
        req: import("node:http").IncomingMessage,
        res: import("node:http").ServerResponse
      ) => {
        if (req.url === "/health" && req.method === "GET") {
          res.writeHead(200, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          });
          res.end(JSON.stringify({ ok: true }));
          return;
        }
        res.writeHead(404);
        res.end();
      }
    );

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(
          `[bridge-mcp] Port ${port} is in use. Stop the other process or use WEBSOCKET_PORT to pick another port.`
        );
      }
      throw err;
    });

    this.wss = new WebSocketServer({ server: httpServer });
    this.wss.on("connection", (ws) => this.handleConnection(ws));

    httpServer.listen(port, () => {
      console.log(
        `[bridge-mcp] WebSocket server: ws://localhost:${port} (health: http://localhost:${port}/health)`
      );
    });
    this.httpServer = httpServer;
  }

  stop(): Promise<void> {
    const server = this.httpServer;
    this.httpServer = null;
    const closeHttp = server
      ? new Promise<void>((resolve) => {
          server.close(() => resolve());
        })
      : Promise.resolve();

    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    this.connections.clear();
    this.registry = new SessionRegistry();

    return closeHttp;
  }

  invoke(
    tool: string,
    args: unknown,
    sessionId?: string
  ): Promise<{
    result?: unknown;
    error?: string;
    code?: string;
    sessions?: Array<{ sessionId: string; userName?: string }>;
  }> {
    const sessions = this.registry.getSessions();

    if (sessions.length === 0) {
      return Promise.resolve({
        error: "Plugin not connected. Open the Figma plugin and connect.",
        code: "NO_SESSIONS",
      });
    }

    let targetSession: SessionEntry | undefined;
    if (sessionId) {
      targetSession = this.registry.getSessionByConnectionId(sessionId);
      if (!targetSession) {
        return Promise.resolve({
          error: `Session ${sessionId} not found`,
          code: "SESSION_NOT_FOUND",
        });
      }
    } else if (sessions.length > 1) {
      return Promise.resolve({
        error:
          "Multiple sessions. Choose one and pass sessionId in tool params.",
        code: "MULTIPLE_SESSIONS",
        sessions: sessions.map((s) => ({
          sessionId: s.connectionId,
          userName: s.userName,
        })),
      });
    } else {
      targetSession = sessions[0];
    }

    const ws = this.connections.get(targetSession.connectionId);
    if (!ws || ws.readyState !== 1) {
      this.registry.unregister(targetSession.connectionId);
      this.connections.delete(targetSession.connectionId);
      return Promise.resolve({
        error: "Plugin connection closed",
        code: "NO_SESSIONS",
      });
    }

    const commandId = crypto.randomUUID();
    const command: Command = { commandId, tool, args };
    ws.send(JSON.stringify(command));

    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        this.pending.delete(commandId);
        resolve({ error: "Timeout after 30s", code: "TIMEOUT" });
      }, COMMAND_TIMEOUT_MS);

      this.pending.set(commandId, {
        resolve: (value) => {
          clearTimeout(timer);
          this.pending.delete(commandId);
          resolve({ result: value });
        },
        reject: (reason) => {
          clearTimeout(timer);
          this.pending.delete(commandId);
          resolve({ error: reason, code: "ERROR" });
        },
        timer,
      });
    });
  }

  private handleConnection(ws: WebSocket): void {
    const connectionId = crypto.randomUUID();
    this.connections.set(connectionId, ws);

    ws.on("message", (data) => {
      const message = typeof data === "string" ? data : data.toString();
      this.handleMessage(connectionId, message, ws);
    });

    ws.on("close", () => {
      this.connections.delete(connectionId);
      this.registry.unregister(connectionId);
    });

    ws.on("error", () => {
      this.connections.delete(connectionId);
      this.registry.unregister(connectionId);
    });
  }

  private handleMessage(
    connectionId: string,
    message: string,
    ws: WebSocket
  ): void {
    let data: unknown;
    try {
      data = JSON.parse(message);
    } catch {
      return;
    }

    const msg = data as { type?: string; [k: string]: unknown };
    if (msg.type === "register") {
      this.handleRegister(connectionId, msg as unknown as RegisterMessage, ws);
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

  private handleRegister(
    connectionId: string,
    body: RegisterMessage,
    ws: WebSocket
  ): void {
    const { userHash, fileRootId, userName, takeOver } = body;

    if (takeOver) {
      const result = this.registry.registerWithTakeOver(
        connectionId,
        userHash,
        fileRootId,
        userName
      );

      if (result.replacedConnectionId) {
        const oldWs = this.connections.get(result.replacedConnectionId);
        if (oldWs && oldWs.readyState === 1) {
          const GRACE_SECONDS = 5;
          oldWs.send(
            JSON.stringify({
              type: "takenOverGraceful",
              graceSeconds: GRACE_SECONDS,
            })
          );
          setTimeout(() => {
            if (oldWs.readyState === 1) {
              oldWs.close();
            }
          }, GRACE_SECONDS * 1000);
        }
      }

      ws.send(
        JSON.stringify({
          type: "registered",
          sessionsCount: result.sessionsCount,
          sessionId: connectionId,
        })
      );

      if (result.sessionsCount > 1) {
        this.callbacks.onSessionsCountUpdate?.(
          connectionId,
          result.sessionsCount
        );
      }
      return;
    }

    const result = this.registry.register(
      connectionId,
      userHash,
      fileRootId,
      userName
    );

    if (!result.ok) {
      if (result.error?.includes("another tab")) {
        ws.send(JSON.stringify({ type: "duplicateSessionServer" }));
      } else {
        ws.send(
          JSON.stringify({
            type: "error",
            error: result.error ?? "Unknown error",
          })
        );
      }
      return;
    }

    ws.send(
      JSON.stringify({
        type: "registered",
        sessionsCount: result.sessionsCount,
        sessionId: connectionId,
      })
    );

    if (result.sessionsCount > 1) {
      this.callbacks.onSessionsCountUpdate?.(
        connectionId,
        result.sessionsCount
      );
    }
  }
}
