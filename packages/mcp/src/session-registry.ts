/**
 * In-memory session registry for tracking plugin connections.
 * Maps userHash:fileRootId -> session for MULTIPLE_SESSIONS resolution.
 */

export interface SessionEntry {
  connectionId: string;
  fileRootId: string;
  registeredAt: number;
  userHash: string;
  userName?: string;
}

function userRootKey(userHash: string, fileRootId: string): string {
  return `${userHash}:${fileRootId}`;
}

export class SessionRegistry {
  private readonly byUserRoot = new Map<string, SessionEntry>();
  private readonly byConnectionId = new Map<
    string,
    { userHash: string; fileRootId: string }
  >();

  register(
    connectionId: string,
    userHash: string,
    fileRootId: string,
    userName?: string
  ): { ok: boolean; sessionsCount: number; error?: string } {
    if (!(userHash && fileRootId && connectionId)) {
      return {
        ok: false,
        sessionsCount: 0,
        error: "Missing userHash, fileRootId or connectionId",
      };
    }

    const key = userRootKey(userHash, fileRootId);
    const existing = this.byUserRoot.get(key);

    if (existing && existing.connectionId !== connectionId) {
      return {
        ok: false,
        sessionsCount: 0,
        error: "Active session in another tab",
      };
    }

    const entry: SessionEntry = {
      connectionId,
      fileRootId,
      userName,
      userHash,
      registeredAt: Date.now(),
    };
    this.byUserRoot.set(key, entry);
    this.byConnectionId.set(connectionId, { userHash, fileRootId });

    const sessionsCount = [...this.byUserRoot.values()].filter(
      (e) => e.userHash === userHash
    ).length;
    return { ok: true, sessionsCount };
  }

  registerWithTakeOver(
    connectionId: string,
    userHash: string,
    fileRootId: string,
    userName?: string
  ): { ok: boolean; replacedConnectionId?: string; sessionsCount: number } {
    if (!(userHash && fileRootId && connectionId)) {
      return {
        ok: false,
        sessionsCount: 0,
      };
    }

    const key = userRootKey(userHash, fileRootId);
    const existing = this.byUserRoot.get(key);
    let replacedConnectionId: string | undefined;

    if (existing && existing.connectionId !== connectionId) {
      replacedConnectionId = existing.connectionId;
      this.byUserRoot.delete(key);
      this.byConnectionId.delete(existing.connectionId);
    }

    const entry: SessionEntry = {
      connectionId,
      fileRootId,
      userName,
      userHash,
      registeredAt: Date.now(),
    };
    this.byUserRoot.set(key, entry);
    this.byConnectionId.set(connectionId, { userHash, fileRootId });

    const sessionsCount = [...this.byUserRoot.values()].filter(
      (e) => e.userHash === userHash
    ).length;
    return { ok: true, replacedConnectionId, sessionsCount };
  }

  unregister(connectionId: string): void {
    const meta = this.byConnectionId.get(connectionId);
    if (meta) {
      this.byUserRoot.delete(userRootKey(meta.userHash, meta.fileRootId));
      this.byConnectionId.delete(connectionId);
    }
  }

  getSessions(): SessionEntry[] {
    return [...this.byUserRoot.values()];
  }

  getSessionByConnectionId(connectionId: string): SessionEntry | undefined {
    const meta = this.byConnectionId.get(connectionId);
    if (!meta) {
      return undefined;
    }
    return this.byUserRoot.get(userRootKey(meta.userHash, meta.fileRootId));
  }

  getSessionsForUserHash(userHash: string): SessionEntry[] {
    return [...this.byUserRoot.values()].filter((e) => e.userHash === userHash);
  }
}
