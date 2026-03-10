import { ScrollArea, Tooltip } from "@base-ui/react";
import { Activity, useEffect, useMemo, useRef, useState } from "react";
import { useRoutingStatus } from "../../hooks/use-routing-status";
import { useSmoothScroll } from "../../hooks/use-smooth-scroll";
import { getNormalizedUrl, useValidUrl } from "../../hooks/use-valid-url";
import { copyToClipboard } from "../../lib/copy";
import { frontendBroker } from "../../lib/frontend-broker";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { Button } from "../ui/button";
import { Gradient } from "../ui/gradient";
import { Input } from "../ui/input";
import { Tabs } from "../ui/tab";

function buildMcpConfig(baseUrl: string, userHash: string) {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set("userHashes", userHash);
    return JSON.stringify(
      {
        mcpServers: {
          "Cursor to Figma": {
            url: url.toString(),
          },
        },
      },
      null,
      2
    );
  } catch {
    return JSON.stringify(
      {
        mcpServers: {
          "Cursor to Figma": {
            url: "Lorem ipsum dolor sit amet...",
          },
        },
      },
      null,
      2
    );
  }
}

export default function MCPScreen({ route }: { route: keyof typeof ROUTES }) {
  const {
    state: endpoint,
    setRouting,
    setUrl,
    setLastSubmittedUrl,
    submitUrl,
    resetUrl,
  } = useEndpoint("mcp");

  const { error, normalizedUrl } = useValidUrl(endpoint.url, endpoint.routing);
  const {
    localStatus,
    remoteStatus,
    localMessage,
    remoteMessage,
    checkForRouting,
  } = useRoutingStatus("mcp");
  const [userHash, setUserHash] = useState<string | null>(null);
  const configViewportRef = useRef<HTMLDivElement>(null);
  useSmoothScroll(configViewportRef);

  useEffect(() => {
    frontendBroker.postAndWait("getUserHash").then((data) => {
      setUserHash(data?.userHash ?? null);
    });
  }, []);

  const mcpConfig = useMemo(
    () =>
      userHash ? buildMcpConfig(normalizedUrl, userHash) : "Loading user hash…",
    [normalizedUrl, userHash]
  );

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

  const handleCopyConfig = () => {
    copyToClipboard(mcpConfig);
  };

  const handleAddToCursor = () => {
    copyToClipboard(mcpConfig);
  };

  return (
    <Activity mode={route === ROUTES.ROOT ? "visible" : "hidden"}>
      <section className="relative flex h-fit w-full shrink-0 grow flex-col pt-4">
        <Gradient
          className="flex h-9 items-center px-3 text-title font-medium text-neutral-12"
          direction="horizontal"
          tone="primary"
        >
          Add an MCP server to the client
        </Gradient>

        <p className="px-3 pt-3 text-title font-normal text-neutral-11">
          Choose a config for Local or Remote server and copy it to your client.
          Optionally, replace the default address with your own.
        </p>

        <div className="flex min-h-0 w-full shrink grow flex-col gap-2 overflow-hidden px-3 pt-2">
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
            className="flex"
            defaultValue={endpoint.defaultUrl}
            error={error}
            onBlur={() => checkForRouting(endpoint.routing)}
            onReset={handleUrlReset}
            onSubmit={handleUrlSubmit}
            onValueChange={handleUrlChange}
            owner={endpoint.owner}
            value={endpoint.url}
          />

          <ScrollArea.Root className="relative flex min-h-0 w-full shrink grow overflow-hidden rounded border border-neutral-6">
            <ScrollArea.Viewport
              className="block size-full overflow-auto px-1.5 py-1 text-mono text-neutral-11"
              ref={configViewportRef}
            >
              <pre className="w-fit min-w-full">
                <code className="w-fit">{mcpConfig}</code>
              </pre>
            </ScrollArea.Viewport>

            <ScrollArea.Scrollbar
              className="pointer-events-none m-1 flex h-1 shrink-0 items-center rounded opacity-0 transition-opacity data-hovering:pointer-events-auto data-hovering:opacity-100 data-hovering:delay-0 data-scrolling:pointer-events-auto data-scrolling:opacity-100 data-scrolling:duration-0"
              orientation="horizontal"
            >
              <ScrollArea.Thumb className="h-full rounded bg-neutral-a-7" />
            </ScrollArea.Scrollbar>
          </ScrollArea.Root>

          <div className="flex h-fit shrink-0 grow items-center gap-2">
            <Button onClick={handleAddToCursor}>Add to Cursor</Button>
            <Button
              aria-label="Copy MCP config"
              className="w-7 px-0"
              iconName="copy"
              onClick={handleCopyConfig}
              showIcon
            />
          </div>
        </div>
      </section>
    </Activity>
  );
}
