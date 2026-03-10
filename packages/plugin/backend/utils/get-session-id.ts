import { generateUUID } from "../../lib/uuid";

const STORAGE_PREFIX = "session_";

/**
 * Returns session id for the given file, persisting it in clientStorage.
 * Same file gets the same session id across plugin restarts.
 */
export async function getSessionId(fileKey: string): Promise<string> {
  const key = `${STORAGE_PREFIX}${fileKey}`;
  const existing = await figma.clientStorage.getAsync(key);
  if (existing && typeof existing === "string") {
    return existing;
  }
  const sessionId = `room_${generateUUID()}`;
  await figma.clientStorage.setAsync(key, sessionId);
  return sessionId;
}

/**
 * TODO: refactor to getSessionData to get data for specific userHash
 * clientStorage: {
 *   userHash: {
 *     sessionId,
 *     settings: {
 *       ...
 *     },
 *   },
 * }
 */
