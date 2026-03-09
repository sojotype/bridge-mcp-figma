/**
 * Broker for backend → frontend communication.
 */

import type {
  BackendToFrontend,
  EventData,
  FrontendToBackend,
} from "../../shared/events";

type OutEvent = BackendToFrontend["event"];
type InEvent = FrontendToBackend["event"];

const listeners = new Map<string, Set<(data: unknown) => void>>();

figma.ui.onmessage = (msg: unknown) => {
  const raw = msg as {
    pluginMessage?: { event: string; data?: unknown };
    event?: string;
    data?: unknown;
  };
  const m = raw.pluginMessage ?? raw;
  if (m && typeof (m as { event?: unknown }).event === "string") {
    const { event, data } = m as { event: string; data?: unknown };
    const set = listeners.get(event);
    if (set) {
      for (const cb of set) {
        cb(data);
      }
    }
  }
};

// ---------------------------------------------------------------------------

/** Post a typed message to the frontend. */
const post = <E extends OutEvent>(
  event: E,
  ...args: EventData<BackendToFrontend, E> extends undefined
    ? []
    : [data: EventData<BackendToFrontend, E>]
): void => {
  figma.ui.postMessage({ event, data: args[0] });
};

/**
 * Register a handler for a specific incoming event.
 * Multiple handlers for the same event are all called.
 * Returns an unsubscribe function.
 *
 * @example
 * backendBroker.on("ready", () => { ... });
 * backendBroker.on("getUserHash", async ({ _correlationId }) => { ... });
 */
const on = <E extends InEvent>(
  event: E,
  callback: (data: EventData<FrontendToBackend, E>) => void | Promise<void>
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

export const backendBroker = { post, on };
