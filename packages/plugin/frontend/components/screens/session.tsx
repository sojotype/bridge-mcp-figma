import { Activity } from "react";
import { useNavigate } from "react-router";
import { useRoutingStatus } from "../../hooks/use-routing-status";
import { copyToClipboard } from "../../lib/copy";
import { tv } from "../../lib/tv";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { useSession } from "../../stores/session";
import { Button } from "../ui/button";
import { Callout } from "../ui/callout";
import { Gradient } from "../ui/gradient";
import { Link } from "../ui/link";

const AGENT_CAPABILITIES_URL = "#";

function formatConnectionError(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes("econnrefused") || lower.includes("connection refused")) {
    return "Server unavailable";
  }
  if (lower.includes("etimedout") || lower.includes("timeout")) {
    return "Connection timed out";
  }
  if (lower.includes("net::err_") || lower.includes("network error")) {
    return "Network error";
  }
  if (lower.includes("401") || lower.includes("unauthorized")) {
    return "Authentication failed";
  }
  if (lower.includes("websocket") || lower.includes("ws ")) {
    return "Connection failed";
  }
  return "Connection failed";
}

export default function SessionScreen({
  route,
}: {
  route: keyof typeof ROUTES;
}) {
  const navigate = useNavigate();
  const { status, sessionId, sessionsCount, error } = useSession();
  const { state: endpoint } = useEndpoint("websocket");
  const { localStatus, remoteStatus } = useRoutingStatus("websocket");

  const selectedWsStatus =
    endpoint.routing === "local" ? localStatus : remoteStatus;
  const showWebSocketCallout = selectedWsStatus !== "online";

  const blockVariant = (() => {
    if (status === "disconnected") {
      return "notConnected";
    }
    if (sessionsCount > 1) {
      return "multiple";
    }
    return "single";
  })();

  const handleCopySessionId = () => {
    if (sessionId) {
      copyToClipboard(sessionId);
    }
  };

  const handleFixWebSocket = () => {
    navigate(ROUTES.WEBSOCKET);
  };

  const statusGradientStyles = tv({
    base: [
      "absolute inset-0 z-0 bg-linear-to-b from-success-5 to-neutral-4 grayscale-100",
      "transition-[filter] duration-300 ease-out",
    ],
    variants: {
      status: {
        connected: "grayscale-0",
        disconnected: "",
        connecting: "",
      },
    },
  });
  const gradientStyles = tv({
    base: [
      "flex h-9 items-center px-3 text-title font-medium text-neutral-11 grayscale-100",
      "transition-[filter,color] duration-300 ease-out",
    ],
    variants: {
      status: {
        connected: "text-success-11 grayscale-0",
        disconnected: "",
        connecting: "",
      },
    },
  });

  const textBodyStyles = tv({
    base: [
      "text-body text-neutral-11 transition-[color] duration-300 ease-out",
    ],
    variants: {
      status: {
        connected: "text-success-12",
        disconnected: "",
        connecting: "",
      },
    },
  });

  const linkStyles = tv({
    base: "transition-[color,text-decoration-color] duration-300 ease-out",
    variants: {
      status: {
        connected: "text-success-11 hover:decoration-success-a-11",
        disconnected: "text-primary-11 hover:decoration-primary-a-11",
        connecting: "text-primary-11 hover:decoration-primary-a-11",
      },
    },
  });

  return (
    <Activity mode={route === ROUTES.SESSION ? "visible" : "hidden"}>
      <section className="relative mt-4 flex h-fit w-full overflow-hidden">
        <div className={statusGradientStyles({ status })} />
        <div className="z-1 flex h-fit w-full shrink-0 grow flex-col gap-4">
          <Gradient
            className={gradientStyles({ status })}
            direction="horizontal"
            tone={status === "connected" ? "success" : "neutral"}
          >
            {status === "connected" ? "Connected" : "Not Connected"}
          </Gradient>

          <div className="flex flex-col gap-4 px-3">
            {blockVariant === "notConnected" && (
              <div className="flex flex-col gap-2">
                <p className={textBodyStyles({ status })}>
                  Connect to get started.
                </p>
                <Link
                  className={linkStyles({ status })}
                  href={AGENT_CAPABILITIES_URL}
                  showIcon
                  target="_blank"
                >
                  See what the agent can do
                </Link>
              </div>
            )}

            {blockVariant === "single" && (
              <div className="flex flex-col gap-2">
                <p className={textBodyStyles({ status })}>
                  You're all set — open your AI client and start working with
                  the file.
                </p>
                <Link
                  className={linkStyles({ status })}
                  href={AGENT_CAPABILITIES_URL}
                  showIcon
                  target="_blank"
                >
                  See what the agent can do
                </Link>
              </div>
            )}

            {blockVariant === "multiple" && (
              <div className="flex flex-col gap-2">
                <p className={textBodyStyles({ status })}>
                  Multiple sessions detected. The agent will ask you to pick
                  one, or you can provide the session ID manually.
                </p>
                <Link
                  className={linkStyles({ status })}
                  href={AGENT_CAPABILITIES_URL}
                  showIcon
                  target="_blank"
                >
                  See what the agent can do
                </Link>
              </div>
            )}

            {blockVariant === "multiple" && sessionId && (
              <div className="flex flex-col gap-2">
                <div className="flex items-end justify-end gap-2 rounded border border-success-a-4 bg-success-a-2 p-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-caption text-[rem(10)] font-medium text-success-11">
                      SESSION ID
                    </p>
                    <p className="truncate text-body text-success-11">
                      {sessionId}
                    </p>
                  </div>
                  <Button
                    aria-label="Copy session ID"
                    className="size-7 px-0"
                    iconName="copy"
                    onClick={handleCopySessionId}
                    showIcon
                    tone="success"
                    variant="alpha"
                  />
                </div>
              </div>
            )}

            {showWebSocketCallout && (
              <Callout title=" " tone="error">
                <p>
                  Please specify at least one active WebSocket so that the
                  plugin can connect to it.
                </p>
                <Button
                  onClick={handleFixWebSocket}
                  tone="error"
                  variant="alpha"
                >
                  Fix
                </Button>
              </Callout>
            )}

            {error !== null && (
              <Callout title={formatConnectionError(error)} tone="error">
                <p>
                  Press Cmd+Option+I (Mac) or Ctrl+Alt+I (Win) to open the
                  console for details.
                </p>
              </Callout>
            )}
          </div>
        </div>
      </section>
    </Activity>
  );
}
