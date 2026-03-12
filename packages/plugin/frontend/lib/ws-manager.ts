/**
 * WebSocket lifecycle: connect, send, close.
 * WebSocket lives only in the frontend (backend cannot create sockets).
 */

import { sessionStore } from "../stores/session";
import { frontendBroker } from "./frontend-broker";

function buildWsUrl(hostOrUrl: string, room: string): string {
  const normalized = hostOrUrl.startsWith("http")
    ? hostOrUrl
    : `https://${hostOrUrl}`;
  const u = new URL(normalized);
  const protocol = u.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${u.host}/parties/websocket/${room}`;
}

let ws: WebSocket | null = null;

function cleanup(): void {
  if (ws) {
    ws.onopen = null;
    ws.onmessage = null;
    ws.onclose = null;
    ws.onerror = null;
    ws.close();
    ws = null;
  }
}

function setupListeners(): void {
  if (!ws) {
    return;
  }

  ws.onopen = () => {
    frontendBroker.post("wsOpened");
  };

  ws.onmessage = (e: MessageEvent) => {
    const data = typeof e.data === "string" ? e.data : String(e.data);
    frontendBroker.post("wsMessage", data);
  };

  const handleClose = () => {
    cleanup();
    frontendBroker.post("wsClosed");
    sessionStore.status = "disconnected";
  };

  ws.onclose = handleClose;
  ws.onerror = () => {
    handleClose();
  };
}

frontendBroker.on("connect", (data) => {
  const { host, room } = (data ?? {}) as { host?: string; room?: string };
  if (!(host && room)) {
    return;
  }
  cleanup();
  sessionStore.status = "connecting";
  const url = buildWsUrl(host, room);
  ws = new WebSocket(url);
  setupListeners();
});

frontendBroker.on("send", (data) => {
  if (ws?.readyState === WebSocket.OPEN && typeof data === "string") {
    ws.send(data);
  }
});

export const wsManager = {
  close(): void {
    cleanup();
    sessionStore.status = "disconnected";
  },

  getConnectionRef(): WebSocket | null {
    return ws;
  },
};

// Explicit close on plugin unload (e.g. rebuild, close UI) so server receives close frame
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", () => wsManager.close());
}
