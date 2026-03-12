/**
 * Shared event types for frontend ↔ backend communication.
 *
 * Events follow a discriminated union pattern: `{ event: string; data?: T }`.
 * Request-response pairs use `_correlationId` in data to match responses to requests.
 */

export interface StoredEndpoints {
  mcp: {
    routing: "local" | "remote";
    user: { local: string | null; remote: string | null };
  };
  websocket: {
    routing: "local" | "remote";
    user: { local: string | null; remote: string | null };
  };
}

/**
 * Events sent from the plugin UI (iframe) to the backend.
 * - ready: UI is mounted and ready
 * - wsOpened/wsMessage/wsClosed: WebSocket lifecycle events
 * - uiResize: UI height changed
 * - getUserHash: Request user hash (response: userHash with _correlationId)
 */
export type FrontendToBackend =
  | { event: "ready" }
  | { event: "requestConnect" }
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
    }
  | { event: "setPersistSettings"; data: { persist: boolean } }
  | { event: "getPersistSettings"; data: { _correlationId: string } }
  | { event: "saveEndpoints"; data: StoredEndpoints }
  | { event: "saveLastScreen"; data: { route: string } };

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
  | { event: "connecting" }
  | { event: "send"; data: string }
  | {
      event: "connected";
      data: { sessionId: string; userHash: string; sessionsCount?: number };
    }
  | { event: "disconnected" }
  | { event: "registered"; data: { userHash?: string; sessionsCount?: number } }
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
    }
  | {
      event: "initialSettings";
      data: {
        persistSettings: boolean;
        endpoints?: StoredEndpoints;
        lastScreen?: string;
      };
    }
  | {
      event: "persistSettings";
      data: { persistSettings: boolean; _correlationId?: string };
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
  getPersistSettings: "persistSettings";
}
