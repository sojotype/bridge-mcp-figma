import { Activity, useEffect, useRef } from "react";
import { copyToClipboard } from "../../lib/copy";
import { tv } from "../../lib/tv";
import { ROUTES } from "../../routes";
import { sessionStore, useSession } from "../../stores/session";
import { useSettings } from "../../stores/settings";
import { Button } from "../ui/button";
import { Callout } from "../ui/callout";
import { Gradient } from "../ui/gradient";
import { Link } from "../ui/link";

const AGENT_CAPABILITIES_URL = "#";
const SERVER_CHECK_INTERVAL_MS = 10_000;
const OFFLINE_RETRY_MS = 3000;
const HEALTH_TIMEOUT_MS = 7000;

async function checkHealth(port: number): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
  try {
    const res = await fetch(`http://localhost:${port}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    const body = (await res.json()) as { ok?: boolean };
    if (res.ok && body?.ok === true) {
      sessionStore.serverStatus = "online";
    } else {
      sessionStore.serverStatus = "offline";
    }
  } catch {
    sessionStore.serverStatus = "offline";
  } finally {
    clearTimeout(timer);
  }
}

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
  const { status, sessionId, sessionsCount, error, serverStatus } =
    useSession();
  const { port } = useSettings();
  const checkIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (route !== ROUTES.SESSION) {
      return;
    }
    const runCheck = () => {
      checkHealth(port).catch(() => undefined);
    };
    runCheck();
    const interval = setInterval(runCheck, SERVER_CHECK_INTERVAL_MS);
    checkIntervalRef.current = interval;

    const retryIfOffline = setInterval(() => {
      if (sessionStore.serverStatus === "offline") {
        runCheck();
      }
    }, OFFLINE_RETRY_MS);

    return () => {
      clearInterval(interval);
      clearInterval(retryIfOffline);
      checkIntervalRef.current = null;
    };
  }, [route, port]);

  const blockVariant = (() => {
    if (status === "disconnected" || status === "connecting") {
      return "disconnected";
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

  const gradientStyles = tv({
    base: [
      "flex h-9 items-center px-3 text-title font-medium text-neutral-11",
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
    base: "w-fit transition-[color,text-decoration-color] duration-300 ease-out",
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
      <section className="relative mt-4 flex h-fit w-full cursor-default">
        <Gradient
          className="flex h-fit w-full shrink-0 grow flex-col gap-4"
          direction="bottom"
          tone={status === "connected" ? "success" : "neutral"}
        >
          <Gradient
            className={gradientStyles({ status })}
            tone={status === "connected" ? "success" : "neutral"}
          >
            {status === "connected" ? "Connected" : "Not Connected"}
          </Gradient>

          <div className="flex flex-col gap-4 px-3">
            {blockVariant === "disconnected" && (
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

            {blockVariant === "single" && status === "connected" && (
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

            {serverStatus === "offline" && (
              <Callout title="MCP server is not running" tone="warning">
                <div className="flex flex-col gap-y-1">
                  <p>Common mistakes:</p>
                  <ul className="flex list-none flex-col gap-y-1 font-normal [&_li::before]:content-['•\00a0']">
                    <li>
                      You have not added the server configuration to the client.
                    </li>
                    <li>You specified the wrong port.</li>
                    <li>
                      The port you specified is in use by another process.
                    </li>
                  </ul>
                </div>
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
        </Gradient>
      </section>
    </Activity>
  );
}
