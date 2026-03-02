/**
 * Polyfills for Web APIs missing in Figma plugin sandbox (main thread).
 * - crypto: getSessionId (randomUUID), computeUserHash (SHA-256)
 * - URLSearchParams: used by partysocket for query strings
 * - TextEncoder: used by computeUserHash for string-to-bytes
 */
import { createHash } from "sha256-uint8array";

function installTextEncoder(): void {
  if (typeof globalThis.TextEncoder !== "undefined") {
    return;
  }
  class TextEncoderPolyfill {
    encode(input: string): Uint8Array {
      const utf8: number[] = [];
      for (let i = 0; i < input.length; i++) {
        let c = input.charCodeAt(i);
        if (c < 0x80) {
          utf8.push(c);
        } else if (c < 0x8_00) {
          utf8.push(0xc0 + Math.floor(c / 0x40), 0x80 + (c % 0x40));
        } else if (c < 0xd8_00 || c >= 0xe0_00) {
          utf8.push(
            0xe0 + Math.floor(c / 0x10_00),
            0x80 + (Math.floor(c / 0x40) % 0x40),
            0x80 + (c % 0x40)
          );
        } else {
          i++;
          c =
            0x1_00_00 +
            ((c % 0x4_00) * 0x4_00 + (input.charCodeAt(i) % 0x4_00));
          utf8.push(
            0xf0 + Math.floor(c / 0x4_00_00),
            0x80 + (Math.floor(c / 0x10_00) % 0x40),
            0x80 + (Math.floor(c / 0x40) % 0x40),
            0x80 + (c % 0x40)
          );
        }
      }
      return new Uint8Array(utf8);
    }
  }
  (globalThis as unknown as { TextEncoder: typeof TextEncoder }).TextEncoder =
    TextEncoderPolyfill as unknown as typeof TextEncoder;
}

function installURLSearchParams(): void {
  if (typeof globalThis.URLSearchParams !== "undefined") {
    return;
  }
  class URLSearchParamsPolyfill {
    private readonly entries: [string, string][] = [];

    constructor(
      init?: Iterable<[string, string]> | Record<string, string> | string
    ) {
      if (init == null) {
        return;
      }
      if (typeof init === "string") {
        this.initFromString(init);
        return;
      }
      if (Symbol.iterator in new Object(init)) {
        this.initFromIterable(init as Iterable<[string, string]>);
        return;
      }
      this.initFromRecord(init as Record<string, string>);
    }

    private initFromString(init: string): void {
      const pairs = init.split("&");
      for (const pair of pairs) {
        const [k, v] = pair.split("=");
        if (k !== undefined) {
          this.entries.push([
            decodeURIComponent(k.replace(/\+/g, " ")),
            v !== undefined ? decodeURIComponent(v.replace(/\+/g, " ")) : "",
          ]);
        }
      }
    }

    private initFromIterable(init: Iterable<[string, string]>): void {
      for (const [k, v] of init) {
        this.entries.push([String(k), String(v)]);
      }
    }

    private initFromRecord(init: Record<string, string>): void {
      for (const k of Object.keys(init)) {
        this.entries.push([k, String(init[k])]);
      }
    }
    toString(): string {
      return this.entries
        .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
        .join("&");
    }
  }
  (
    globalThis as unknown as { URLSearchParams: typeof URLSearchParams }
  ).URLSearchParams =
    URLSearchParamsPolyfill as unknown as typeof URLSearchParams;
}

function randomUUID(): `${string}-${string}-${string}-${string}-${string}` {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === "x" ? r : 0x8 + (r % 0x4);
    return v.toString(16);
  }) as `${string}-${string}-${string}-${string}-${string}`;
}

const subtle = {
  digest(algorithm: string, data: BufferSource): Promise<ArrayBuffer> {
    if (algorithm !== "SHA-256") {
      return Promise.reject(new Error(`Unsupported algorithm: ${algorithm}`));
    }
    const input = data instanceof ArrayBuffer ? new Uint8Array(data) : data;
    const out = createHash().update(input).digest();
    const copy = new Uint8Array(out.length);
    copy.set(out);
    return Promise.resolve(copy.buffer as ArrayBuffer);
  },
};

function install(): void {
  if (typeof globalThis.crypto !== "undefined") {
    if (typeof globalThis.crypto.randomUUID !== "function") {
      (globalThis.crypto as Crypto & { randomUUID: () => string }).randomUUID =
        randomUUID;
    }
    return;
  }
  const polyfill = {
    randomUUID,
    getRandomValues<T extends ArrayBufferView>(array: T): T {
      const view = new Uint8Array(
        array.buffer,
        array.byteOffset,
        array.byteLength
      );
      for (let i = 0; i < view.length; i++) {
        view[i] = Math.floor(Math.random() * 256);
      }
      return array;
    },
    subtle,
  };
  (globalThis as unknown as { crypto: Crypto }).crypto = polyfill as Crypto;
}

export {
  installTextEncoder,
  installURLSearchParams,
  randomUUID,
  subtle,
  install,
};

installTextEncoder();
installURLSearchParams();
install();
