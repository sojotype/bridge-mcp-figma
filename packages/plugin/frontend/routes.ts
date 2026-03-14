export const ROUTES = {
  SETUP: "/",
  SESSION: "/session",
  ABOUT: "/about",
  MINI: "/mini",
  LOADING: "/loading",
  ERROR: "/error",
  DUPLICATED: "/duplicated",
  CLOSING: "/closing",
};

/** Fixed height for state screens (header + content + footer). */
export const FIXED_HEIGHT_ROUTES: Record<string, number> = {
  [ROUTES.LOADING]: 360,
  [ROUTES.ERROR]: 360,
  [ROUTES.DUPLICATED]: 360,
  [ROUTES.ABOUT]: 360,
  [ROUTES.CLOSING]: 360,
};
