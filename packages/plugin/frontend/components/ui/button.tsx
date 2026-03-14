import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { tv } from "../../lib/tv";
import { Icon, type IconName } from "./icon";
import { Tooltip } from "./tooltip";

type ButtonVariant = "solid" | "alpha";

type ButtonTone = "neutral" | "primary" | "success" | "error";

export interface ButtonProps
  extends Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "aria-label"
  > {
  variant?: ButtonVariant;
  tone?: ButtonTone;
  iconName?: IconName;
  showIcon?: boolean;
  showLabel?: boolean;
  children?: ReactNode;
  className?: string;
  /** Default "button". Use "a" for links (requires href). */
  as?: "button" | "a";
  href?: string;
  rel?: string;
}

const button = tv({
  base: [
    "focus-outline inline-flex h-7 items-center justify-center gap-1.5 px-3",
    "rounded-[4px] text-body font-medium",
    "transition-[background-color] duration-300 ease-out",
    "hover:transition-none",
    "disabled:cursor-not-allowed disabled:opacity-70",
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
  showLabel: showLabelProp,
  children,
  className,
  as = "button",
  type = "button",
  href,
  rel,
  ...props
}: ButtonProps) => {
  const showLabel = showLabelProp ?? children != null;
  const useTooltip = !showLabel && children != null;
  const isLink = as === "a";

  const accessibleName =
    !showLabel && typeof children === "string" ? children : undefined;

  const content = (
    <>
      {showIcon && (
        <Icon
          aria-hidden
          className="size-4 shrink-0"
          focusable="false"
          name={iconName}
        />
      )}
      {showLabel && <span className="truncate">{children}</span>}
    </>
  );

  const ariaLabelAttr =
    typeof accessibleName === "string" && accessibleName
      ? { "aria-label": accessibleName }
      : undefined;

  const element = isLink ? (
    <a
      className={button({ variant, tone, showLabel, className })}
      href={href}
      rel={rel ?? "noreferrer"}
      target="_blank"
      {...(ariaLabelAttr ?? {})}
      {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
    >
      {content}
    </a>
  ) : (
    <button
      className={button({ variant, tone, showLabel, className })}
      type={type as "button" | "submit" | "reset"}
      {...(ariaLabelAttr ?? {})}
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );

  if (useTooltip) {
    return <Tooltip content={children}>{element}</Tooltip>;
  }

  return element;
};
