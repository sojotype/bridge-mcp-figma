import { tv } from "../../utils/tv";
import { Icon, type IconName } from "./icon";
import { Tooltip } from "./tooltip";

const tab = tv({
  base: [
    "flex size-7 items-center justify-center gap-x-1.5 rounded bg-neutral-4 px-2 py-1 text-body text-neutral-12 shadow-[inset_0_0_0_1px_var(--color-neutral-a-3)]",
    "transition-[background-color] duration-300 ease-out",
    "hover:bg-neutral-6 hover:transition-none",
  ].join(" "),
  variants: {
    active: {
      true: "bg-primary-a-2 shadow-[inset_0_0_0_1px_var(--color-primary-8)] hover:bg-primary-a-2",
    },
  },
});

interface TabProps {
  active: boolean;
  iconName: IconName;
  tooltip: string;
  onClick?: () => void;
}

export const Tab = ({
  tooltip,
  active,
  iconName = "plugsDisconnected",
  onClick,
}: TabProps) => {
  return (
    <Tooltip content={tooltip} onClick={onClick}>
      <div className={tab({ active })}>
        <Icon className="size-4 shrink-0" name={iconName} />
      </div>
    </Tooltip>
  );
};
