const USER_HASH_SALT = "figma-mcp-bridge-v1";

/**
 * Deterministic hash of Figma user id for use in config and network.
 * Same user always gets the same hash; raw userId is never sent.
 */
export async function computeUserHash(userId: string): Promise<string> {
  const data = new TextEncoder().encode(userId + USER_HASH_SALT);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = new Uint8Array(hashBuffer);
  return Array.from(hashArray)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
