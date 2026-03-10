import type { ToolsParams } from "@bridge-mcp-figma/api";
import { obfuscateId } from "../lib/obfuscated";
import { PLUGIN_WIDTH } from "./const";
import { handleMessage } from "./handlers/imperative";
import { backendBroker } from "./utils/backend-broker";
import { getSessionId } from "./utils/get-session-id";
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
      post: { type: "registered", userHash: lastUserHash ?? undefined },
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

function handleReady(sessionId: string): void {
  console.log("[bridge] UI ready, sending connect", {
    host: __WEBSOCKET_LOCAL_URL__,
    room: sessionId,
  });
  backendBroker.post("connect", {
    host: __WEBSOCKET_LOCAL_URL__,
    room: sessionId,
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
  sessionId: string,
  fileKey: string,
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
  console.log("[bridge] posting connected to UI", {
    sessionId,
    userHash: `${userHash.slice(0, 8)}…`,
  });
  backendBroker.post("connected", { sessionId, userHash });
  sendToSocket(
    JSON.stringify({
      type: "register",
      userHash,
      fileKey,
      fileName: figma.root.name,
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
  sendRegister: () => void
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
    };
    if (p.type === "registered") {
      backendBroker.post("registered", { userHash: p.userHash ?? "" });
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
  const fileKey = figma.fileKey ?? "local";
  const sessionId = await getSessionId(fileKey);

  let registerRetryTimer: ReturnType<typeof setInterval> | null = null;
  let lastUserHash: string | null = null;

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
        fileKey,
        fileName: figma.root.name,
        userName: user.name,
      })
    );
  }

  backendBroker.on("ready", () => handleReady(sessionId));

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
    const hash = await handleWsOpened(sessionId, fileKey, sendToSocket);
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
      sendRegister
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

  figma.showUI(__html__, {
    width: PLUGIN_WIDTH,
    height: 500,
    themeColors: true,
  });
}

run();
