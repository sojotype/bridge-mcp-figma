import { Tooltip } from "@base-ui/react/tooltip";
import { useLocation, useNavigate } from "react-router";
import { ROUTES } from "../../routes";
import { useSession } from "../../stores/session";
import { BackButton } from "../shared/back-button";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { TabButton } from "../ui/tab";

interface HeaderProps {
  route: keyof typeof ROUTES;
}

function ErrorHeader() {
  const navigate = useNavigate();

  return (
    <header className="absolute top-0 right-0 left-0 flex w-full flex-col">
      <nav className="flex w-full justify-end px-3 pt-3">
        <Button
          className="rounded"
          iconName="infoCircle"
          onClick={() => navigate(ROUTES.ABOUT, { state: { fromError: true } })}
          showIcon
          showLabel={false}
          variant="alpha"
        >
          About
        </Button>
      </nav>
    </header>
  );
}

function ErrorAboutHeader() {
  const navigate = useNavigate();

  return (
    <header className="flex w-full flex-col">
      <nav className="flex w-full justify-end px-3 pt-3">
        <BackButton
          className="rounded"
          onClick={() => navigate(-1)}
          variant="alpha"
        />
      </nav>
    </header>
  );
}

function MainHeader({ route }: { route: keyof typeof ROUTES }) {
  const navigate = useNavigate();
  const { status } = useSession();

  const sessionTabLabel =
    status === "connected" && route !== ROUTES.SESSION && route !== ROUTES.MINI
      ? "Connected"
      : "Session";

  return (
    <header className="flex w-full flex-col">
      <nav className="flex w-full justify-between px-3 pt-3">
        <Tooltip.Provider delay={500} timeout={500}>
          <div className="flex items-center gap-1">
            <TabButton
              active={route === ROUTES.SETUP}
              iconName="mcp"
              onClick={() => navigate(ROUTES.SETUP)}
            >
              Setup
            </TabButton>
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
            >
              {sessionTabLabel}
            </TabButton>
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
    </header>
  );
}

export default function Header({ route }: HeaderProps) {
  const location = useLocation();
  const fromError = (location.state as { fromError?: boolean } | null)
    ?.fromError;

  if (route === ROUTES.LOADING) {
    return null;
  }

  if (route === ROUTES.DUPLICATED) {
    return null;
  }

  if (route === ROUTES.ERROR) {
    return <ErrorHeader />;
  }

  if (route === ROUTES.ABOUT && fromError) {
    return <ErrorAboutHeader />;
  }

  return <MainHeader route={route} />;
}
