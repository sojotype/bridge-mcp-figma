import { describe, expect, it } from "bun:test";
import { installTextEncoder, randomUUID, subtle } from "../crypto-polyfill";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

function bufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let hex = "";
  for (const byte of bytes) {
    hex += byte.toString(16).padStart(2, "0");
  }
  return hex;
}

describe("crypto polyfill", () => {
  installTextEncoder();

  it("generates a valid v4 UUID", () => {
    const value = randomUUID();
    expect(UUID_V4_REGEX.test(value)).toBe(true);

    const another = randomUUID();
    expect(another).not.toBe(value);
  });

  it("computes correct SHA-256 digest", async () => {
    const encoder = new (
      globalThis as {
        TextEncoder: new () => { encode(input: string): Uint8Array };
      }
    ).TextEncoder();
    const data = encoder.encode("hello world") as unknown as BufferSource;
    const result = await subtle.digest("SHA-256", data);
    const hex = bufferToHex(result);

    // Known SHA-256("hello world")
    expect(hex).toBe(
      "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    );
  });

  it("rejects unsupported algorithms", async () => {
    const encoder = new (
      globalThis as {
        TextEncoder: new () => { encode(input: string): Uint8Array };
      }
    ).TextEncoder();
    const data = encoder.encode("test") as unknown as BufferSource;

    await subtle.digest("MD5", data).then(
      () => {
        throw new Error("Expected subtle.digest to reject for MD5");
      },
      (error) => {
        expect(error).toBeInstanceOf(Error);
        if (error instanceof Error) {
          expect(error.message).toBe("Unsupported algorithm: MD5");
        }
      }
    );
  });
});
