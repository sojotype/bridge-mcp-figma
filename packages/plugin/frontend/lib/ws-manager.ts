/**
 * WebSocket lifecycle: connect, send, close.
 * WebSocket lives only in the frontend (backend cannot create sockets).
 */

import { sessionStore } from "../stores/session";
import { frontendBroker } from "./frontend-broker";

function getWsUrl(hostOrUrl: string): string {
  if (hostOrUrl.startsWith("ws://") || hostOrUrl.startsWith("wss://")) {
    return hostOrUrl;
  }
  if (hostOrUrl.startsWith("http")) {
    const u = new URL(hostOrUrl);
    return u.protocol === "https:" ? `wss://${u.host}` : `ws://${u.host}`;
  }
  return `ws://${hostOrUrl}`;
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
    if (sessionStore.status === "connecting") {
      sessionStore.error = "Connection failed";
    }
    cleanup();
    frontendBroker.post("wsClosed");
    sessionStore.status = "disconnected";
  };

  ws.onclose = handleClose;
  ws.onerror = () => {
    handleClose();
  };
}

frontendBroker.on("closeSocket", () => {
  cleanup();
  sessionStore.status = "disconnected";
  frontendBroker.post("wsClosed");
});

frontendBroker.on("connect", (data) => {
  const { host } = (data ?? {}) as { host?: string };
  if (!host) {
    return;
  }
  cleanup();
  sessionStore.status = "connecting";
  const url = getWsUrl(host);
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
  window.addEventListener("pagehide", () => {
    frontendBroker.post("pluginClosing");
    wsManager.close();
  });
}
