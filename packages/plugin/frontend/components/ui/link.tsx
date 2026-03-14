import type { AnchorHTMLAttributes, ReactNode } from "react";
import { tv } from "../../lib/tv";
import { Icon } from "./icon";

type LinkTone = "primary" | "success";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  tone?: LinkTone;
  showIcon?: boolean;
  children: ReactNode;
}

const link = tv({
  base: [
    "focus-outline inline-flex cursor-pointer items-center gap-1 rounded-[2px] text-body underline-offset-2",
    "transition-[color,text-decoration-color] duration-300 ease-out hover:transition-none",
    "hover:underline",
  ].join(" "),
  variants: {
    tone: {
      primary: "text-primary-11 hover:decoration-primary-a-11",
      success: "text-success-11 hover:decoration-success-a-11",
    },
  },
  defaultVariants: {
    tone: "primary",
  },
});

export const Link = ({
  tone = "primary",
  showIcon = false,
  children,
  className,
  ...props
}: LinkProps) => {
  return (
    <a className={link({ tone, className })} {...props}>
      <span>{children}</span>
      {showIcon && (
        <Icon
          aria-hidden
          className="size-4 shrink-0"
          focusable="false"
          name="externalLink"
        />
      )}
    </a>
  );
};
