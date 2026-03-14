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
  | { event: "requestConnect"; data: { port: number } }
  | { event: "wsOpened" }
  | { event: "wsMessage"; data: string }
  | { event: "wsClosed" }
  | { event: "uiResize"; data: { height: number } }
  | { event: "getUserHash"; data: { _correlationId: string } }
  | { event: "showConsoleHint" }
  | { event: "saveUserPort"; data: { port: number | null } }
  | { event: "saveLastScreen"; data: { route: string } }
  | { event: "takeOver"; data: { port: number } }
  | { event: "pluginClosing" };

/**
 * Events sent from the backend to the plugin UI.
 * - connect: Init WebSocket connection params
 * - send: Raw message to forward to WebSocket
 * - connected/disconnected: Session state
 * - registered/duplicateSessionServer/closeSocket/error: Registration/control flow
 * - userHash: Response to getUserHash (includes _correlationId when requested)
 */
export type BackendToFrontend =
  | { event: "connect"; data: { host: string } }
  | { event: "connecting" }
  | { event: "send"; data: string }
  | {
      event: "connected";
      data: { sessionId: string; userHash: string; sessionsCount?: number };
    }
  | { event: "disconnected" }
  | { event: "registered"; data: { userHash?: string; sessionsCount?: number } }
  | { event: "duplicateSessionServer" }
  | { event: "userHash"; data: { userHash: string; _correlationId?: string } }
  | { event: "error"; data: { error: string; _correlationId?: string } }
  | {
      event: "connectionError";
      data: { error: string };
    }
  | {
      event: "initialSettings";
      data: {
        userPort?: number;
        lastScreen?: string;
      };
    }
  | { event: "closeSocket" }
  | { event: "takeOverComplete" }
  | { event: "closingGraceful"; data: { secondsRemaining: number } };

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
}
