import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router";
import { frontendBroker } from "../../lib/frontend-broker";
import { ROUTES } from "../../routes";

const VALID_ROUTES = new Set(Object.values(ROUTES));
const UNSAVED_ROUTES = new Set(["/loading", "/error"]);
const LOADING_DELAY_MS = 500;

export function RoutePersistence() {
  const navigate = useNavigate();
  const location = useLocation();
  const readyToSaveRef = useRef(false);
  const initialTargetRef = useRef<string | null>(null);
  const hasInitialSettingsRef = useRef(false);
  const delayDoneRef = useRef(false);
  const didNavigateRef = useRef(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      delayDoneRef.current = true;
      if (
        hasInitialSettingsRef.current &&
        !didNavigateRef.current &&
        location.pathname === "/loading"
      ) {
        const target = initialTargetRef.current ?? ROUTES.ROOT;
        didNavigateRef.current = true;
        navigate(target);
      }
    }, LOADING_DELAY_MS);
    return () => clearTimeout(timer);
  }, [navigate, location.pathname]);

  useEffect(() => {
    return frontendBroker.on("initialSettings", (data) => {
      const lastScreen = (data as { lastScreen?: string })?.lastScreen;
      const target =
        lastScreen && VALID_ROUTES.has(lastScreen) ? lastScreen : ROUTES.ROOT;
      initialTargetRef.current = target;
      hasInitialSettingsRef.current = true;
      readyToSaveRef.current = true;

      if (
        delayDoneRef.current &&
        !didNavigateRef.current &&
        location.pathname === "/loading"
      ) {
        didNavigateRef.current = true;
        navigate(target);
      }
    });
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!readyToSaveRef.current) {
      return;
    }
    const pathname = location.pathname;
    if (VALID_ROUTES.has(pathname) && !UNSAVED_ROUTES.has(pathname)) {
      frontendBroker.post("saveLastScreen", { route: pathname });
    }
  }, [location.pathname]);

  useEffect(() => {
    return frontendBroker.on("error", (data) => {
      const error = (data as { error?: string })?.error ?? "Unknown error";
      navigate("/error", { state: { error } });
    });
  }, [navigate]);

  return null;
}
