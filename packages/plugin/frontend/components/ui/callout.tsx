import type { ReactNode } from "react";
import { tv } from "../../lib/tv";

type CalloutTone = "neutral" | "error" | "warning";

interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  children?: ReactNode;
  className?: string;
}

const callout = tv({
  base: "group relative flex flex-col overflow-hidden rounded-[4px] text-body",
  variants: {
    tone: {
      neutral:
        "bg-neutral-a-2 text-neutral-12 inset-shadow-[0_0_0_1px_var(--color-neutral-a-3)]",
      error:
        "bg-error-a-2 text-error-12 inset-shadow-[0_0_0_1px_var(--color-error-a-3)]",
      warning:
        "bg-warning-a-2 text-warning-12 inset-shadow-[0_0_0_1px_var(--color-warning-a-3)]",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

const header = tv({
  base: [
    "relative flex min-h-7 w-full items-start gap-x-1 overflow-hidden px-2 py-1",
    "transition-[background-color,border-radius] duration-300 ease-out hover:transition-none",
  ],
  variants: {
    tone: {
      neutral: "bg-linear-to-r from-neutral-a-4 to-neutral-a-1",
      error: "bg-linear-to-r from-error-a-4 to-error-a-1",
      warning: "bg-linear-to-r from-warning-a-4 to-warning-a-1",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

const titleText = tv({
  base: "flex w-full text-left text-body",
  variants: {
    tone: {
      neutral: "text-neutral-12",
      error: "text-error-12",
      warning: "text-warning-12",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

const body = tv({
  base: [
    "flex w-full flex-col items-end justify-end gap-2 px-2 pt-1.5 pb-2",
    "[&_p]:w-full [&_p]:text-body",
  ],
  variants: {
    tone: {
      neutral: "[&_p,&_ul]:text-neutral-12/80",
      error: "[&_p,&_ul]:text-error-12/80",
      warning: "[&_p,&_ul]:text-warning-12/80",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export const Callout = ({
  tone = "neutral",
  title,
  children,
  className,
}: CalloutProps) => {
  const showHeader = Boolean(title);

  return (
    <div className={callout({ tone, className })}>
      {showHeader && (
        <div className={header({ tone })}>
          <p className={titleText({ tone })}>{title}</p>
        </div>
      )}
      <div className={body({ tone })}>{children}</div>
    </div>
  );
};
