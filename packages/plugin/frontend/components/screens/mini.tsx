import { Activity } from "react";
import { copyToClipboard } from "../../lib/copy";
import { frontendBroker } from "../../lib/frontend-broker";
import { tv } from "../../lib/tv";
import { wsManager } from "../../lib/ws-manager";
import { ROUTES } from "../../routes";
import { useSession } from "../../stores/session";
import { useSettings } from "../../stores/settings";
import { Button } from "../ui/button";
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
  const { port } = useSettings();
  const { status, sessionId, sessionsCount } = useSession();
  const isWsActive = true;

  const handleConnect = () => {
    frontendBroker.post("requestConnect", { port });
  };

  const handleDisconnect = () => {
    wsManager.close();
  };

  const handleCopySessionId = () => {
    if (sessionId) {
      copyToClipboard(sessionId);
    }
  };

  const isConnectDisabled =
    status === "connecting" || (status === "disconnected" && !isWsActive);

  return (
    <Activity mode={route === ROUTES.MINI ? "visible" : "hidden"}>
      <div className="flex flex-col gap-2 pt-4">
        <div className="flex items-center gap-x-2">
          <Gradient
            className={gradientStyles({ status })}
            tone={status === "connected" ? "success" : "neutral"}
          >
            <span className="flex w-full">
              {status === "connected" ? "Connected" : "Not Connected"}
            </span>
            {sessionsCount > 1 && sessionId && (
              <Button
                aria-label="Copy session ID"
                className="size-7 px-0"
                iconName="copy"
                onClick={handleCopySessionId}
                showIcon
                showLabel={false}
                tone="success"
                variant="alpha"
              >
                Copy Session ID
              </Button>
            )}
            {status === "connected" && (
              <Button
                aria-label="Disconnect"
                className="rounded"
                iconName="plugsDisconnected"
                onClick={handleDisconnect}
                showIcon
                showLabel={false}
                tone="error"
                variant="alpha"
              >
                Disconnect
              </Button>
            )}
            {status !== "connected" && (
              <Button
                aria-label={status === "connecting" ? "Connecting" : "Connect"}
                className="rounded"
                disabled={isConnectDisabled}
                iconName="plugsConnected"
                onClick={handleConnect}
                showIcon
                showLabel={false}
                tone={isWsActive ? "primary" : "neutral"}
                variant="alpha"
              >
                {status === "connecting" ? "Connecting" : "Connect"}
              </Button>
            )}
          </Gradient>
        </div>
      </div>
    </Activity>
  );
}
