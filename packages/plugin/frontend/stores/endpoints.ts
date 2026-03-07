import { proxy } from "valtio";

export interface EndpointsState {
  mcp: {
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
