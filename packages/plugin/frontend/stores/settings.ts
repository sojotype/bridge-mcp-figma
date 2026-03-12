import { proxy, subscribe, useSnapshot } from "valtio";
import type { StoredEndpoints } from "../../lib/events";
import { frontendBroker } from "../lib/frontend-broker";
import { endpointsStore } from "./endpoints";

function toStoredEndpoints(): StoredEndpoints {
  return {
    mcp: {
      routing: endpointsStore.mcp.routing,
      user: { ...endpointsStore.mcp.user },
    },
    websocket: {
      routing: endpointsStore.websocket.routing,
      user: { ...endpointsStore.websocket.user },
    },
  };
}

interface SettingsState {
  persistSettings: boolean;
}

export const settingsStore = proxy<SettingsState>({
  persistSettings: true,
});

let isListening = false;

function ensureSettingsListener() {
  if (isListening) {
    return;
  }
  isListening = true;

  frontendBroker.on("initialSettings", (data) => {
    if (data?.persistSettings !== undefined) {
      settingsStore.persistSettings = data.persistSettings;
    }
    const endpoints = data?.endpoints as StoredEndpoints | undefined;
    if (endpoints) {
      endpointsStore.mcp.routing = endpoints.mcp.routing;
      endpointsStore.mcp.user = endpoints.mcp.user;
      endpointsStore.websocket.routing = endpoints.websocket.routing;
      endpointsStore.websocket.user = endpoints.websocket.user;
    }
  });

  frontendBroker.on("persistSettings", (data) => {
    const d = data as { persistSettings?: boolean };
    if (d?.persistSettings !== undefined) {
      settingsStore.persistSettings = d.persistSettings;
    }
  });

  subscribe(endpointsStore, () => {
    frontendBroker.post("saveEndpoints", toStoredEndpoints());
  });
}

export function useSettings() {
  ensureSettingsListener();
  return useSnapshot(settingsStore);
}
