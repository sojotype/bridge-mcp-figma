/**
 * Sends a tool invocation to the Figma plugin via the PartyKit bridge.
 * PartyKit forwards the command to the plugin WebSocket and returns the result.
 * When sessionId is omitted, uses the registry to resolve by userHashes and invoke.
 */

const PARTYKIT_PARTY_NAME = "websocket";
const REGISTRY_PARTY_NAME = "registry";
const REGISTRY_ROOM_ID = "sessions";

export interface BridgeOptions {
  /** PartyKit host (e.g. figma-mcp-bridge.yourname.partykit.dev). */
  host: string;
  /** Secret from BRIDGE_SECRET env, must match PartyKit server config. */
  secret: string;
  /** Room id — must match the session id the plugin connected with. Omit to resolve by userHashes. */
  sessionId?: string;
  /** User hashes from MCP URL (e.g. userHashes=hash1;hash2). Used when sessionId is omitted. */
  userHashes?: string[];
}

/**
 * Invokes a tool in the Figma plugin via the bridge (PartyKit HTTP → plugin WebSocket).
 * If options.sessionId is set, POSTs to the websocket room; otherwise POSTs to registry with action "invoke".
 * Returns the result from the plugin or throws on error/timeout.
 */
export async function invokeViaBridge(
  tool: string,
  args: unknown,
  options: BridgeOptions
): Promise<unknown> {
  const { host, secret } = options;
  const sessionId = options.sessionId;
  const userHashes = options.userHashes ?? [];

  if (sessionId) {
    return await invokeDirect(tool, args, { host, secret, sessionId });
  }
  if (userHashes.length === 0) {
    throw new Error(
      "Either sessionId or userHashes (from MCP URL) is required to invoke the bridge."
    );
  }
  return await invokeViaRegistry(tool, args, { host, secret, userHashes });
}

async function invokeDirect(
  tool: string,
  args: unknown,
  options: { host: string; secret: string; sessionId: string }
): Promise<unknown> {
  const { host, sessionId, secret } = options;
  const url = `https://${host}/parties/${PARTYKIT_PARTY_NAME}/${sessionId}`;
  const commandId = crypto.randomUUID();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      commandId,
      tool,
      args,
      secret,
    }),
  });

  const data = (await res.json()) as { result?: unknown; error?: string };

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Bridge: unauthorized (check BRIDGE_SECRET)");
    }
    if (res.status === 503) {
      throw new Error("Bridge: plugin not connected to this session");
    }
    throw new Error(data.error ?? `Bridge error: ${res.status}`);
  }

  if (data.error) {
    throw new Error(data.error);
  }

  return data.result;
}

async function invokeViaRegistry(
  tool: string,
  args: unknown,
  options: { host: string; secret: string; userHashes: string[] }
): Promise<unknown> {
  const { host, secret, userHashes } = options;
  const url = `https://${host}/parties/${REGISTRY_PARTY_NAME}/${REGISTRY_ROOM_ID}`;
  const commandId = crypto.randomUUID();

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "invoke",
      userHashes,
      commandId,
      tool,
      args,
      secret,
    }),
  });

  const data = (await res.json()) as {
    result?: unknown;
    error?: string;
    code?: string;
    sessions?: Array<{ roomId: string; fileName?: string; userName?: string }>;
  };

  if (
    res.status === 409 &&
    data.code === "MULTIPLE_SESSIONS" &&
    data.sessions?.length
  ) {
    throw new Error(
      `Multiple sessions for this user. Pass sessionId (e.g. ${data.sessions[0].roomId}) or use the desired file. Sessions: ${JSON.stringify(data.sessions)}`
    );
  }
  if (res.status === 503 && data.code === "NO_SESSIONS") {
    throw new Error(
      "No active plugin sessions for this user. Open the Figma plugin in a file and connect."
    );
  }
  if (!res.ok) {
    throw new Error(data.error ?? `Registry error: ${res.status}`);
  }
  if (data.error) {
    throw new Error(data.error);
  }
  return data.result;
}

/**
 * Resolves active sessions for the given user hashes (from registry).
 * Returns list of sessions; useful when you need to let the user choose.
 */
export async function resolveSessions(
  host: string,
  userHashes: string[],
  secret: string
): Promise<
  Array<{
    roomId: string;
    fileKey: string;
    fileName?: string;
    userName?: string;
  }>
> {
  const url = `https://${host}/parties/${REGISTRY_PARTY_NAME}/${REGISTRY_ROOM_ID}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "resolve", userHashes, secret }),
  });
  if (!res.ok) {
    throw new Error(`Resolve failed: ${res.status}`);
  }
  const data = (await res.json()) as {
    sessions?: Array<{
      roomId: string;
      fileKey: string;
      fileName?: string;
      userName?: string;
    }>;
  };
  return data.sessions ?? [];
}
