import type { StoredEndpoints } from "../../lib/events";
import { generateUUID } from "../../lib/uuid";

const STORAGE_PREFIX = "C2F_";

export interface UserPluginData {
  sessions: Record<string, string>;
  persistSettings?: boolean;
  endpoints?: StoredEndpoints;
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
  return {
    sessions: sessions as Record<string, string>,
    persistSettings:
      data.persistSettings === undefined
        ? undefined
        : Boolean(data.persistSettings),
    endpoints: data.endpoints as StoredEndpoints | undefined,
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
  fileKey: string,
  userHash: string
): Promise<string> {
  const data = await loadUserData(userHash);
  const existing = data?.sessions?.[fileKey];
  if (existing && typeof existing === "string") {
    return existing;
  }
  const sessionId = `room_${generateUUID()}`;
  const sessions = { ...(data?.sessions ?? {}), [fileKey]: sessionId };
  await saveUserData(userHash, { ...data, sessions });
  return sessionId;
}

export async function loadPersistSettings(userHash: string): Promise<boolean> {
  const data = await loadUserData(userHash);
  return data?.persistSettings === undefined
    ? true
    : Boolean(data.persistSettings);
}

export async function loadEndpoints(
  userHash: string
): Promise<StoredEndpoints | null> {
  const data = await loadUserData(userHash);
  const endpoints = data?.endpoints;
  if (!endpoints || typeof endpoints !== "object") {
    return null;
  }
  const mcp = endpoints.mcp;
  const websocket = endpoints.websocket;
  if (!(mcp && websocket)) {
    return null;
  }
  return { mcp, websocket };
}

export async function setPersistSettings(
  userHash: string,
  persist: boolean
): Promise<void> {
  const data = await loadUserData(userHash);
  if (persist) {
    await saveUserData(userHash, {
      sessions: data?.sessions ?? {},
      persistSettings: true,
      endpoints: data?.endpoints,
      lastScreen: data?.lastScreen,
    });
  } else {
    await saveUserData(userHash, {
      sessions: data?.sessions ?? {},
      lastScreen: data?.lastScreen,
    });
  }
}

export async function saveEndpoints(
  userHash: string,
  endpoints: StoredEndpoints
): Promise<void> {
  const persist = await loadPersistSettings(userHash);
  if (!persist) {
    return;
  }
  const data = await loadUserData(userHash);
  await saveUserData(userHash, {
    sessions: data?.sessions ?? {},
    persistSettings: true,
    endpoints,
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
  if (data?.persistSettings !== false) {
    await saveUserData(userHash, {
      sessions: data?.sessions ?? {},
      persistSettings: true,
      endpoints: data?.endpoints,
      lastScreen: route,
    });
  } else {
    await saveUserData(userHash, {
      sessions: data?.sessions ?? {},
      lastScreen: route,
    });
  }
}
