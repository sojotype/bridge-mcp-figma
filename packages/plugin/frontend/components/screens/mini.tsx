import { Activity } from "react";
import { useNavigate } from "react-router";
import { useRoutingStatus } from "../../hooks/use-routing-status";
import { copyToClipboard } from "../../lib/copy";
import { frontendBroker } from "../../lib/frontend-broker";
import { tv } from "../../lib/tv";
import { wsManager } from "../../lib/ws-manager";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { useSession } from "../../stores/session";
import { Button } from "../ui/button";
import { Callout } from "../ui/callout";
import { Gradient } from "../ui/gradient";

interface MiniScreenProps {
  route: keyof typeof ROUTES;
}

const gradientStyles = tv({
  base: [
    "flex flex-1 items-center gap-2 p-3 text-title font-medium text-neutral-11",
    "transition-[color] duration-300 ease-out",
  ],
  variants: {
    status: {
      connected: "text-success-11",
      disconnected: "",
      connecting: "",
    },
  },
});

export default function MiniScreen({ route }: MiniScreenProps) {
  const navigate = useNavigate();
  const { status, sessionId, sessionsCount } = useSession();
  const { state: endpoint } = useEndpoint("websocket");
  const { localStatus, remoteStatus } = useRoutingStatus("websocket");

  const selectedWsStatus =
    endpoint.routing === "local" ? localStatus : remoteStatus;
  const showWebSocketCallout = selectedWsStatus !== "online";
  const isWsActive = selectedWsStatus === "online";

  const handleConnect = () => {
    frontendBroker.post("requestConnect");
  };

  const handleDisconnect = () => {
    wsManager.close();
  };

  const handleCopySessionId = () => {
    if (sessionId) {
      copyToClipboard(sessionId);
    }
  };

  const handleFixWebSocket = () => {
    navigate(ROUTES.WEBSOCKET);
  };

  const isConnectDisabled =
    status === "connecting" || (status === "disconnected" && !isWsActive);

  return (
    <Activity mode={route === ROUTES.MINI ? "visible" : "hidden"}>
      <div className="flex flex-col gap-2 pt-3">
        {showWebSocketCallout && (
          <Callout title=" " tone="error">
            <p>
              Please specify at least one active WebSocket so that the plugin
              can connect to it.
            </p>
            <Button onClick={handleFixWebSocket} tone="error" variant="alpha">
              Fix
            </Button>
          </Callout>
        )}
        <div className="flex items-center gap-x-2">
          <Gradient
            className={gradientStyles({ status })}
            tone={status === "connected" ? "success" : "neutral"}
          >
            <span className="flex w-full">
              {status === "connected"
                ? `Connected to ${endpoint.url}`
                : "Not Connected"}
            </span>
            {sessionsCount > 1 && sessionId && (
              <Button
                aria-label="Copy session ID"
                className="size-7 px-0"
                iconName="copy"
                onClick={handleCopySessionId}
                showIcon
                tone="success"
                variant="alpha"
              />
            )}
            {status === "connected" && (
              <Button
                aria-label="Disconnect"
                className="rounded"
                iconName="plugsDisconnected"
                onClick={handleDisconnect}
                showIcon
                tone="error"
                variant="alpha"
              />
            )}
            {status !== "connected" && (
              <Button
                aria-label={status === "connecting" ? "Connecting" : "Connect"}
                className="rounded"
                disabled={isConnectDisabled}
                iconName="plugsConnected"
                onClick={handleConnect}
                showIcon
                tone={isWsActive ? "primary" : "neutral"}
                variant="alpha"
              />
            )}
          </Gradient>
        </div>
      </div>
    </Activity>
  );
}
