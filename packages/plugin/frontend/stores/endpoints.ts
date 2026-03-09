import { proxy, useSnapshot } from "valtio";

export interface EndpointsState {
  mcp: {
    routing: "local" | "remote";
    default: {
      local: string;
      remote: string;
    };
    user: {
      local: string | null;
      remote: string | null;
    };
  };
  websocket: {
    routing: "local" | "remote";
    default: {
      local: string;
      remote: string;
    };
    user: {
      local: string | null;
      remote: string | null;
    };
  };
}

export const endpointsStore = proxy<EndpointsState>({
  mcp: {
    routing: "local",
    default: {
      local: __MCP_LOCAL_URL__,
      remote: __MCP_REMOTE_URL__,
    },
    user: {
      local: null,
      remote: null,
    },
  },
  websocket: {
    routing: "local",
    default: {
      local: __WEBSOCKET_LOCAL_URL__,
      remote: __WEBSOCKET_REMOTE_URL__,
    },
    user: {
      local: null,
      remote: null,
    },
  },
});

type EndpointType = keyof EndpointsState;
type EndpointRoutingType = EndpointsState["mcp"]["routing"];

export function useEndpoint(type: EndpointType) {
  const snap = useSnapshot(endpointsStore);
  const routing = snap[type].routing;
  const userUrl = snap[type].user[routing];
  const defaultUrl = snap[type].default[routing];
  const url = userUrl ?? defaultUrl;
  const owner: "default" | "user" = userUrl == null ? "default" : "user";

  return {
    state: {
      routing,
      owner,
      url,
      defaultUrl,
    },
    setRouting: (routing: EndpointRoutingType) => {
      endpointsStore[type].routing = routing;
    },
    setUrl: (nextUrl: string) => {
      const currentRoute = endpointsStore[type].routing;
      endpointsStore[type].user[currentRoute] = nextUrl;
    },
    submitUrl: (nextUrl: string) => {
      const currentRoute = endpointsStore[type].routing;
      const normalizedValue = nextUrl.trim();
      const normalizedDefault =
        endpointsStore[type].default[currentRoute].trim();

      endpointsStore[type].user[currentRoute] =
        normalizedValue === "" || normalizedValue === normalizedDefault
          ? null
          : nextUrl;
    },
    resetUrl: () => {
      const currentRoute = endpointsStore[type].routing;
      endpointsStore[type].user[currentRoute] = null;
    },
  };
}
