import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { frontendBroker } from "../../lib/frontend-broker";
import { ROUTES } from "../../routes";

const VALID_ROUTES = new Set(Object.values(ROUTES));

export function RoutePersistence() {
  const navigate = useNavigate();
  const location = useLocation();
  const readyToSaveRef = useRef(false);

  useEffect(() => {
    return frontendBroker.on("initialSettings", (data) => {
      const lastScreen = (data as { lastScreen?: string })?.lastScreen;
      if (lastScreen && VALID_ROUTES.has(lastScreen)) {
        navigate(lastScreen);
      } else {
        const pathname = location.pathname;
        if (VALID_ROUTES.has(pathname)) {
          frontendBroker.post("saveLastScreen", { route: pathname });
        }
      }
      readyToSaveRef.current = true;
    });
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!readyToSaveRef.current) {
      return;
    }
    const pathname = location.pathname;
    if (VALID_ROUTES.has(pathname)) {
      frontendBroker.post("saveLastScreen", { route: pathname });
    }
  }, [location.pathname]);

  return null;
}
