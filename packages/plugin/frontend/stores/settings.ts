import { proxy, subscribe, useSnapshot } from "valtio";
import { frontendBroker } from "../lib/frontend-broker";

export interface SettingsState {
  defaultPort: number;
  userPort: number | null;
  owner: "default" | "user";
}

export const settingsStore = proxy<SettingsState>({
  defaultPort: Number.parseInt(__WEBSOCKET_PORT__, 10) ?? 8766,
  userPort: null,
  owner: "default",
});

let isListening = false;

function ensureSettingsListener() {
  if (isListening) {
    return;
  }
  isListening = true;

  frontendBroker.on("initialSettings", (data) => {
    const userPort = (data as { userPort?: number })?.userPort;
    if (typeof userPort === "number" && Number.isFinite(userPort)) {
      settingsStore.userPort = userPort;
      settingsStore.owner = "user";
    }
  });

  subscribe(settingsStore, () => {
    if (settingsStore.owner === "user") {
      const port = settingsStore.userPort ?? settingsStore.defaultPort;
      frontendBroker.post("saveUserPort", { port });
    } else {
      frontendBroker.post("saveUserPort", { port: null });
    }
  });
}

export function useSettings() {
  ensureSettingsListener();
  const snap = useSnapshot(settingsStore);
  return {
    port: snap.userPort ?? snap.defaultPort,
    defaultPort: snap.defaultPort,
    owner: snap.owner,
    resetPort: () => {
      settingsStore.userPort = null;
      settingsStore.owner = "default";
    },
    setPort: (nextPort: number) => {
      settingsStore.userPort = nextPort;
      settingsStore.owner = "user";
    },
  };
}
