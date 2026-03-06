import type { ButtonHTMLAttributes, ReactNode } from "react";
import { tv } from "../utils/tv";
import { Icon, type IconName } from "./icon";

type ButtonVariant = "solid" | "alpha";

type ButtonTone = "neutral" | "info" | "success" | "error";

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  iconName?: IconName;
  showIcon?: boolean;
  children?: ReactNode;
  className?: string;
}

const button = tv({
  base: [
    "inline-flex h-7 items-center justify-center gap-1.5 px-3",
    "rounded-[4px] text-body font-medium",
    "transition-[background-color] duration-300 ease-out",
    "will-change-[background-color] hover:transition-none",
    "focus-visible:ring-1 focus-visible:ring-blue-8 focus-visible:outline-none",
  ].join(" "),
  variants: {
    variant: {
      solid: "",
      alpha: "rounded-[2px]",
    },
    tone: {
      neutral: "",
      info: "",
      success: "",
      error: "",
    },
  },
  compoundVariants: [
    // Solid buttons (filled)
    {
      variant: "solid",
      tone: "neutral",
      class: "bg-gray-6 text-gray-12 hover:bg-gray-7 active:bg-gray-5",
    },
    {
      variant: "solid",
      tone: "info",
      class: "bg-blue-7 text-gray-12 hover:bg-blue-8 active:bg-blue-6",
    },
    {
      variant: "solid",
      tone: "success",
      class: "bg-jade-7 text-gray-12 hover:bg-jade-8 active:bg-jade-6",
    },
    {
      variant: "solid",
      tone: "error",
      class: "bg-ruby-7 text-gray-12 hover:bg-ruby-8 active:bg-ruby-6",
    },

    // Alpha buttons (tinted backgrounds)
    {
      variant: "alpha",
      tone: "neutral",
      class: "bg-grayA-4 text-gray-12 hover:bg-grayA-5 active:bg-grayA-3",
    },
    {
      variant: "alpha",
      tone: "info",
      class: "bg-blueA-4 text-blue-12 hover:bg-blueA-5 active:bg-blueA-3",
    },
    {
      variant: "alpha",
      tone: "success",
      class: "bg-jadeA-4 text-jade-12 hover:bg-jadeA-5 active:bg-jadeA-3",
    },
    {
      variant: "alpha",
      tone: "error",
      class: "bg-rubyA-4 text-ruby-12 hover:bg-rubyA-5 active:bg-rubyA-3",
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
      className={button({ variant, tone, className })}
      type={type}
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
