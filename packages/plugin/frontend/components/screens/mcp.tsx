import { Activity, useMemo } from "react";
import { useSnapshot } from "valtio";
import { ROUTES } from "../../routes";
import { endpointsStore } from "../../stores/endpoints";
import { Button } from "../ui/button";
import { Gradient } from "../ui/gradient";
import { Input } from "../ui/input";

type MCPMode = "local" | "remote";

function buildMcpConfig(url: string, mode: MCPMode) {
  const modeLabel = mode === "local" ? "Local" : "Remote";

  return JSON.stringify(
    {
      mcpServers: {
        [`Cursor to Figma: ${modeLabel}`]: {
          url,
        },
      },
    },
    null,
    2
  );
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
  } catch {
    // Clipboard API can be blocked in some Figma desktop contexts.
  }
}

export default function MCPScreen({ route }: { route: keyof typeof ROUTES }) {
  const endpoints = useSnapshot(endpointsStore);
  const mode = endpoints.mcp.selectedMode;

  const selectedEndpoint = endpoints.mcp[mode];
  const selectedUrl = selectedEndpoint.userUrl ?? selectedEndpoint.defaultUrl;
  const selectedInputState =
    selectedEndpoint.userUrl == null ? "default" : "user";

  const mcpConfig = useMemo(
    () => buildMcpConfig(selectedUrl, mode),
    [selectedUrl, mode]
  );

  const handleUrlChange = (nextValue: string) => {
    endpointsStore.mcp[mode].userUrl = nextValue;
  };

  const handleUrlSubmit = (nextValue: string) => {
    const normalizedValue = nextValue.trim();
    const normalizedDefault = selectedEndpoint.defaultUrl.trim();

    endpointsStore.mcp[mode].userUrl =
      normalizedValue === "" || normalizedValue === normalizedDefault
        ? null
        : nextValue;
  };

  const handleUrlReset = () => {
    endpointsStore.mcp[mode].userUrl = null;
  };

  const handleCopyConfig = async () => {
    await copyText(mcpConfig);
  };

  const handleAddToCursor = async () => {
    await copyText(mcpConfig);
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
          <Input
            className="flex"
            defaultValue={selectedEndpoint.defaultUrl}
            onReset={handleUrlReset}
            onSubmit={handleUrlSubmit}
            onValueChange={handleUrlChange}
            state={selectedInputState}
            value={selectedUrl}
          />
          {/* 
        <div className="relative flex min-h-0 w-full shrink grow-0 rounded border border-neutral-6 bg-neutral-2 px-3 py-2">
          <pre className="overflow-x-auto text-[12px] leading-[1.4] text-neutral-11">
            <code>{mcpConfig}</code>
          </pre>
        </div> */}

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
