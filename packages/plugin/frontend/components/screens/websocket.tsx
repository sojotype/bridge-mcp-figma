import { Tooltip } from "@base-ui/react/tooltip";
import { Activity } from "react";
import { useRoutingStatus } from "../../hooks/use-routing-status";
import { getNormalizedUrl, useValidUrl } from "../../hooks/use-valid-url";
import { frontendBroker } from "../../lib/frontend-broker";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { Callout } from "../ui/callout";
import { Gradient } from "../ui/gradient";
import { Input } from "../ui/input";
import { Tabs } from "../ui/tab";

export default function WebSocketScreen({
  route,
}: {
  route: keyof typeof ROUTES;
}) {
  const {
    state: endpoint,
    setRouting,
    setUrl,
    setLastSubmittedUrl,
    submitUrl,
    resetUrl,
  } = useEndpoint("websocket");

  const { error } = useValidUrl(endpoint.url, endpoint.routing);
  const {
    localStatus,
    remoteStatus,
    localMessage,
    remoteMessage,
    checkForRouting,
  } = useRoutingStatus("websocket");

  const handleUrlChange = (nextValue: string) => {
    setUrl(nextValue);
  };

  const handleUrlSubmit = (nextValue: string) => {
    submitUrl(nextValue);
    const normalized = getNormalizedUrl(nextValue.trim(), endpoint.routing);
    setLastSubmittedUrl(endpoint.routing, normalized || null);
    checkForRouting(endpoint.routing);
  };

  const handleUrlReset = () => {
    resetUrl();
    const normalized = getNormalizedUrl(endpoint.defaultUrl, endpoint.routing);
    setLastSubmittedUrl(endpoint.routing, normalized || null);
  };

  return (
    <Activity mode={route === ROUTES.WEBSOCKET ? "visible" : "hidden"}>
      <section className="relative flex h-fit shrink grow-0 flex-col pt-4">
        <Gradient
          className="flex h-9 items-center px-3 text-title font-medium text-neutral-12"
          direction="horizontal"
          tone="primary"
        >
          Customize WebSocket
        </Gradient>

        <p className="px-3 pt-3 text-title font-normal text-neutral-11">
          Choose Local or Remote to configure your connection. Override the
          default address to use your own server.
        </p>

        <div className="flex flex-col gap-2 px-3 pt-2">
          <Tooltip.Provider delay={500} timeout={500}>
            <Tabs.Root
              onValueChange={(value: string) => {
                if (value === "local" || value === "remote") {
                  setRouting(value);
                }
              }}
              value={endpoint.routing}
            >
              <Tabs.List className="flex gap-x-1">
                <Tabs.Item
                  label="Local"
                  onOpenConsole={() => frontendBroker.post("showConsoleHint")}
                  routing="local"
                  state={localStatus ?? "idle"}
                  statusMessage={localMessage}
                  value="local"
                />
                <Tabs.Item
                  label="Remote"
                  routing="remote"
                  state={remoteStatus ?? "idle"}
                  statusMessage={remoteMessage}
                  value="remote"
                />
              </Tabs.List>
            </Tabs.Root>
          </Tooltip.Provider>

          <Input
            className="w-full"
            defaultValue={endpoint.defaultUrl}
            error={error}
            onBlur={() => checkForRouting(endpoint.routing)}
            onReset={handleUrlReset}
            onSubmit={handleUrlSubmit}
            onValueChange={handleUrlChange}
            owner={endpoint.owner}
            value={endpoint.url}
          />

          <Callout title=" " tone="error">
            <p>
              Please specify at least one active WebSocket so that the plugin
              can connect to it.
            </p>
          </Callout>
        </div>
      </section>
    </Activity>
  );
}
