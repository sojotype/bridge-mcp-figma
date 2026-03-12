import type * as Party from "partykit/server";

export interface SessionEntry {
  fileRootId: string;
  registeredAt: number;
  roomId: string;
  userHash: string;
  userName?: string;
}

interface RegisterBody {
  action: "register";
  fileRootId: string;
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

/** Storage key: userHash:fileRootId -> single SessionEntry (one session per user per file) */
const SESSIONS_BY_USER_ROOT = "sessionsByUserRoot";
/** Storage key: roomId -> { userHash, fileRootId } for fast unregister */
const SESSIONS_BY_ROOM = "sessionsByRoom";

type ByUserRoot = Record<string, SessionEntry>;
type ByRoom = Record<string, { userHash: string; fileRootId: string }>;

function userRootKey(userHash: string, fileRootId: string): string {
  return `${userHash}:${fileRootId}`;
}

export const REGISTRY_ROOM_ID = "sessions";

export default class Registry implements Party.Server {
  readonly room: Party.Room;

  constructor(room: Party.Room) {
    this.room = room;
  }

  private async getStored(): Promise<{
    byUserRoot: ByUserRoot;
    byRoom: ByRoom;
  }> {
    const byUserRoot =
      (await this.room.storage.get<ByUserRoot>(SESSIONS_BY_USER_ROOT)) ?? {};
    const byRoom =
      (await this.room.storage.get<ByRoom>(SESSIONS_BY_ROOM)) ?? {};
    return { byUserRoot, byRoom };
  }

  private async save(byUserRoot: ByUserRoot, byRoom: ByRoom): Promise<void> {
    await this.room.storage.put(SESSIONS_BY_USER_ROOT, byUserRoot);
    await this.room.storage.put(SESSIONS_BY_ROOM, byRoom);
  }

  private checkSecret(secret: unknown): boolean {
    return secret === this.room.env.BRIDGE_SECRET;
  }

  /** Push sessionsCountUpdate to a websocket room's connected clients */
  private async notifyRoomSessionsCount(
    roomId: string,
    sessionsCount: number,
    secret: string
  ): Promise<void> {
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
      return;
    }
    const room = parties.websocket.get(roomId);
    await room.fetch(
      new Request(`https://_/parties/websocket/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "notifyClient",
          sessionsCount,
          secret,
        }),
      })
    );
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
      if (action === "cleanup") {
        return this.handleCleanup();
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
    const { userHash, fileRootId, roomId, userName } = body;
    if (!(userHash && fileRootId && roomId)) {
      return Response.json(
        { error: "Missing userHash, fileRootId or roomId" },
        { status: 400 }
      );
    }

    const { byUserRoot, byRoom } = await this.getStored();
    const key = userRootKey(userHash, fileRootId);
    const existing = byUserRoot[key];

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
      fileRootId,
      userName,
      userHash,
      registeredAt: Date.now(),
    };
    byUserRoot[key] = entry;
    byRoom[roomId] = { userHash, fileRootId };
    await this.save(byUserRoot, byRoom);
    const sessionsCount = Object.values(byUserRoot).filter(
      (e) => e.userHash === userHash
    ).length;

    // Notify other sessions of the same user so they show "multiple sessions" UI
    if (sessionsCount > 1) {
      const secret = (body as { secret?: string }).secret;
      if (secret) {
        const otherRoomIds = Object.entries(byRoom)
          .filter(([rid, meta]) => meta.userHash === userHash && rid !== roomId)
          .map(([rid]) => rid);
        for (const otherRoomId of otherRoomIds) {
          this.notifyRoomSessionsCount(
            otherRoomId,
            sessionsCount,
            secret
          ).catch((e) =>
            console.error("[registry] notifyRoomSessionsCount failed:", e)
          );
        }
      }
    }

    return Response.json({ ok: true, sessionsCount });
  }

  private async handleUnregister(body: UnregisterBody): Promise<Response> {
    const { roomId, secret } = body;
    if (!roomId) {
      return Response.json({ error: "Missing roomId" }, { status: 400 });
    }

    const { byUserRoot, byRoom } = await this.getStored();
    const meta = byRoom[roomId];
    if (meta) {
      const userHash = meta.userHash;
      delete byUserRoot[userRootKey(meta.userHash, meta.fileRootId)];
      delete byRoom[roomId];
      await this.save(byUserRoot, byRoom);

      // Notify remaining sessions of the same user about new count
      const sessionsCount = Object.values(byUserRoot).filter(
        (e) => e.userHash === userHash
      ).length;
      if (sessionsCount > 0 && secret) {
        const remainingRoomIds = Object.entries(byRoom)
          .filter(([, m]) => m.userHash === userHash)
          .map(([rid]) => rid);
        for (const otherRoomId of remainingRoomIds) {
          this.notifyRoomSessionsCount(
            otherRoomId,
            sessionsCount,
            secret
          ).catch((e) =>
            console.error("[registry] notifyRoomSessionsCount failed:", e)
          );
        }
      }
    }
    return Response.json({ ok: true });
  }

  /** Remove sessions with 0 WebSocket connections (stale after plugin close/rebuild) */
  private async handleCleanup(): Promise<Response> {
    const { byUserRoot, byRoom } = await this.getStored();
    const toRemove: string[] = [];
    for (const roomId of Object.keys(byRoom)) {
      const connections = await this.getWebsocketConnections(roomId);
      if (connections === 0) {
        toRemove.push(roomId);
      }
    }
    if (toRemove.length > 0) {
      for (const roomId of toRemove) {
        const meta = byRoom[roomId];
        if (meta) {
          delete byUserRoot[userRootKey(meta.userHash, meta.fileRootId)];
          delete byRoom[roomId];
        }
      }
      await this.save(byUserRoot, byRoom);
    }
    return Response.json({ ok: true, removed: toRemove.length });
  }

  private async handleResolve(body: ResolveBody): Promise<Response> {
    const { userHashes } = body;
    if (!Array.isArray(userHashes) || userHashes.length === 0) {
      return Response.json(
        { error: "userHashes array required" },
        { status: 400 }
      );
    }

    const { byUserRoot } = await this.getStored();
    const set = new Set(userHashes as string[]);
    const sessions: SessionEntry[] = [];
    for (const entry of Object.values(byUserRoot)) {
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

    const { byUserRoot } = await this.getStored();
    const set = new Set(userHashes as string[]);
    const sessions = Object.values(byUserRoot).filter((e) =>
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
