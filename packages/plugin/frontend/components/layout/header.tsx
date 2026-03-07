import { Tooltip } from "@base-ui/react";
import { useLocation, useNavigate } from "react-router";
import { Callout } from "../ui/callout";
import { Icon } from "../ui/icon";
import { Link } from "../ui/link";
import { Tab } from "../ui/tab";

export default function Header() {
  const location = useLocation();
  const pathname = location.pathname;

  const navigate = useNavigate();

  return (
    <header>
      <nav className="flex justify-between p-3">
        <Tooltip.Provider delay={500} timeout={500}>
          <div className="flex items-center gap-1">
            <Tab
              active={pathname === "/"}
              iconName="mcp"
              onClick={() => navigate("/")}
              tooltip="MCP"
            />
            <Icon
              className="size-3 shrink-0 text-neutral-a-10"
              name="caretRight"
            />
            <Tab
              active={pathname === "/ws"}
              iconName={status === "ws-available" ? "globe" : "globeX"}
              onClick={() => navigate("/ws")}
              tooltip="WebSocket"
            />
            <Icon
              className="size-3 shrink-0 text-neutral-a-10"
              name="caretRight"
            />
            <Tab
              active={pathname === "/session"}
              iconName={
                status === "connected" ? "plugsConnected" : "plugsDisconnected"
              }
              onClick={() => navigate("/session")}
              tooltip="Session"
            />
          </div>
          <div className="flex items-center gap-2">
            <Tab
              active={pathname === "/about"}
              iconName="infoCircle"
              onClick={() => navigate("/about")}
              tooltip="About"
            />
            <Tab
              active={pathname === "/mini"}
              iconName="minimize"
              onClick={() => navigate("/mini")}
              tooltip="Minimize"
            />
          </div>
        </Tooltip.Provider>
      </nav>
      <Callout
        className="mx-3"
        collapsible
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
    </header>
  );
}
