import { Tooltip } from "@base-ui/react";
import { Activity, useEffect, useMemo, useState } from "react";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { copyToClipboard } from "../../utils/copy";
import { frontendBroker } from "../../utils/frontend-broker";
import { Button } from "../ui/button";
import { Gradient } from "../ui/gradient";
import { Input } from "../ui/input";
import { Tabs } from "../ui/tab";

function buildMcpConfig(baseUrl: string, userHash: string) {
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
}

export default function MCPScreen({ route }: { route: keyof typeof ROUTES }) {
  const {
    state: endpoint,
    setRouting,
    setUrl,
    submitUrl,
    resetUrl,
  } = useEndpoint("mcp");

  const [userHash, setUserHash] = useState<string | null>(null);

  useEffect(() => {
    frontendBroker.postAndWait("getUserHash").then((data) => {
      setUserHash(data?.userHash ?? null);
    });
  }, []);

  const mcpConfig = useMemo(
    () =>
      userHash ? buildMcpConfig(endpoint.url, userHash) : "Loading user hash…",
    [endpoint.url, userHash]
  );

  const handleUrlChange = (nextValue: string) => {
    setUrl(nextValue);
  };

  const handleUrlSubmit = (nextValue: string) => {
    submitUrl(nextValue);
  };

  const handleUrlReset = () => {
    resetUrl();
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

        <div className="flex min-h-0 w-full shrink grow-0 flex-col gap-2 overflow-hidden px-3 pt-2">
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
                <Tabs.Item label="Local" state="warning" value="local" />
                <Tabs.Item label="Remote" state="warning" value="remote" />
              </Tabs.List>
            </Tabs.Root>
          </Tooltip.Provider>
          <Input
            className="flex"
            defaultValue={endpoint.defaultUrl}
            onReset={handleUrlReset}
            onSubmit={handleUrlSubmit}
            onValueChange={handleUrlChange}
            owner={endpoint.owner}
            value={endpoint.url}
          />

          <div className="relative flex min-h-0 w-full shrink grow-0 rounded border border-neutral-6 px-1.5 py-1">
            <pre className="overflow-x-auto text-mono text-neutral-11">
              <code>{mcpConfig}</code>
            </pre>
          </div>

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
