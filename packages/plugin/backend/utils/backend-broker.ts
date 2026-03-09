/**
 * Broker for backend → frontend communication.
 * Backend uses this to post messages to the UI iframe and to listen for messages from it.
 */

export type BackendBrokerPayload =
  | { event: "connect"; data: { host: string; room: string } }
  | { event: "send"; data: string }
  | { event: "connected"; data: { sessionId: string; userHash: string } }
  | { event: "disconnected"; data?: undefined }
  | { event: "registered"; data?: { userHash?: string } }
  | { event: "alreadyActive"; data?: undefined }
  | { event: "error"; data: { error: string } };

const post = (event: string, data?: unknown) => {
  figma.ui.postMessage({ event, data });
};

/**
 * Registers a single handler for all messages from the frontend.
 * Figma may pass the payload directly (content of pluginMessage), not wrapped.
 */
const listen = (callback: (event: string, data: unknown) => void) => {
  figma.ui.onmessage = (msg: {
    pluginMessage?: { event: string; data?: unknown };
    event?: string;
    data?: unknown;
  }) => {
    const m = msg.pluginMessage ?? msg;
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
};

export const backendBroker = { post, listen };
