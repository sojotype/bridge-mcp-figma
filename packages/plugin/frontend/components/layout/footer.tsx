import { useNavigate } from "react-router";
import { useRoutingStatus } from "../../hooks/use-routing-status";
import { useValidUrl } from "../../hooks/use-valid-url";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { useSession } from "../../stores/session";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { ValidationMessage } from "../utils/validation-message";

interface FooterProps {
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

function AboutFooter() {
  const navigate = useNavigate();

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

  return (
    <footer className="flex w-full items-center justify-between px-3 pt-5 pb-3">
      <Button
        className="rotate-180"
        iconName="caretRight"
        onClick={() => navigate(ROUTES.WEBSOCKET)}
        showIcon
      />
      <Button disabled={isDisabled} tone={buttonTone}>
        {buttonLabel}
      </Button>
    </footer>
  );
}

export default function Footer({ route }: FooterProps) {
  if (route === ROUTES.ABOUT) {
    return <AboutFooter />;
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
