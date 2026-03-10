import { proxy, useSnapshot } from "valtio";

export type EndpointStatus = "online" | "warning" | "offline" | null;

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
    status: {
      local: EndpointStatus;
      remote: EndpointStatus;
    };
    statusMessage: {
      local: string | null;
      remote: string | null;
    };
    /** URL that was actually checked (for debugging / opening in browser) */
    checkedUrl: {
      local: string | null;
      remote: string | null;
    };
    consecutiveFailures: {
      local: number;
      remote: number;
    };
    /** Timestamp of last remote status check (for cache) */
    remoteStatusCheckedAt: number | null;
    /** URL last submitted/checked per routing (for idle-when-editing UX) */
    lastSubmittedUrl: {
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
    status: {
      local: EndpointStatus;
      remote: EndpointStatus;
    };
    statusMessage: {
      local: string | null;
      remote: string | null;
    };
    /** URL that was actually checked (for debugging / opening in browser) */
    checkedUrl: {
      local: string | null;
      remote: string | null;
    };
    consecutiveFailures: {
      local: number;
      remote: number;
    };
    remoteStatusCheckedAt: number | null;
    lastSubmittedUrl: {
      local: string | null;
      remote: string | null;
    };
  };
}

const REMOTE_STATUS_CACHE_MS = 60_000;

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
    status: {
      local: null,
      remote: null,
    },
    statusMessage: {
      local: null,
      remote: null,
    },
    checkedUrl: {
      local: null,
      remote: null,
    },
    consecutiveFailures: {
      local: 0,
      remote: 0,
    },
    remoteStatusCheckedAt: null,
    lastSubmittedUrl: {
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
    status: {
      local: null,
      remote: null,
    },
    statusMessage: {
      local: null,
      remote: null,
    },
    checkedUrl: {
      local: null,
      remote: null,
    },
    consecutiveFailures: {
      local: 0,
      remote: 0,
    },
    remoteStatusCheckedAt: null,
    lastSubmittedUrl: {
      local: null,
      remote: null,
    },
  },
});

export { REMOTE_STATUS_CACHE_MS };

export type EndpointType = keyof EndpointsState;
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
    setLastSubmittedUrl: (routing: EndpointRoutingType, url: string | null) => {
      endpointsStore[type].lastSubmittedUrl[routing] = url;
    },
  };
}
