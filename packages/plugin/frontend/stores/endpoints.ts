import { proxy } from "valtio";

export interface EndpointsState {
  mcp: {
    selectedMode: "local" | "remote";
    local: {
      defaultUrl: string;
      userUrl: string | null;
    };
    remote: {
      defaultUrl: string;
      userUrl: string | null;
    };
  };
  websocket: {
    selectedMode: "local" | "remote";
    local: {
      defaultUrl: string;
      userUrl: string | null;
    };
    remote: {
      defaultUrl: string;
      userUrl: string | null;
    };
  };
}

export const endpointsStore = proxy<EndpointsState>({
  mcp: {
    selectedMode: "local",
    local: {
      defaultUrl: __MCP_LOCAL_URL__,
      userUrl: null,
    },
    remote: {
      defaultUrl: __MCP_REMOTE_URL__,
      userUrl: null,
    },
  },
  websocket: {
    selectedMode: "local",
    local: {
      defaultUrl: __WEBSOCKET_LOCAL_URL__,
      userUrl: null,
    },
    remote: {
      defaultUrl: __WEBSOCKET_REMOTE_URL__,
      userUrl: null,
    },
  },
});
