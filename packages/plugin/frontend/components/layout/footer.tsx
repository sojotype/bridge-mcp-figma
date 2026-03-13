import { useLocation, useNavigate } from "react-router";
import { useRoutingStatus } from "../../hooks/use-routing-status";
import { useValidUrl } from "../../hooks/use-valid-url";
import { copyToClipboard } from "../../lib/copy";
import { frontendBroker } from "../../lib/frontend-broker";
import { wsManager } from "../../lib/ws-manager";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { useSession } from "../../stores/session";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { ValidationMessage } from "../utils/validation-message";

interface FooterProps {
  pathname: string;
  route: keyof typeof ROUTES;
}

function RootFooter() {
  const navigate = useNavigate();
  const { state: endpoint } = useEndpoint("mcp");
  const { isValid } = useValidUrl(endpoint.url, endpoint.routing);

  return (
    <footer className="flex w-full items-center justify-between px-3 pt-4 pb-3">
      {!isValid && (
        <ValidationMessage
          message={"Enter correct URL"}
          tone={isValid ? "neutral" : "error"}
        />
      )}
      <Button
        className="ml-auto self-end"
        onClick={() => navigate(ROUTES.WEBSOCKET)}
        tone="neutral"
      >
        Next
      </Button>
    </footer>
  );
}

function WebSocketFooter() {
  const navigate = useNavigate();
  const { state: endpoint } = useEndpoint("websocket");
  const { isValid } = useValidUrl(endpoint.url, endpoint.routing);
  const { localStatus, remoteStatus } = useRoutingStatus("websocket");

  const selectedWsStatus =
    endpoint.routing === "local" ? localStatus : remoteStatus;
  const nextTone = selectedWsStatus === "online" ? "primary" : "neutral";

  return (
    <footer className="flex w-full items-center justify-between px-3 pt-5 pb-3">
      <Button
        className="rotate-180"
        iconName="caretRight"
        onClick={() => navigate(ROUTES.ROOT)}
        showIcon
      />

      {!isValid && (
        <ValidationMessage
          message={"Enter correct URL"}
          tone={isValid ? "neutral" : "error"}
        />
      )}
      <Button onClick={() => navigate(ROUTES.SESSION)} tone={nextTone}>
        Next
      </Button>
    </footer>
  );
}

const GITHUB_URL = "https://github.com/sojotype/bridge-mcp-figma";

const MOCK_LOGS = [
  "2026-03-03T03:38:06.853Z server01 UserService [WARN]: Operation started for user 862",
  "2026-03-01T12:01:02.325Z server01 PaymentGateway [DEBUG]: Operation failed for user 403",
  "2026-02-28T15:06:13.923Z server01 AuthController [DEBUG]: Operation failed for user 935",
  "2026-03-01T16:15:39.062Z server01 UserService [INFO]: Operation pending for user 589",
  "2026-03-06T12:28:21.043Z server01 UserService [ERROR]: Operation pending for user 486",
  "2026-03-01T06:19:17.840Z server01 PaymentGateway [WARN]: Operation failed for user 565",
  "2026-03-06T18:30:03.436Z server01 AuthController [INFO]: Operation started for user 970",
  "2026-03-01T17:56:25.505Z server01 PaymentGateway [WARN]: Operation failed for user 7",
];

function ErrorFooter({ error }: { error: string | null }) {
  const handleCopyError = () => {
    if (error) {
      copyToClipboard(error);
    }
  };

  return (
    <footer className="absolute right-0 bottom-0 left-0 flex h-[80px] w-full items-center justify-center">
      {/* Mock logs background */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-b from-error-8 to-error-5 bg-clip-text font-mono text-[11px] leading-[1.2] text-nowrap text-transparent blur-[1px] select-none">
        {MOCK_LOGS.map((log) => (
          <div key={log}>{log}</div>
        ))}
      </div>

      {/* Copy button */}
      <div className="relative z-10">
        <Button
          className="rounded font-mono text-mono text-[12px] font-medium uppercase backdrop-blur-sm dark:text-neutral-12"
          onClick={handleCopyError}
          tone="neutral"
          variant="alpha"
        >
          Copy error log
        </Button>
      </div>
    </footer>
  );
}

function AboutFooter({ fromError }: { fromError?: boolean }) {
  const navigate = useNavigate();

  if (fromError) {
    return (
      <footer className="flex w-full items-end justify-center px-3 pt-10 pb-3">
        <a
          className="inline-flex h-7 items-center gap-2 rounded-[4px] bg-success-a-4 px-3 text-body font-medium text-success-12 transition-colors hover:bg-success-a-5"
          href={GITHUB_URL}
          rel="noreferrer"
          target="_blank"
        >
          <Icon
            aria-hidden
            className="size-4"
            focusable="false"
            name="lightning"
          />
          Support this project
        </a>
      </footer>
    );
  }

  return (
    <footer className="flex w-full items-end justify-between px-3 pt-10 pb-3">
      <Button
        className="rotate-180"
        iconName="caretRight"
        onClick={() => navigate(ROUTES.SESSION)}
        showIcon
      />
      <a
        className="inline-flex h-7 items-center gap-2 rounded-[4px] bg-success-a-4 px-3 text-body font-medium text-success-12 transition-colors hover:bg-success-a-5"
        href={GITHUB_URL}
        rel="noreferrer"
        target="_blank"
      >
        <Icon
          aria-hidden
          className="size-4"
          focusable="false"
          name="lightning"
        />
        Support this project
      </a>
    </footer>
  );
}

function SessionFooter() {
  const navigate = useNavigate();
  const { state: endpoint } = useEndpoint("websocket");
  const { localStatus, remoteStatus } = useRoutingStatus("websocket");
  const { status } = useSession();

  const routeLabel = endpoint.routing === "local" ? "Local" : "Remote";
  const selectedWsStatus =
    endpoint.routing === "local" ? localStatus : remoteStatus;
  const isWsActive = selectedWsStatus === "online";

  const buttonLabel = (() => {
    if (status === "connecting") {
      return "Connecting...";
    }
    if (status === "connected") {
      return `Disconnect from ${routeLabel}`;
    }
    return `Connect to ${routeLabel}`;
  })();

  const isDisabled =
    status === "connecting" || (status === "disconnected" && !isWsActive);

  const buttonTone = (() => {
    if (status === "connected") {
      return "error";
    }
    return isWsActive ? "primary" : "neutral";
  })();

  const handleConnect = () => {
    frontendBroker.post("requestConnect");
  };

  const handleDisconnect = () => {
    wsManager.close();
  };

  return (
    <footer className="flex w-full items-center justify-between px-3 pt-5 pb-3">
      <Button
        className="rotate-180"
        iconName="caretRight"
        onClick={() => navigate(ROUTES.WEBSOCKET)}
        showIcon
      />
      <Button
        disabled={isDisabled}
        onClick={status === "connected" ? handleDisconnect : handleConnect}
        tone={buttonTone}
      >
        {buttonLabel}
      </Button>
    </footer>
  );
}

export default function Footer({ pathname, route }: FooterProps) {
  const location = useLocation();
  const state = location.state as {
    fromError?: boolean;
    error?: string;
  } | null;
  const fromError = state?.fromError;
  const error = state?.error ?? null;

  if (pathname === "/loading") {
    return null;
  }

  if (pathname === "/error") {
    return <ErrorFooter error={error} />;
  }

  if (route === ROUTES.ABOUT) {
    return <AboutFooter fromError={fromError} />;
  }

  if (
    route !== ROUTES.ROOT &&
    route !== ROUTES.WEBSOCKET &&
    route !== ROUTES.SESSION
  ) {
    return null;
  }

  if (route === ROUTES.SESSION) {
    return <SessionFooter />;
  }

  if (route === ROUTES.ROOT) {
    return <RootFooter />;
  }

  if (route === ROUTES.WEBSOCKET) {
    return <WebSocketFooter />;
  }

  return null;
}
