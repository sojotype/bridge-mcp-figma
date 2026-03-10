import { Tooltip as T } from "@base-ui/react/tooltip";
import type { ReactElement, ReactNode } from "react";
import { tv } from "../../lib/tv";

interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  onClick?: () => void;
  className?: string;
}

const positionerStyles = "z-40 data-closed:z-40 data-open:z-50";

const popupStyles = tv({
  base: [
    "flex h-7 flex-col justify-center rounded-sm px-2",
    "bg-neutral-1 text-body text-neutral-11",
    "shadow-lg shadow-neutral-8 dark:shadow-neutral-5",
    "transition-[opacity,filter] will-change-[opacity,filter] data-ending-style:duration-300",
    "data-ending-style:opacity-0 data-ending-style:blur-xs",
  ],
});

export const Tooltip = ({
  content,
  children,
  onClick,
  className,
}: TooltipProps) => {
  return (
    <T.Root>
      <T.Trigger onClick={onClick} render={children} />
      <T.Portal>
        <T.Positioner
          className={positionerStyles}
          collisionPadding={4}
          sideOffset={10}
        >
          <T.Popup className={popupStyles({ className })}>{content}</T.Popup>
        </T.Positioner>
      </T.Portal>
    </T.Root>
  );
};
