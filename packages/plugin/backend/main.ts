import type { ToolsParams } from "@bridge-mcp-figma/api";
import { obfuscateId } from "../lib/obfuscated";
import { PLUGIN_WIDTH } from "./const";
import { handleMessage } from "./handlers/imperative";
import { backendBroker } from "./utils/backend-broker";
import {
  getOrCreateFileId,
  getSessionId,
  loadLastScreen,
  loadUserPort,
  saveLastScreen,
  saveUserPort,
} from "./utils/plugin-storage";
import { resizeUi } from "./utils/resize-ui";

const REGISTER_RETRY_MS = 30_000;

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
  if (msg.type === "duplicateSessionServer") {
    return { post: { type: "duplicateSessionServer" } };
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

function handleRequestConnect(port: number): void {
  const effectivePort =
    typeof port === "number" && Number.isFinite(port)
      ? port
      : Number.parseInt(__WEBSOCKET_PORT__, 10) || 8766;
  const wsUrl = `ws://localhost:${effectivePort}`;
  console.log("[bridge] requestConnect, sending connect", { host: wsUrl });
  backendBroker.post("connecting");
  backendBroker.post("connect", { host: wsUrl });
}

async function sendInitialSettings(userHash: string): Promise<void> {
  const [userPort, lastScreen] = await Promise.all([
    loadUserPort(userHash),
    loadLastScreen(userHash),
  ]);
  backendBroker.post("initialSettings", {
    userPort: userPort ?? undefined,
    lastScreen: lastScreen ?? undefined,
  });
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
  sendToSocket: SendToSocket,
  takeOverPending: boolean,
  clearTakeOver: () => void
): string | null {
  console.log("[bridge] WebSocket open (via UI)");
  const user = figma.currentUser;
  if (!user?.id) {
    console.warn("[bridge] wsOpened but not signed in");
    backendBroker.post("error", { error: "Not signed in to Figma" });
    return null;
  }
  const userHash = obfuscateId(user.id);
  console.log("[bridge] sending register after wsOpened", {
    takeOver: takeOverPending,
  });
  sendToSocket(
    JSON.stringify({
      type: "register",
      userHash,
      fileRootId,
      userName: user.name,
      takeOver: takeOverPending,
    })
  );
  clearTakeOver();
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

interface PostPayload {
  type: string;
  userHash?: string;
  error?: string;
  sessionsCount?: number;
}

function emitPostMessage(
  p: PostPayload,
  handled: { clearRetry?: boolean },
  msgData: { sessionId?: string },
  sessionId: string,
  onRegistered?: () => void
): void {
  if (p.type === "registered") {
    if (handled.clearRetry) {
      backendBroker.post("connected", {
        sessionId: msgData.sessionId ?? sessionId,
        userHash: p.userHash ?? "",
        sessionsCount: p.sessionsCount,
      });
      onRegistered?.();
    } else {
      backendBroker.post("registered", {
        userHash: "",
        sessionsCount: p.sessionsCount,
      });
    }
  } else if (p.type === "duplicateSessionServer") {
    backendBroker.post("duplicateSessionServer");
    backendBroker.post("closeSocket");
  } else if (p.type === "error") {
    backendBroker.post("connectionError", {
      error: p.error ?? "Unknown error",
    });
  }
}

function handleWsMessage(
  raw: string,
  sendToSocket: SendToSocket,
  registerRetryTimer: ReturnType<typeof setInterval> | null,
  lastUserHash: string | null,
  sendRegister: () => void,
  sessionId: string,
  onRegistered?: () => void
): ReturnType<typeof setInterval> | null | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return undefined;
  }
  const msgData = parsed as { type?: string; [k: string]: unknown };
  if (msgData.type === "takenOver") {
    figma.closePlugin();
    return undefined;
  }
  if (msgData.type === "takenOverGraceful") {
    const graceSeconds = (msgData.graceSeconds as number) ?? 5;
    backendBroker.post("closingGraceful", { secondsRemaining: graceSeconds });
    setTimeout(() => {
      figma.closePlugin();
    }, graceSeconds * 1000);
    return undefined;
  }
  if (
    msgData.type === "registered" ||
    msgData.type === "sessionsCountUpdate" ||
    msgData.type === "duplicateSessionServer" ||
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
    emitPostMessage(
      handled.post as PostPayload,
      handled,
      msgData as { sessionId?: string },
      sessionId,
      onRegistered
    );
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
  let takeOverPending = false;
  let takeOverSent = false;

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

  backendBroker.on("ready", () => {
    handleReady(userHash);
  });

  backendBroker.on("takeOver", (data) => {
    takeOverPending = true;
    const port = (data as { port?: number })?.port;
    handleRequestConnect(
      typeof port === "number" && Number.isFinite(port)
        ? port
        : Number.parseInt(__WEBSOCKET_PORT__, 10) || 8766
    );
  });

  backendBroker.on("requestConnect", (data) => {
    const port = (data as { port?: number })?.port;
    if (typeof port !== "number" || !Number.isFinite(port)) {
      backendBroker.post("connectionError", {
        error: "Invalid port for requestConnect",
      });
      return;
    }
    handleRequestConnect(port);
  });

  backendBroker.on("getUserHash", async (data) => {
    const hash = await handleGetUserHash(data);
    if (hash) {
      lastUserHash = hash;
    }
  });

  backendBroker.on("wsOpened", async () => {
    const hash = await handleWsOpened(
      sessionId,
      fileRootId,
      sendToSocket,
      takeOverPending,
      () => {
        const wasTakeOver = takeOverPending;
        takeOverPending = false;
        if (wasTakeOver) {
          takeOverSent = true;
        }
      }
    );
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
      sessionId,
      () => {
        if (takeOverSent) {
          backendBroker.post("takeOverComplete");
          takeOverSent = false;
        }
      }
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

  backendBroker.on("saveUserPort", async (data) => {
    const port = (data as { port?: number | null })?.port;
    if (port !== null && (typeof port !== "number" || !Number.isFinite(port))) {
      return;
    }
    const u = figma.currentUser;
    const hash = u?.id ? obfuscateId(u.id) : "anonymous";
    await saveUserPort(hash, port ?? null);
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
