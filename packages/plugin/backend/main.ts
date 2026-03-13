import type { ToolsParams } from "@bridge-mcp-figma/api";
import type { StoredEndpoints } from "../lib/events";
import { obfuscateId } from "../lib/obfuscated";
import { PLUGIN_WIDTH } from "./const";
import { handleMessage } from "./handlers/imperative";
import { backendBroker } from "./utils/backend-broker";
import {
  getOrCreateFileId,
  getSessionId,
  loadEndpoints,
  loadLastScreen,
  loadPersistSettings,
  saveEndpoints,
  saveLastScreen,
  setPersistSettings,
} from "./utils/plugin-storage";
import { resizeUi } from "./utils/resize-ui";

const REGISTER_RETRY_MS = 30_000;

const RE_HTTP_PROTOCOL = /^https?:\/\//i;
const RE_WS_TO_HTTP = /^ws/;
const RE_TRAILING_SLASH = /\/$/;
const RE_ORIGIN = /^(https?:\/\/[^/]+)/;

interface CommandMessage {
  args: unknown;
  commandId: string;
  tool: keyof ToolsParams;
}

type SendToSocket = (data: string) => void;

function handleControlMessage(
  msg: { type?: string; [k: string]: unknown },
  _registerRetryTimer: ReturnType<typeof setInterval> | null,
  lastUserHash: string | null
): { clearRetry?: boolean; post?: unknown; startRetry?: boolean } | null {
  if (msg.type === "registered") {
    return {
      clearRetry: true,
      post: {
        type: "registered",
        userHash: lastUserHash ?? undefined,
        sessionsCount: msg.sessionsCount as number | undefined,
      },
    };
  }
  if (msg.type === "sessionsCountUpdate") {
    return {
      post: {
        type: "registered",
        sessionsCount: msg.sessionsCount as number,
      },
    };
  }
  if (msg.type === "alreadyActive") {
    return { post: { type: "alreadyActive" }, startRetry: true };
  }
  if (msg.type === "error") {
    return {
      post: {
        type: "error",
        error: (msg.error as string) ?? "Unknown error",
      },
    };
  }
  return null;
}

async function handleCommand(
  sendToSocket: SendToSocket,
  command: CommandMessage
): Promise<void> {
  if (!(command.commandId && command.tool)) {
    return;
  }
  try {
    const result = await Promise.resolve(
      handleMessage(
        command.tool,
        command.args as ToolsParams[typeof command.tool]
      )
    );
    sendToSocket(JSON.stringify({ commandId: command.commandId, result }));
  } catch (err) {
    sendToSocket(
      JSON.stringify({
        commandId: command.commandId,
        error: err instanceof Error ? err.message : String(err),
      })
    );
  }
}

function handleReady(userHash: string): void {
  sendInitialSettings(userHash).catch(() => undefined);
}

async function handleRequestConnect(
  sessionId: string,
  userHash: string
): Promise<void> {
  const endpoints = await loadEndpoints(userHash);
  const routing = endpoints?.websocket?.routing ?? "local";
  const url =
    endpoints?.websocket?.user[routing] ??
    (routing === "local" ? __WEBSOCKET_LOCAL_URL__ : __WEBSOCKET_REMOTE_URL__);
  const host = url.trim();
  if (!host) {
    backendBroker.post("error", { error: "WebSocket URL not configured" });
    return;
  }
  console.log("[bridge] requestConnect, sending connect", {
    host,
    room: sessionId,
  });
  backendBroker.post("connecting");
  backendBroker.post("connect", { host, room: sessionId });
}

async function sendInitialSettings(userHash: string): Promise<void> {
  const persistSettings = await loadPersistSettings(userHash);
  const [endpoints, lastScreen] = await Promise.all([
    persistSettings ? loadEndpoints(userHash) : Promise.resolve(null),
    loadLastScreen(userHash),
  ]);
  backendBroker.post("initialSettings", {
    persistSettings,
    endpoints: endpoints ?? undefined,
    lastScreen: lastScreen ?? undefined,
  });
}

function getStatusFetchUrl(url: string, type: "mcp" | "websocket"): string {
  const trimmed = url.trim();
  if (!trimmed) {
    return "";
  }
  let normalized = trimmed;
  if (!RE_HTTP_PROTOCOL.test(trimmed)) {
    normalized =
      trimmed.startsWith("wss://") || trimmed.startsWith("ws://")
        ? trimmed.replace(RE_WS_TO_HTTP, "http")
        : `http://${trimmed}`;
  }
  const base = normalized.replace(RE_TRAILING_SLASH, "");
  if (type === "mcp") {
    return `${base}/status`;
  }
  const originMatch = base.match(RE_ORIGIN);
  const origin = originMatch ? originMatch[1] : base;
  return `${origin}/health`;
}

const STATUS_TIMEOUT_MS = 7000;

async function handleCheckEndpointStatus(data: {
  url: string;
  type: "mcp" | "websocket";
  _correlationId?: string;
}): Promise<void> {
  const { url, type, _correlationId } = data;
  const fetchUrl = getStatusFetchUrl(url, type);
  if (!fetchUrl) {
    console.warn("[C2F:BACKEND]", type, "offline", "Cannot reach server", url);
    backendBroker.post("endpointStatus", {
      status: "offline",
      message: "Cannot reach server",
      checkedUrl: fetchUrl || url,
      _correlationId,
    });
    return;
  }

  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => {
      const err = new Error("Server is not responding");
      err.name = "TimeoutError";
      reject(err);
    }, STATUS_TIMEOUT_MS);
  });

  try {
    const res = await Promise.race([
      fetch(fetchUrl, { method: "GET" }),
      timeoutPromise,
    ]);

    let body: { ok?: boolean; message?: string } | null = null;
    try {
      body = (await res.json()) as { ok?: boolean; message?: string };
    } catch {
      /* ignore */
    }

    if (res?.ok) {
      if (body?.ok === true) {
        backendBroker.post("endpointStatus", {
          status: "online",
          checkedUrl: fetchUrl,
          _correlationId,
        });
      } else {
        const msg = body?.message ?? "Server reported a problem";
        console.warn(
          `[C2F:BACKEND] ${type.toUpperCase()} status check: server returned a problem. URL: ${fetchUrl}. Message: ${msg}.`
        );
        backendBroker.post("endpointStatus", {
          status: "warning",
          message: msg,
          checkedUrl: fetchUrl,
          _correlationId,
        });
      }
    } else {
      const message =
        body?.message ??
        (res?.status === 503
          ? "Service temporarily unavailable (503)"
          : `Server returned HTTP ${res?.status ?? "?"}`);
      console.warn(
        `[C2F:BACKEND] ${type.toUpperCase()} status check: server returned a problem. URL: ${fetchUrl}. Message: ${message}.`
      );
      backendBroker.post("endpointStatus", {
        status: "warning",
        message,
        checkedUrl: fetchUrl,
        _correlationId,
      });
    }
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    const message = isTimeout
      ? "Server is not responding"
      : "Cannot reach server";
    console.error(
      `[C2F:BACKEND] ${type.toUpperCase()} status check failed (offline). URL: ${fetchUrl}. ${message}. Error:`,
      err
    );
    backendBroker.post("endpointStatus", {
      status: "offline",
      message,
      checkedUrl: fetchUrl,
      _correlationId,
    });
  }
}

function handleGetUserHash(data: { _correlationId?: string }): string | null {
  const user = figma.currentUser;
  if (!user?.id) {
    backendBroker.post("error", { error: "Not signed in to Figma" });
    return null;
  }
  try {
    const userHash = obfuscateId(user.id);
    backendBroker.post("userHash", {
      userHash,
      _correlationId: data?._correlationId,
    });
    return userHash;
  } catch (err) {
    backendBroker.post("error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

function handleWsOpened(
  _sessionId: string,
  fileRootId: string,
  sendToSocket: SendToSocket
): string | null {
  console.log("[bridge] WebSocket open (via UI)");
  const user = figma.currentUser;
  if (!user?.id) {
    console.warn("[bridge] wsOpened but not signed in");
    backendBroker.post("error", { error: "Not signed in to Figma" });
    return null;
  }
  const userHash = obfuscateId(user.id);
  console.log("[bridge] sending register after wsOpened");
  sendToSocket(
    JSON.stringify({
      type: "register",
      userHash,
      fileRootId,
      userName: user.name,
    })
  );
  return userHash;
}

function handleWsClosed(
  registerRetryTimer: ReturnType<typeof setInterval> | null
): ReturnType<typeof setInterval> | null {
  console.log("[bridge] WebSocket closed (via UI)");
  if (registerRetryTimer) {
    clearInterval(registerRetryTimer);
    return null;
  }
  return registerRetryTimer;
}

function handleUiResize(data: unknown): void {
  const payload = data as { height?: unknown } | undefined;
  const rawHeight = payload?.height;
  const parsedHeight =
    typeof rawHeight === "number" ? rawHeight : Number(rawHeight);
  if (Number.isFinite(parsedHeight)) {
    resizeUi(parsedHeight);
  }
}

function handleWsMessage(
  raw: string,
  sendToSocket: SendToSocket,
  registerRetryTimer: ReturnType<typeof setInterval> | null,
  lastUserHash: string | null,
  sendRegister: () => void,
  sessionId: string
): ReturnType<typeof setInterval> | null | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  const msgData = parsed as { type?: string; [k: string]: unknown };
  if (
    msgData.type === "registered" ||
    msgData.type === "sessionsCountUpdate" ||
    msgData.type === "alreadyActive" ||
    msgData.type === "error"
  ) {
    console.log("[bridge] Control message", msgData.type, msgData);
  }
  const handled = handleControlMessage(
    msgData,
    registerRetryTimer,
    lastUserHash
  );
  if (!handled) {
    handleCommand(sendToSocket, parsed as CommandMessage);
    return undefined;
  }
  let nextTimer = registerRetryTimer;
  if (handled.clearRetry && registerRetryTimer) {
    clearInterval(registerRetryTimer);
    nextTimer = null;
  }
  if (handled.post) {
    const p = handled.post as {
      type: string;
      userHash?: string;
      error?: string;
      sessionsCount?: number;
    };
    if (p.type === "registered") {
      if (handled.clearRetry) {
        // First register: send "connected" with all data including sessionsCount
        backendBroker.post("connected", {
          sessionId,
          userHash: p.userHash ?? "",
          sessionsCount: p.sessionsCount,
        });
      } else {
        // sessionsCountUpdate: send "registered" only with sessionsCount
        backendBroker.post("registered", {
          userHash: "",
          sessionsCount: p.sessionsCount,
        });
      }
    } else if (p.type === "alreadyActive") {
      backendBroker.post("alreadyActive");
    } else if (p.type === "error") {
      backendBroker.post("error", {
        error: p.error ?? "Unknown error",
      });
    }
  }
  if (handled.startRetry && !nextTimer) {
    nextTimer = setInterval(sendRegister, REGISTER_RETRY_MS);
  }
  return nextTimer;
}

async function run() {
  const fileRootId = getOrCreateFileId();
  const user = figma.currentUser;
  const userHash = user?.id ? obfuscateId(user.id) : "anonymous";
  const sessionId = await getSessionId(fileRootId, userHash);

  let registerRetryTimer: ReturnType<typeof setInterval> | null = null;
  let lastUserHash: string | null = userHash;

  const sendToSocket: SendToSocket = (data) => {
    backendBroker.post("send", data);
  };

  function sendRegister() {
    const user = figma.currentUser;
    if (!user?.id) {
      backendBroker.post("error", { error: "Not signed in to Figma" });
      return;
    }
    const userHash = obfuscateId(user.id);
    lastUserHash = userHash;
    sendToSocket(
      JSON.stringify({
        type: "register",
        userHash,
        fileRootId,
        userName: user.name,
      })
    );
  }

  backendBroker.on("ready", () => handleReady(userHash));

  backendBroker.on("requestConnect", () => {
    handleRequestConnect(sessionId, userHash).catch((err) => {
      console.error("[bridge] requestConnect failed:", err);
      backendBroker.post("error", {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  backendBroker.on("checkEndpointStatus", (data) => {
    handleCheckEndpointStatus(
      data as {
        url: string;
        type: "mcp" | "websocket";
        _correlationId?: string;
      }
    );
  });

  backendBroker.on("getUserHash", async (data) => {
    const hash = await handleGetUserHash(data);
    if (hash) {
      lastUserHash = hash;
    }
  });

  backendBroker.on("wsOpened", async () => {
    const hash = await handleWsOpened(sessionId, fileRootId, sendToSocket);
    if (hash) {
      lastUserHash = hash;
    }
  });

  backendBroker.on("wsMessage", (data) => {
    if (data == null) {
      return;
    }
    const nextTimer = handleWsMessage(
      data,
      sendToSocket,
      registerRetryTimer,
      lastUserHash,
      sendRegister,
      sessionId
    );
    if (nextTimer !== undefined) {
      registerRetryTimer = nextTimer;
    }
  });

  backendBroker.on("wsClosed", () => {
    registerRetryTimer = handleWsClosed(registerRetryTimer);
    backendBroker.post("disconnected");
  });

  backendBroker.on("uiResize", (data) => handleUiResize(data));

  backendBroker.on("showConsoleHint", () => {
    figma.notify(
      "Press Cmd+Option+I (Mac) or Ctrl+Alt+I (Win) to open the console.",
      { error: true }
    );
  });

  backendBroker.on("setPersistSettings", async (data) => {
    const persist = data?.persist ?? true;
    const u = figma.currentUser;
    const hash = u?.id ? obfuscateId(u.id) : "anonymous";
    await setPersistSettings(hash, persist);
  });

  backendBroker.on("getPersistSettings", async (data) => {
    const u = figma.currentUser;
    const hash = u?.id ? obfuscateId(u.id) : "anonymous";
    const persistSettings = await loadPersistSettings(hash);
    backendBroker.post("persistSettings", {
      persistSettings,
      _correlationId: (data as { _correlationId?: string })?._correlationId,
    });
  });

  backendBroker.on("saveEndpoints", async (data) => {
    const u = figma.currentUser;
    const hash = u?.id ? obfuscateId(u.id) : "anonymous";
    if (data) {
      await saveEndpoints(hash, data as StoredEndpoints);
    }
  });

  backendBroker.on("saveLastScreen", async (data) => {
    const route = (data as { route?: string })?.route;
    if (!route || typeof route !== "string") {
      return;
    }
    const u = figma.currentUser;
    const hash = u?.id ? obfuscateId(u.id) : "anonymous";
    await saveLastScreen(hash, route);
  });

  figma.showUI(__html__, {
    width: PLUGIN_WIDTH,
    height: 360,
    themeColors: true,
  });
}

run();
