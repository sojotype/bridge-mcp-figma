import { proxy, useSnapshot } from "valtio";
import { frontendBroker } from "../lib/frontend-broker";

type SessionStatus = "disconnected" | "connecting" | "connected";

interface SessionState {
  status: SessionStatus;
  sessionId: string | null;
  userHash: string | null;
  error: string | null;
  alreadyActive: boolean;
}

export const sessionStore = proxy<SessionState>({
  status: "disconnected",
  sessionId: null,
  userHash: null,
  error: null,
  alreadyActive: false,
});

let isListening = false;

function ensureSessionListener() {
  if (isListening) {
    return;
  }
  isListening = true;

  frontendBroker.on("connected", (data) => {
    const { sessionId, userHash } = (data ?? {}) as {
      sessionId?: string;
      userHash?: string;
    };
    sessionStore.status = "connected";
    sessionStore.sessionId = sessionId ?? null;
    sessionStore.userHash = userHash ?? null;
    sessionStore.error = null;
    sessionStore.alreadyActive = false;
  });

  frontendBroker.on("disconnected", () => {
    sessionStore.status = "disconnected";
    sessionStore.sessionId = null;
    sessionStore.userHash = null;
  });

  frontendBroker.on("alreadyActive", () => {
    sessionStore.alreadyActive = true;
  });

  frontendBroker.on("error", (data) => {
    const { error } = (data ?? {}) as { error?: string };
    sessionStore.error = error ?? "Unknown error";
    sessionStore.status = "disconnected";
  });

  frontendBroker.on("registered", (data) => {
    const { userHash } = (data ?? {}) as { userHash?: string };
    if (userHash) {
      sessionStore.userHash = userHash;
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
