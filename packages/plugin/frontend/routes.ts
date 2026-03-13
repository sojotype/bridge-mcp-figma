export const ROUTES = {
  LOADING: "/loading",
  ERROR: "/error",
  ROOT: "/",
  WEBSOCKET: "/websocket",
  SESSION: "/session",
  ABOUT: "/about",
  MINI: "/mini",
};

/** Fixed height for state screens (header + content + footer). */
export const FIXED_HEIGHT_ROUTES: Record<string, number> = {
  [ROUTES.LOADING]: 360,
  [ROUTES.ERROR]: 360,
  [ROUTES.ABOUT]: 360,
};
