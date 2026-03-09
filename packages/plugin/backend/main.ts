import type { ToolsParams } from "@bridge-mcp-figma/api";
import { PLUGIN_WIDTH } from "backend/const";
import { obfuscateId } from "shared/obfuscated";
import { handleMessage } from "./handlers/utilitarian";
import { backendBroker } from "./utils/backend-broker";
import { getSessionId } from "./utils/get-session-id";
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

  figma.showUI(__html__, {
    width: PLUGIN_WIDTH,
    height: 500,
    themeColors: true,
  });
}

run();
