import { generateUUID } from "../../lib/uuid";

const STORAGE_PREFIX = "C2F_";

export const FILE_UUID_PLUGIN_DATA_KEY = "C2F_file_UUID";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUUID(str: string): boolean {
  return typeof str === "string" && str.length === 36 && UUID_REGEX.test(str);
}

export function getOrCreateFileId(): string {
  const existing = figma.root.getPluginData(FILE_UUID_PLUGIN_DATA_KEY);
  if (existing && isValidUUID(existing)) {
    return existing;
  }
  const uuid = generateUUID();
  figma.root.setPluginData(FILE_UUID_PLUGIN_DATA_KEY, uuid);
  return uuid;
}

export interface UserPluginData {
  sessions: Record<string, string>;
  userPort?: number;
  lastScreen?: string;
}

export function getUserStorageKey(userHash: string): string {
  return `${STORAGE_PREFIX}${userHash}`;
}

export async function loadUserData(
  userHash: string
): Promise<UserPluginData | null> {
  const key = getUserStorageKey(userHash);
  const val = await figma.clientStorage.getAsync(key);
  if (!val || typeof val !== "object") {
    return null;
  }
  const data = val as Record<string, unknown>;
  const sessions = data.sessions;
  if (!sessions || typeof sessions !== "object" || Array.isArray(sessions)) {
    return null;
  }
  const userPort =
    typeof data.userPort === "number" && Number.isFinite(data.userPort)
      ? data.userPort
      : undefined;
  return {
    sessions: sessions as Record<string, string>,
    userPort,
    lastScreen:
      typeof data.lastScreen === "string" ? data.lastScreen : undefined,
  };
}

export async function saveUserData(
  userHash: string,
  data: UserPluginData
): Promise<void> {
  const key = getUserStorageKey(userHash);
  await figma.clientStorage.setAsync(key, data);
}

export async function getSessionId(
  fileRootId: string,
  userHash: string
): Promise<string> {
  const data = await loadUserData(userHash);
  const existing = data?.sessions?.[fileRootId];
  if (existing && typeof existing === "string") {
    return existing;
  }
  const sessionId = `room_${generateUUID()}`;
  const sessions = { ...(data?.sessions ?? {}), [fileRootId]: sessionId };
  await saveUserData(userHash, {
    sessions,
    userPort: data?.userPort,
    lastScreen: data?.lastScreen,
  });
  return sessionId;
}

export async function loadUserPort(userHash: string): Promise<number | null> {
  const data = await loadUserData(userHash);
  const port = data?.userPort;
  if (typeof port === "number" && Number.isFinite(port)) {
    return port;
  }
  return null;
}

export async function saveUserPort(
  userHash: string,
  port: number | null
): Promise<void> {
  const data = await loadUserData(userHash);
  await saveUserData(userHash, {
    sessions: data?.sessions ?? {},
    userPort: port ?? undefined,
    lastScreen: data?.lastScreen,
  });
}

export async function loadLastScreen(userHash: string): Promise<string | null> {
  const data = await loadUserData(userHash);
  const screen = data?.lastScreen;
  return typeof screen === "string" ? screen : null;
}

export async function saveLastScreen(
  userHash: string,
  route: string
): Promise<void> {
  const data = await loadUserData(userHash);
  await saveUserData(userHash, {
    sessions: data?.sessions ?? {},
    userPort: data?.userPort,
    lastScreen: route,
  });
}
