import { Activity } from "react";
import { useSnapshot } from "valtio";
import { ROUTES } from "../../routes";
import { endpointsStore } from "../../stores/endpoints";
import { Callout } from "../ui/callout";
import { Gradient } from "../ui/gradient";
import { Indicator } from "../ui/indicator";
import { Input } from "../ui/input";

export default function WebSocketScreen({
  route,
}: {
  route: keyof typeof ROUTES;
}) {
  const endpoints = useSnapshot(endpointsStore);
  const mode = endpoints.websocket.selectedMode;

  const selectedEndpoint = endpoints.websocket[mode];
  const selectedUrl = selectedEndpoint.userUrl ?? selectedEndpoint.defaultUrl;
  const selectedInputState =
    selectedEndpoint.userUrl == null ? "default" : "user";

  const handleUrlChange = (nextValue: string) => {
    endpointsStore.websocket[mode].userUrl = nextValue;
  };

  const handleUrlSubmit = (nextValue: string) => {
    const normalizedValue = nextValue.trim();
    const normalizedDefault = selectedEndpoint.defaultUrl.trim();

    endpointsStore.websocket[mode].userUrl =
      normalizedValue === "" || normalizedValue === normalizedDefault
        ? null
        : nextValue;
  };

  const handleUrlReset = () => {
    endpointsStore.websocket[mode].userUrl = null;
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

        <p className="px-3 pt-3 text-title text-neutral-11">
          Choose Local or Remote to configure your connection. Override the
          default address to use your own server.
        </p>

        <div className="flex flex-col gap-2 px-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              className={`flex h-6 items-center gap-1 overflow-hidden rounded px-2 text-body font-medium transition-[background-color,box-shadow,color] duration-300 ease-out ${
                mode === "local"
                  ? "bg-neutral-1 text-neutral-12 shadow-[inset_0_0_0_1px_var(--color-neutral-a-5)]"
                  : "bg-neutral-4 text-neutral-11 shadow-[inset_0_0_0_1px_var(--color-neutral-a-3)]"
              }`}
              onClick={() => {
                endpointsStore.websocket.selectedMode = "local";
              }}
              type="button"
            >
              <span>Local</span>
              <Indicator variant={mode === "local" ? "connecting" : "online"} />
            </button>
            <button
              className={`flex h-6 items-center gap-1 overflow-hidden rounded px-2 text-body font-medium transition-[background-color,box-shadow,color] duration-300 ease-out ${
                mode === "remote"
                  ? "bg-neutral-1 text-neutral-12 shadow-[inset_0_0_0_1px_var(--color-neutral-a-5)]"
                  : "bg-neutral-4 text-neutral-11 shadow-[inset_0_0_0_1px_var(--color-neutral-a-3)]"
              }`}
              onClick={() => {
                endpointsStore.websocket.selectedMode = "remote";
              }}
              type="button"
            >
              <span>Remote</span>
              <Indicator variant="offline" />
            </button>
          </div>

          <Input
            className="w-full"
            defaultValue={selectedEndpoint.defaultUrl}
            onReset={handleUrlReset}
            onSubmit={handleUrlSubmit}
            onValueChange={handleUrlChange}
            state={selectedInputState}
            value={selectedUrl}
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
