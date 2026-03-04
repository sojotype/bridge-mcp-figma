import type * as Party from "partykit/server";

export interface SessionEntry {
  fileKey: string;
  fileName?: string;
  registeredAt: number;
  roomId: string;
  userHash: string;
  userName?: string;
}

interface RegisterBody {
  action: "register";
  fileKey: string;
  fileName?: string;
  roomId: string;
  secret?: string;
  userHash: string;
  userName?: string;
}

interface UnregisterBody {
  action: "unregister";
  roomId: string;
  secret?: string;
}

interface ResolveBody {
  action: "resolve";
  secret?: string;
  userHashes: string[];
}

interface InvokeBody {
  action: "invoke";
  args: unknown;
  commandId: string;
  secret?: string;
  tool: string;
  userHashes: string[];
}

/** Storage key: userHash:fileKey -> single SessionEntry (one session per user per file) */
const SESSIONS_BY_USER_FILE = "sessionsByUserFile";
/** Storage key: roomId -> { userHash, fileKey } for fast unregister */
const SESSIONS_BY_ROOM = "sessionsByRoom";

type ByUserFile = Record<string, SessionEntry>;
type ByRoom = Record<string, { userHash: string; fileKey: string }>;

function userFileKey(userHash: string, fileKey: string): string {
  return `${userHash}:${fileKey}`;
}

export const REGISTRY_ROOM_ID = "sessions";

export default class Registry implements Party.Server {
  readonly room: Party.Room;

  constructor(room: Party.Room) {
    this.room = room;
  }

  private async getStored(): Promise<{
    byUserFile: ByUserFile;
    byRoom: ByRoom;
  }> {
    const byUserFile =
      (await this.room.storage.get<ByUserFile>(SESSIONS_BY_USER_FILE)) ?? {};
    const byRoom =
      (await this.room.storage.get<ByRoom>(SESSIONS_BY_ROOM)) ?? {};
    return { byUserFile, byRoom };
  }

  private async save(byUserFile: ByUserFile, byRoom: ByRoom): Promise<void> {
    await this.room.storage.put(SESSIONS_BY_USER_FILE, byUserFile);
    await this.room.storage.put(SESSIONS_BY_ROOM, byRoom);
  }

  private checkSecret(secret: unknown): boolean {
    return secret === this.room.env.BRIDGE_SECRET;
  }

  /** GET /parties/websocket/:roomId with Authorization: Bearer <secret> returns { connections } */
  private async getWebsocketConnections(roomId: string): Promise<number> {
    const parties = this.room.context?.parties as
      | {
          websocket?: {
            get: (id: string) => {
              fetch: (req: Request) => Promise<Response>;
            };
          };
        }
      | undefined;
    if (!parties?.websocket) {
      return 0;
    }
    const secret = this.room.env.BRIDGE_SECRET as string;
    const room = parties.websocket.get(roomId);
    const res = await room.fetch(
      new Request(`https://_/parties/websocket/${roomId}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${secret}` },
      })
    );
    if (!res.ok) {
      return 0;
    }
    const data = (await res.json()) as { connections?: number };
    return data.connections ?? 0;
  }

  async onRequest(req: Party.Request): Promise<Response> {
    if (req.method === "OPTIONS") {
      return new Response(null, { status: 204 });
    }

    const authHeader = req.headers.get("Authorization");
    const secretFromHeader = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;

    if (req.method === "POST") {
      let body: unknown;
      try {
        body = await req.json();
      } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
      }
      const secret =
        (body as { secret?: string }).secret ?? secretFromHeader ?? "";
      if (!this.checkSecret(secret)) {
        return new Response("Unauthorized", { status: 401 });
      }

      const action = (body as { action?: string }).action;
      if (action === "register") {
        return this.handleRegister(body as RegisterBody);
      }
      if (action === "unregister") {
        return this.handleUnregister(body as UnregisterBody);
      }
      if (action === "resolve") {
        return this.handleResolve(body as ResolveBody);
      }
      if (action === "invoke") {
        return this.handleInvoke(body as InvokeBody);
      }
      return Response.json({ error: "Unknown action" }, { status: 400 });
    }

    return new Response("Method not allowed", { status: 405 });
  }

  private async handleRegister(body: RegisterBody): Promise<Response> {
    const { userHash, fileKey, roomId, fileName, userName } = body;
    if (!(userHash && fileKey && roomId)) {
      return Response.json(
        { error: "Missing userHash, fileKey or roomId" },
        { status: 400 }
      );
    }

    const { byUserFile, byRoom } = await this.getStored();
    const key = userFileKey(userHash, fileKey);
    const existing = byUserFile[key];

    if (existing && existing.roomId !== roomId) {
      const connections = await this.getWebsocketConnections(existing.roomId);
      if (connections > 0) {
        return Response.json(
          { error: "Active session in another tab", code: "ALREADY_ACTIVE" },
          { status: 409 }
        );
      }
      delete byRoom[existing.roomId];
    }

    const entry: SessionEntry = {
      roomId,
      fileKey,
      fileName,
      userName,
      userHash,
      registeredAt: Date.now(),
    };
    byUserFile[key] = entry;
    byRoom[roomId] = { userHash, fileKey };
    await this.save(byUserFile, byRoom);
    return Response.json({ ok: true });
  }

  private async handleUnregister(body: UnregisterBody): Promise<Response> {
    const { roomId } = body;
    if (!roomId) {
      return Response.json({ error: "Missing roomId" }, { status: 400 });
    }

    const { byUserFile, byRoom } = await this.getStored();
    const meta = byRoom[roomId];
    if (meta) {
      delete byUserFile[userFileKey(meta.userHash, meta.fileKey)];
      delete byRoom[roomId];
      await this.save(byUserFile, byRoom);
    }
    return Response.json({ ok: true });
  }

  private async handleResolve(body: ResolveBody): Promise<Response> {
    const { userHashes } = body;
    if (!Array.isArray(userHashes) || userHashes.length === 0) {
      return Response.json(
        { error: "userHashes array required" },
        { status: 400 }
      );
    }

    const { byUserFile } = await this.getStored();
    const set = new Set(userHashes as string[]);
    const sessions: SessionEntry[] = [];
    for (const entry of Object.values(byUserFile)) {
      if (set.has(entry.userHash)) {
        sessions.push(entry);
      }
    }
    return Response.json({ sessions });
  }

  private async handleInvoke(body: InvokeBody): Promise<Response> {
    const { userHashes, commandId, tool, args } = body;
    if (!Array.isArray(userHashes) || userHashes.length === 0) {
      return Response.json(
        { error: "userHashes array required" },
        { status: 400 }
      );
    }

    const { byUserFile } = await this.getStored();
    const set = new Set(userHashes as string[]);
    const sessions = Object.values(byUserFile).filter((e) =>
      set.has(e.userHash)
    );

    if (sessions.length === 0) {
      return Response.json(
        { error: "No active sessions for these users", code: "NO_SESSIONS" },
        { status: 503 }
      );
    }
    if (sessions.length > 1) {
      return Response.json(
        {
          error: "Multiple sessions; specify sessionId",
          code: "MULTIPLE_SESSIONS",
          sessions: sessions.map((s) => ({
            sessionId: s.roomId,
            fileKey: s.fileKey,
            fileName: s.fileName,
            userName: s.userName,
          })),
        },
        { status: 409 }
      );
    }

    const roomId = sessions[0].roomId;
    const parties = this.room.context?.parties as
      | {
          websocket?: {
            get: (id: string) => {
              fetch: (req: Request) => Promise<Response>;
            };
          };
        }
      | undefined;
    if (!parties?.websocket) {
      return Response.json(
        { error: "Websocket party not available" },
        { status: 503 }
      );
    }
    const secret = this.room.env.BRIDGE_SECRET as string;
    const room = parties.websocket.get(roomId);
    const res = await room.fetch(
      new Request(`https://_/parties/websocket/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commandId, tool, args, secret }),
      })
    );
    const data = (await res.json()) as { result?: unknown; error?: string };
    if (!res.ok) {
      let status = 500;
      if (res.status === 401) {
        status = 401;
      } else if (res.status === 503) {
        status = 503;
      }
      return Response.json(
        { error: data.error ?? `Upstream ${res.status}` },
        { status }
      );
    }
    if (data.error) {
      return Response.json({ error: data.error }, { status: 500 });
    }
    return Response.json({ result: data.result });
  }
}
