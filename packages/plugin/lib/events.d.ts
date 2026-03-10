/**
 * Shared event types for frontend ↔ backend communication.
 *
 * Events follow a discriminated union pattern: `{ event: string; data?: T }`.
 * Request-response pairs use `_correlationId` in data to match responses to requests.
 */

/**
 * Events sent from the plugin UI (iframe) to the backend.
 * - ready: UI is mounted and ready
 * - wsOpened/wsMessage/wsClosed: WebSocket lifecycle events
 * - uiResize: UI height changed
 * - getUserHash: Request user hash (response: userHash with _correlationId)
 */
export type FrontendToBackend =
  | { event: "ready" }
  | { event: "wsOpened" }
  | { event: "wsMessage"; data: string }
  | { event: "wsClosed" }
  | { event: "uiResize"; data: { height: number } }
  | { event: "getUserHash"; data: { _correlationId: string } }
  | { event: "showConsoleHint" }
  | {
      event: "checkEndpointStatus";
      data: {
        type: "mcp" | "websocket";
        url: string;
        _correlationId: string;
      };
    };

/**
 * Events sent from the backend to the plugin UI.
 * - connect: Init WebSocket connection params
 * - send: Raw message to forward to WebSocket
 * - connected/disconnected: Session state
 * - registered/alreadyActive/error: Registration/control flow
 * - userHash: Response to getUserHash (includes _correlationId when requested)
 */
export type BackendToFrontend =
  | { event: "connect"; data: { host: string; room: string } }
  | { event: "send"; data: string }
  | { event: "connected"; data: { sessionId: string; userHash: string } }
  | { event: "disconnected" }
  | { event: "registered"; data: { userHash: string } }
  | { event: "alreadyActive" }
  | { event: "userHash"; data: { userHash: string; _correlationId?: string } }
  | { event: "error"; data: { error: string; _correlationId?: string } }
  | {
      event: "endpointStatus";
      data: {
        _correlationId?: string;
        checkedUrl?: string;
        message?: string;
        status: "online" | "warning" | "offline";
      };
    };

/**
 * Extracts the `data` type for a specific event from a union.
 * Returns `undefined` if the event has no data.
 */
export type EventData<
  Union extends { event: string },
  E extends Union["event"],
> = Extract<Union, { event: E }> extends { data: infer D } ? D : undefined;

/**
 * Maps request event → response event for postAndWait.
 * The backend must echo `_correlationId` in the response data for matching.
 */
export interface RequestResponseMap {
  getUserHash: "userHash";
  checkEndpointStatus: "endpointStatus";
}
