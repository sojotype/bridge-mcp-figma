import { useMemo } from "react";

const HTTP_PROTOCOL_REGEX = /^https?:\/\//i;
const IPV4_REGEX = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

/** Valid hostname: localhost, 127.0.0.1, domain with TLD, or IP */
function isValidHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase();
  if (lower === "localhost") {
    return true;
  }
  if (lower === "127.0.0.1") {
    return true;
  }
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    return true; // IPv6
  }
  if (IPV4_REGEX.test(hostname)) {
    return true; // IPv4
  }
  if (hostname.includes(".")) {
    return true; // domain (e.g. example.com)
  }
  return false;
}

export function getNormalizedUrl(
  url: string,
  routing: "local" | "remote"
): string {
  return ensureUrlWithProtocol(url.trim(), routing);
}

function ensureUrlWithProtocol(
  url: string,
  routing: "local" | "remote"
): string {
  const trimmed = url.trim();
  if (trimmed === "") {
    return trimmed;
  }
  if (HTTP_PROTOCOL_REGEX.test(trimmed)) {
    return trimmed;
  }
  const protocol = routing === "local" ? "http://" : "https://";
  return protocol + trimmed;
}

export function useValidUrl(url: string, routing: "local" | "remote") {
  return useMemo(() => {
    const normalizedUrl = ensureUrlWithProtocol(url, routing);

    if (normalizedUrl === "") {
      return {
        isValid: false,
        error: "Enter correct URL",
        normalizedUrl: "",
      };
    }

    try {
      const parsed = new URL(normalizedUrl);
      const hasValidProtocol =
        parsed.protocol === "http:" || parsed.protocol === "https:";
      const hasValidHost = isValidHostname(parsed.hostname);
      const isValid = hasValidProtocol && hasValidHost;

      return {
        isValid,
        error: isValid ? null : "Enter correct URL",
        normalizedUrl,
      };
    } catch {
      return {
        isValid: false,
        error: "Enter correct URL",
        normalizedUrl,
      };
    }
  }, [url, routing]);
}
