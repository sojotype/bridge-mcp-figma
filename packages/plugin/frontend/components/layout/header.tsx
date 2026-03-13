import { Tooltip } from "@base-ui/react/tooltip";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSnapshot } from "valtio";
import { ROUTES } from "../../routes";
import { endpointsStore } from "../../stores/endpoints";
import { useSession } from "../../stores/session";
import { Button } from "../ui/button";
import { Callout } from "../ui/callout";
import { Icon } from "../ui/icon";
import { Link } from "../ui/link";
import { TabButton } from "../ui/tab-button";

interface HeaderProps {
  pathname: string;
  route: keyof typeof ROUTES;
}

export default function Header({ pathname, route }: HeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromError = (location.state as { fromError?: boolean } | null)
    ?.fromError;
  const isTargetRoute = route === ROUTES.ROOT || route === ROUTES.WEBSOCKET;
  const { status } = useSession();
  const snap = useSnapshot(endpointsStore);
  const selectedWsStatus = snap.websocket.status[snap.websocket.routing];
  const isWsActive = selectedWsStatus === "online";
  const showRemoteCallout =
    snap.mcp.status.remote === "offline" ||
    snap.mcp.status.remote === "warning" ||
    snap.websocket.status.remote === "offline" ||
    snap.websocket.status.remote === "warning";

  const showCalloutOnScreen =
    route === ROUTES.ROOT ||
    route === ROUTES.WEBSOCKET ||
    route === ROUTES.SESSION;

  const [isCollapsed, setIsCollapsed] = useState(!isTargetRoute);
  const prevTargetRef = useRef(isTargetRoute);

  useEffect(() => {
    if (prevTargetRef.current && !isTargetRoute) {
      setIsCollapsed(true);
    } else if (!prevTargetRef.current && isTargetRoute) {
      setIsCollapsed(false);
    }
    prevTargetRef.current = isTargetRoute;
  }, [isTargetRoute]);

  if (pathname === "/loading") {
    return null;
  }

  if (pathname === "/error") {
    return (
      <header className="absolute top-0 right-0 left-0 flex w-full flex-col">
        <nav className="flex w-full justify-end px-3 pt-3">
          <Button
            className="rounded"
            iconName="infoCircle"
            onClick={() =>
              navigate(ROUTES.ABOUT, { state: { fromError: true } })
            }
            showIcon
            showLabel={false}
            variant="alpha"
          />
        </nav>
      </header>
    );
  }

  if (pathname === ROUTES.ABOUT && fromError) {
    return (
      <header className="flex w-full flex-col">
        <nav className="flex w-full justify-end px-3 pt-3">
          <Button
            className="rotate-180 rounded"
            iconName="caretRight"
            onClick={() => navigate(-1)}
            showIcon
            variant="alpha"
          />
        </nav>
      </header>
    );
  }

  return (
    <header className="flex w-full flex-col">
      <nav className="flex w-full justify-between px-3 pt-3">
        <Tooltip.Provider delay={500} timeout={500}>
          <div className="flex items-center gap-1">
            <TabButton
              active={route === ROUTES.ROOT}
              iconName="mcp"
              onClick={() => navigate(ROUTES.ROOT)}
              tooltip="MCP"
            />
            <Icon
              className="size-3 shrink-0 text-neutral-a-10"
              name="caretRight"
            />
            <TabButton
              active={route === ROUTES.WEBSOCKET}
              iconName={isWsActive ? "globe" : "globeX"}
              onClick={() => navigate(ROUTES.WEBSOCKET)}
              tooltip="WebSocket"
            />
            <Icon
              className="size-3 shrink-0 text-neutral-a-10"
              name="caretRight"
            />
            <TabButton
              active={route === ROUTES.SESSION}
              iconName={
                status === "connected" ? "plugsConnected" : "plugsDisconnected"
              }
              onClick={() => navigate(ROUTES.SESSION)}
              tooltip="Session"
            />
          </div>
          <div className="flex items-center gap-2">
            <TabButton
              active={route === ROUTES.ABOUT}
              iconName="infoCircle"
              onClick={() => navigate(ROUTES.ABOUT)}
              tooltip="About"
            />
            <TabButton
              active={route === ROUTES.MINI}
              iconName="minimize"
              onClick={() => navigate(ROUTES.MINI)}
              tooltip="Minimize"
            />
          </div>
        </Tooltip.Provider>
      </nav>
      {showRemoteCallout && showCalloutOnScreen && (
        <Callout
          className="mx-3 mt-3"
          collapsed={isCollapsed}
          collapsible
          iconNameOverride="warningTriangle"
          onCollapsedChange={setIsCollapsed}
          title="Official Remote service is not available now"
          tone="neutral"
        >
          <p>
            Run it{" "}
            <Link
              href="https://github.com/sojotype/bridge-mcp-figma#readme"
              rel="noreferrer"
              target="_blank"
              tone="primary"
            >
              locally
            </Link>{" "}
            or{" "}
            <Link
              href="https://github.com/sojotype/bridge-mcp-figma#readme"
              rel="noreferrer"
              target="_blank"
              tone="primary"
            >
              deploy
            </Link>{" "}
            your own service.
          </p>
        </Callout>
      )}
    </header>
  );
}
