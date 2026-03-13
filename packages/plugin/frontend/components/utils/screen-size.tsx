import type { PropsWithChildren } from "react";
import { useLocation } from "react-router";
import { FIXED_HEIGHT_ROUTES } from "../../routes";

export function ScreenSize({ children }: PropsWithChildren) {
  const { pathname } = useLocation();
  const fixedHeight = FIXED_HEIGHT_ROUTES[pathname];

  const isFixed = fixedHeight !== undefined;

  return (
    <div
      className={
        isFixed
          ? "flex w-full shrink-0 flex-col overflow-hidden"
          : "flex min-h-0 flex-1 flex-col overflow-hidden"
      }
      style={
        isFixed ? { height: fixedHeight, minHeight: fixedHeight } : undefined
      }
    >
      {children}
    </div>
  );
}
