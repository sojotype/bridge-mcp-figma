import type { ReactNode } from "react";
import { tv } from "../../lib/tv";
import { Icon, type IconName } from "./icon";
import { Tooltip } from "./tooltip";

const tab = tv({
  base: [
    "flex h-7 items-center justify-center gap-x-1.5 rounded bg-neutral-4 px-2 py-1 text-body text-neutral-12 shadow-[inset_0_0_0_1px_var(--color-neutral-a-3)] select-none",
    "transition-[background-color] duration-300 ease-out",
    "hover:bg-neutral-6 hover:transition-none",
    "focus-outline",
  ].join(" "),
  variants: {
    active: {
      true: "bg-primary-a-2 shadow-[inset_0_0_0_1px_var(--color-primary-8)] hover:bg-primary-a-2",
    },
    withTooltip: {
      true: "size-7",
    },
  },
});

interface TabButtonProps {
  active: boolean;
  iconName: IconName;
  tooltip?: string;
  onClick?: () => void;
  children?: ReactNode;
}

export const TabButton = ({
  tooltip,
  active,
  iconName = "plugsDisconnected",
  onClick,
  children,
}: TabButtonProps) => {
  const withTooltip = tooltip !== undefined;

  const button = (
    <button
      className={tab({ active, withTooltip })}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-4 shrink-0" name={iconName} />
      {children}
    </button>
  );

  if (withTooltip) {
    return <Tooltip content={tooltip}>{button}</Tooltip>;
  }
  return button;
};
