import { proxy, useSnapshot } from "valtio";
import { frontendBroker } from "../lib/frontend-broker";

type SessionStatus = "disconnected" | "connecting" | "connected";
type ServerStatus = "online" | "offline" | "warning" | null;

interface SessionState {
  status: SessionStatus;
  sessionId: string | null;
  sessionsCount: number;
  userHash: string | null;
  error: string | null;
  duplicateSessionServer: boolean;
  serverStatus: ServerStatus;
  closingGraceful: { secondsRemaining: number } | null;
}

export const sessionStore = proxy<SessionState>({
  status: "disconnected",
  sessionId: null,
  sessionsCount: 0,
  userHash: null,
  error: null,
  duplicateSessionServer: false,
  serverStatus: null,
  closingGraceful: null,
});

let isListening = false;

function ensureSessionListener() {
  if (isListening) {
    return;
  }
  isListening = true;

  frontendBroker.on("connecting", () => {
    sessionStore.status = "connecting";
  });

  frontendBroker.on("connected", (data) => {
    const { sessionId, userHash, sessionsCount } = (data ?? {}) as {
      sessionId?: string;
      userHash?: string;
      sessionsCount?: number;
    };
    sessionStore.status = "connected";
    sessionStore.sessionId = sessionId ?? null;
    sessionStore.sessionsCount = sessionsCount ?? 1;
    sessionStore.userHash = userHash ?? null;
    sessionStore.error = null;
    sessionStore.duplicateSessionServer = false;
  });

  frontendBroker.on("disconnected", () => {
    sessionStore.status = "disconnected";
    sessionStore.sessionId = null;
    sessionStore.sessionsCount = 0;
    sessionStore.userHash = null;
  });

  frontendBroker.on("duplicateSessionServer", () => {
    sessionStore.duplicateSessionServer = true;
  });

  frontendBroker.on("takeOverComplete", () => {
    sessionStore.duplicateSessionServer = false;
  });

  frontendBroker.on("closingGraceful", (data) => {
    const { secondsRemaining } = (data ?? {}) as { secondsRemaining?: number };
    const initialSeconds = secondsRemaining ?? 5;
    sessionStore.closingGraceful = { secondsRemaining: initialSeconds };

    const interval = setInterval(() => {
      const current = sessionStore.closingGraceful?.secondsRemaining ?? 0;
      if (current <= 1) {
        clearInterval(interval);
        sessionStore.closingGraceful = null;
      } else {
        sessionStore.closingGraceful = { secondsRemaining: current - 1 };
      }
    }, 1000);
  });

  frontendBroker.on("error", (data) => {
    const { error } = (data ?? {}) as { error?: string };
    sessionStore.error = error ?? "Unknown error";
    sessionStore.status = "disconnected";
  });

  frontendBroker.on("connectionError", (data) => {
    const { error } = (data ?? {}) as { error?: string };
    sessionStore.error = error ?? "Connection failed";
    sessionStore.status = "disconnected";
  });

  frontendBroker.on("registered", (data) => {
    const { userHash, sessionsCount } = (data ?? {}) as {
      userHash?: string;
      sessionsCount?: number;
    };
    if (userHash) {
      sessionStore.userHash = userHash;
    }
    if (sessionsCount !== undefined) {
      sessionStore.sessionsCount = sessionsCount;
    }
  });

  frontendBroker.on("userHash", (data) => {
    const { userHash } = (data ?? {}) as { userHash?: string };
    if (userHash) {
      sessionStore.userHash = userHash;
    }
  });
}

export function useSession() {
  ensureSessionListener();
  return useSnapshot(sessionStore);
}
