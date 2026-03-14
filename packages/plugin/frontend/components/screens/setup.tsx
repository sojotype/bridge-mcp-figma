import { Activity, useEffect, useMemo, useRef, useState } from "react";
import { useSmoothScroll } from "../../hooks/use-smooth-scroll";
import { copyToClipboard } from "../../lib/copy";
import { wsManager } from "../../lib/ws-manager";
import { ROUTES } from "../../routes";
import { useSettings } from "../../stores/settings";
import { Button } from "../ui/button";
import { Gradient } from "../ui/gradient";
import { Link } from "../ui/link";
import { PortInput } from "../ui/port-input";

function buildMcpConfig(port: number) {
  return `{
  "mcpServers": {
    "Cursor to Figma": {
      "command": "bunx",
      "args": ["bridge-mcp-figma"],
      "env": { "WEBSOCKET_PORT": "${port}" }
    }
  }
}`;
}

export default function SetupScreen({ route }: { route: keyof typeof ROUTES }) {
  const { port, defaultPort, owner, setPort, resetPort } = useSettings();
  const [inputValue, setInputValue] = useState("");
  const configViewportRef = useRef<HTMLDivElement>(null);
  useSmoothScroll(configViewportRef);

  useEffect(() => {
    if (owner === "default") {
      setInputValue("");
    } else {
      setInputValue(String(port));
    }
  }, [port, owner]);

  const effectivePort = inputValue === "" ? defaultPort : port;
  const mcpConfig = useMemo(
    () => buildMcpConfig(effectivePort),
    [effectivePort]
  );

  const handleCopyConfig = () => {
    copyToClipboard(mcpConfig);
  };

  const handleAddToCursor = () => {
    copyToClipboard(mcpConfig);
  };

  const handlePortChange = (v: string) => {
    if (v.length > 5) {
      return;
    }
    setInputValue(v);
    if (v === "") {
      handlePortReset();
    } else {
      const parsed = Number.parseInt(v, 10);
      if (!Number.isNaN(parsed) && parsed >= 1 && parsed <= 65_535) {
        wsManager.close();
        setPort(parsed);
      }
    }
  };

  const handlePortReset = () => {
    wsManager.close();
    resetPort();
  };

  return (
    <Activity mode={route === ROUTES.SETUP ? "visible" : "hidden"}>
      <section className="relative mt-4 flex h-fit w-full shrink-0 grow cursor-default flex-col gap-y-3">
        <Gradient
          className="flex h-9 items-center px-3 text-title font-medium text-neutral-12"
          tone="primary"
        >
          Requirements
        </Gradient>

        <p className="px-3 text-title font-normal text-neutral-11">
          -{" "}
          <Link
            href="https://bun.com/docs/installation#installation"
            target="_blank"
          >
            Bun 1.3.5+
          </Link>{" "}
          <br />- Agentic client with MCP support (Cursor, Claude Code, etc.)
        </p>

        <Gradient
          className="mt-1 flex h-9 items-center px-3 text-title font-medium text-neutral-12"
          tone="primary"
        >
          Setup
        </Gradient>

        <div className="flex flex-col gap-y-3 px-3">
          <p className="text-title font-normal text-neutral-11">
            You can specify a different port if the current one is occupied by
            another process
          </p>
          <PortInput
            className="flex"
            max={65_535}
            maxLength={5}
            min={1}
            onReset={handlePortReset}
            onValueChange={handlePortChange}
            owner={owner}
            placeholder={String(defaultPort)}
            type="number"
            value={owner === "default" ? "" : inputValue}
          />

          <div
            className="relative flex w-full rounded border border-neutral-6 px-1.5 py-1 text-mono text-neutral-11"
            ref={configViewportRef}
          >
            <pre className="w-fit min-w-full cursor-auto">
              <code className="w-fit">{mcpConfig}</code>
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
