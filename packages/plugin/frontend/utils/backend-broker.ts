/**
 * Broker for frontend → backend communication.
 * Frontend uses this to post messages to the plugin and to listen for messages from it.
 */

export type BackendBrokerPayload =
  | { event: "ready"; data?: undefined }
  | { event: "wsOpened"; data?: undefined }
  | { event: "wsMessage"; data: string }
  | { event: "wsClosed"; data?: undefined };

const post = (event: string, data?: unknown) => {
  window.parent.postMessage({ pluginMessage: { event, data } }, "*");
};

/**
 * Registers a single handler for all messages from the backend.
 * Messages from plugin arrive as event.data.pluginMessage = { event, data }.
 */
const listen = (callback: (event: string, data: unknown) => void) => {
  const handler = (e: MessageEvent) => {
    const m = e.data?.pluginMessage;
    if (
      m &&
      typeof m === "object" &&
      "event" in m &&
      typeof (m as { event: string }).event === "string"
    ) {
      callback(
        (m as { event: string; data?: unknown }).event,
        (m as { event: string; data?: unknown }).data
      );
    }
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
};

export const backendBroker = { post, listen };
