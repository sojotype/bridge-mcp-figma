import { tv } from "../utils/tv";
import { Icon, type IconName } from "./icon";
import { Tooltip } from "./tooltip";

const button = tv({
  base: [
    "flex size-7 items-center justify-center gap-x-1.5 rounded border border-grayA-3 bg-gray-4 px-2 py-1 text-body text-gray-12",
    "transition-[background-color] duration-300 ease-out",
    "hover:bg-gray-6 hover:transition-none",
    "will-change-[background-color]",
  ].join(" "),
  variants: {
    active: {
      true: "border-blue-8 bg-blueA-2 hover:bg-blueA-2",
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
    <Tooltip content={tooltip}>
      <button className={button({ active })} onClick={onClick} type="button">
        <Icon className="size-4 shrink-0" name={iconName} />
      </button>
    </Tooltip>
  );
};
