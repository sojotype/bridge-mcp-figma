import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tv } from "../../lib/tv";
import { Icon, type IconName } from "./icon";

type ButtonVariant = "solid" | "alpha";

type ButtonTone = "neutral" | "primary" | "success" | "error";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  iconName?: IconName;
  showIcon?: boolean;
  showLabel?: boolean;
  children?: ReactNode;
  className?: string;
}

const button = tv({
  base: [
    "inline-flex h-7 items-center justify-center gap-1.5 px-3",
    "rounded-[4px] text-body font-medium",
    "transition-[background-color] duration-300 ease-out",
    "hover:transition-none",
    "focus-visible:ring-1 focus-visible:ring-primary-8 focus-visible:outline-none",
  ].join(" "),
  variants: {
    variant: {
      solid: "",
      alpha: "rounded-[2px]",
    },
    tone: {
      neutral: "",
      primary: "",
      success: "",
      error: "",
    },
    showLabel: {
      true: "",
      false: "size-7",
    },
  },
  compoundVariants: [
    // Solid buttons (filled)
    {
      variant: "solid",
      tone: "neutral",
      class:
        "bg-neutral-6 text-neutral-12 hover:bg-neutral-7 active:bg-neutral-5",
    },
    {
      variant: "solid",
      tone: "primary",
      class:
        "bg-primary-7 text-neutral-12 hover:bg-primary-8 active:bg-primary-6",
    },
    {
      variant: "solid",
      tone: "success",
      class:
        "bg-success-7 text-neutral-12 hover:bg-success-8 active:bg-success-6",
    },
    {
      variant: "solid",
      tone: "error",
      class: "bg-error-7 text-neutral-12 hover:bg-error-8 active:bg-error-6",
    },

    // Alpha buttons (tinted backgrounds)
    {
      variant: "alpha",
      tone: "neutral",
      class:
        "bg-neutral-a-4 text-neutral-12 hover:bg-neutral-a-5 active:bg-neutral-a-3",
    },
    {
      variant: "alpha",
      tone: "primary",
      class:
        "bg-primary-a-4 text-primary-12 hover:bg-primary-a-5 active:bg-primary-a-3",
    },
    {
      variant: "alpha",
      tone: "success",
      class:
        "bg-success-a-4 text-success-12 hover:bg-success-a-5 active:bg-success-a-3",
    },
    {
      variant: "alpha",
      tone: "error",
      class:
        "bg-error-a-4 text-error-12 hover:bg-error-a-5 active:bg-error-a-3",
    },
  ],
  defaultVariants: {
    variant: "solid",
    tone: "neutral",
  },
});

export const Button = ({
  variant = "solid",
  tone = "neutral",
  iconName = "copy",
  showIcon = false,
  children,
  className,
  type = "button",
  ...props
}: ButtonProps) => {
  const showLabel = children != null;

  return (
    <button
      className={button({ variant, tone, showLabel, className })}
      {...props}
    >
      {showIcon && (
        <Icon
          aria-hidden
          className="size-4 shrink-0"
          focusable="false"
          name={iconName}
        />
      )}
      {showLabel && <span className="truncate">{children}</span>}
    </button>
  );
};
