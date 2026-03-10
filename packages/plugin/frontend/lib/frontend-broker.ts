/**
 * Broker for frontend → backend communication.
 */

import type {
  BackendToFrontend,
  EventData,
  FrontendToBackend,
  RequestResponseMap,
} from "../../lib/events";
import { generateUUID } from "../../lib/uuid";

type OutEvent = FrontendToBackend["event"];
type InEvent = BackendToFrontend["event"];

const listeners = new Map<string, Set<(data: unknown) => void>>();

window.addEventListener("message", (e: MessageEvent) => {
  const m = e.data?.pluginMessage ?? e.data;
  if (m && typeof m?.event === "string") {
    const set = listeners.get(m.event);
    if (set) {
      for (const cb of set) {
        cb(m.data);
      }
    }
  }
});

// ---------------------------------------------------------------------------

/** Post a typed message to the backend. */
const post = <E extends OutEvent>(
  event: E,
  ...args: EventData<FrontendToBackend, E> extends undefined
    ? []
    : [data: EventData<FrontendToBackend, E>]
): void => {
  window.parent.postMessage({ pluginMessage: { event, data: args[0] } }, "*");
};

/**
 * Subscribe to a specific incoming event. Returns an unsubscribe function.
 *
 * @example
 * frontendBroker.on("connected", (data) => { ... });
 */
const on = <E extends InEvent>(
  event: E,
  callback: (data: EventData<BackendToFrontend, E>) => void
): (() => void) => {
  let set = listeners.get(event);
  if (!set) {
    set = new Set();
    listeners.set(event, set);
  }
  const cb = callback as (data: unknown) => void;
  set.add(cb);
  return () => set?.delete(cb);
};

/**
 * Post a request and wait for the corresponding response event.
 * Rejects with a timeout error if no response arrives within `timeoutMs`.
 *
 * @example
 * const { userHash } = await frontendBroker.postAndWait("getUserHash");
 * const { online } = await frontendBroker.postAndWait("checkEndpointStatus", { url, type });
 */
const postAndWait = <E extends keyof RequestResponseMap>(
  event: E & OutEvent,
  data?: E extends "checkEndpointStatus"
    ? { url: string; type: "mcp" | "websocket" }
    : never,
  options: { timeoutMs?: number } = {}
): Promise<EventData<BackendToFrontend, RequestResponseMap[E] & InEvent>> => {
  const requestData = data;
  const { timeoutMs = 5000 } = options;

  const correlationId = generateUUID();
  const responseEvent = (
    {
      getUserHash: "userHash",
      checkEndpointStatus: "endpointStatus",
    } satisfies RequestResponseMap
  )[event] as RequestResponseMap[E] & InEvent;

  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      unsub();
      reject(
        new Error(
          `[frontendBroker] postAndWait("${event}") timed out after ${timeoutMs}ms`
        )
      );
    }, timeoutMs);

    const unsub = on(responseEvent, (data) => {
      const d = data as { _correlationId?: string };
      if (d?._correlationId !== correlationId) {
        return;
      }
      clearTimeout(timer);
      unsub();
      resolve(
        data as EventData<BackendToFrontend, RequestResponseMap[E] & InEvent>
      );
    });

    if (event === "getUserHash") {
      post("getUserHash", { _correlationId: correlationId });
    } else if (
      event === "checkEndpointStatus" &&
      requestData?.url &&
      requestData?.type
    ) {
      post("checkEndpointStatus", {
        url: requestData.url,
        type: requestData.type,
        _correlationId: correlationId,
      });
    }
  });
};

export const frontendBroker = { post, on, postAndWait };
