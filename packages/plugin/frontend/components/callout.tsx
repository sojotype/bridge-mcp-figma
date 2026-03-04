import type { ReactNode } from "react";
import { tv } from "../utils/tv";
import { Button } from "./button";
import { Icon } from "./icon";

type CalloutVariant = "neutral" | "error";

interface CalloutProps {
  variant?: CalloutVariant;
  title?: string;
  children: ReactNode;
  actionLabel?: string;
  onActionClick?: () => void;
  className?: string;
}

const callout = tv({
  base: "flex flex-col overflow-hidden rounded-[4px] text-body",
  variants: {
    variant: {
      neutral:
        "bg-grayA-2 text-gray-12 inset-shadow-[0_0_0_1px_var(--color-grayA-3)]",
      error:
        "bg-rubyA-2 text-ruby-12 inset-shadow-[0_0_0_1px_var(--color-rubyA-3)]",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

const header = tv({
  base: "relative flex h-7 w-full items-center gap-1.5 px-2",
  variants: {
    variant: {
      neutral: "bg-linear-to-r from-grayA-4 to-grayA-1",
      error: "bg-linear-to-r from-rubyA-4 to-rubyA-1",
    },
  },
});

const titleText = tv({
  base: "truncate text-body font-light",
});

const body = tv({
  base: "flex w-full flex-col items-end justify-end gap-2 px-2 pt-1.5 pb-2",
});

const bodyText = tv({
  base: "w-full text-body font-light",
});

export const Callout = ({
  variant = "neutral",
  title,
  children,
  actionLabel,
  onActionClick,
  className,
}: CalloutProps) => {
  const showHeader = Boolean(title);
  const showAction = Boolean(actionLabel);

  const iconName = variant === "error" ? "errorOctagon" : "infoCircle";

  return (
    <div className={callout({ variant, className })}>
      {showHeader && (
        <div className={header({ variant })}>
          <Icon
            aria-label={variant === "error" ? "Error" : "Information"}
            className="size-4 shrink-0"
            name={iconName}
          />
          <p className={titleText()}>{title}</p>
        </div>
      )}
      <div className={body()}>
        <div className="flex w-full flex-col items-end justify-between gap-3">
          <div className={bodyText()}>{children}</div>
          {showAction && (
            <Button
              aria-label={actionLabel}
              onClick={onActionClick}
              showIcon
              tone={variant === "error" ? "error" : "neutral"}
              variant="alpha"
            >
              {actionLabel}
            </Button>
          )}
        </div>
        {showAction && <span className="sr-only">{actionLabel}</span>}
      </div>
    </div>
  );
};
