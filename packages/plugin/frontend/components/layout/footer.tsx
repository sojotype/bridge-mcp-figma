import { useLocation, useNavigate } from "react-router";
import { copyToClipboard } from "../../lib/copy";
import { frontendBroker } from "../../lib/frontend-broker";
import { wsManager } from "../../lib/ws-manager";
import { ROUTES } from "../../routes";
import { useSession } from "../../stores/session";
import { useSettings } from "../../stores/settings";
import { BackButton } from "../shared/back-button";
import { SupportLink } from "../shared/support-link";
import { Button } from "../ui/button";

interface FooterProps {
  route: keyof typeof ROUTES;
}

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

function SetupFooter() {
  const navigate = useNavigate();
  return (
    <footer className="flex w-full items-center justify-end px-3 pt-5 pb-3">
      <Button onClick={() => navigate(ROUTES.SESSION)} tone="primary">
        Next
      </Button>
    </footer>
  );
}

function SessionFooter() {
  const navigate = useNavigate();
  const { port } = useSettings();
  const { status } = useSession();
  const isConnecting = status === "connecting";
  const isConnected = status === "connected";

  const handleConnect = () => {
    frontendBroker.post("requestConnect", { port });
  };
  const handleDisconnect = () => {
    wsManager.close();
  };

  let buttonLabel: string;
  if (isConnecting) {
    buttonLabel = "Connecting...";
  } else if (isConnected) {
    buttonLabel = "Disconnect";
  } else {
    buttonLabel = "Connect";
  }

  return (
    <footer className="flex w-full items-center justify-between px-3 pt-5 pb-3">
      <BackButton onClick={() => navigate(ROUTES.SETUP)} />
      <Button
        disabled={isConnecting}
        onClick={isConnected ? handleDisconnect : handleConnect}
        tone={isConnected ? "error" : "primary"}
      >
        {buttonLabel}
      </Button>
    </footer>
  );
}

function ErrorFooter({ error }: { error: string | null }) {
  const handleCopy = () => error && copyToClipboard(error);

  return (
    <footer className="absolute right-0 bottom-0 left-0 flex h-[80px] w-full items-center justify-center">
      <div className="absolute inset-0 z-0 overflow-hidden bg-linear-to-b from-error-8 to-error-5 bg-clip-text font-mono text-[11px] leading-[1.2] text-nowrap text-transparent blur-[1px] select-none">
        {MOCK_LOGS.map((log) => (
          <div key={log}>{log}</div>
        ))}
      </div>
      <div className="relative z-10">
        <Button
          className="rounded font-mono text-mono text-[12px] font-medium uppercase backdrop-blur-sm dark:text-neutral-12"
          onClick={handleCopy}
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
        <SupportLink />
      </footer>
    );
  }

  return (
    <footer className="flex w-full items-end justify-between px-3 pt-10 pb-3">
      <BackButton onClick={() => navigate(ROUTES.SESSION)} />
      <SupportLink />
    </footer>
  );
}

export default function Footer({ route }: FooterProps) {
  const location = useLocation();
  const state =
    (location.state as { fromError?: boolean; error?: string } | null) ?? {};
  const { fromError, error } = state;

  if (route === ROUTES.ERROR) {
    return <ErrorFooter error={error ?? null} />;
  }
  if (route === ROUTES.ABOUT) {
    return <AboutFooter fromError={fromError} />;
  }
  if (route === ROUTES.SETUP) {
    return <SetupFooter />;
  }
  if (route === ROUTES.SESSION) {
    return <SessionFooter />;
  }

  return null;
}
