import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { tv } from "../../utils/tv";
import { Indicator } from "./indicator";
import { Tooltip } from "./tooltip";

const toggle = tv({
  base: [
    "flex h-6 w-fit items-center justify-center gap-x-[3px] overflow-hidden rounded py-1 pr-1 pl-2",
    "bg-neutral-4 shadow-[inset_0_0_0_1px_var(--color-neutral-a-3)]",
    "text-body text-neutral-11",
    "transition-[background-color,box-shadow,color] duration-300 ease-out hover:transition-none",
    "hover:shadow-[inset_0_0_0_1px_var(--color-neutral-a-6)]",
  ].join(" "),
  variants: {
    active: {
      true: [
        "bg-neutral-1 text-neutral-12 shadow-[inset_0_0_0_1px_var(--color-neutral-a-5)]",
        "hover:shadow-[inset_0_0_0_1px_var(--color-neutral-a-5)]",
      ].join(" "),
    },
  },
});

export interface TabsRootProps {
  children: React.ReactNode;
  defaultValue?: BaseTabs.Tab.Value;
  value?: BaseTabs.Tab.Value;
  onValueChange?: BaseTabs.Root.Props["onValueChange"];
}

export interface TabItemProps {
  label?: string;
  value: string;
  state: "online" | "offline" | "connecting" | "idle" | "warning";
}

const stateLabels: Record<TabItemProps["state"], string> = {
  online: "Online",
  offline: "Offline",
  connecting: "Connecting",
  idle: "Idle",
  warning: "Warning",
};

function TabsRoot({
  children,
  defaultValue,
  value,
  onValueChange,
}: TabsRootProps) {
  return (
    <BaseTabs.Root
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      value={value}
    >
      {children}
    </BaseTabs.Root>
  );
}

function TabItem({ label = "Toggle", value, state }: TabItemProps) {
  const tooltipContent = stateLabels[state];

  return (
    <Tooltip content={tooltipContent}>
      <BaseTabs.Tab
        className={(tabState) =>
          toggle({
            active: tabState.active,
          })
        }
        value={value}
      >
        <span className="relative z-2 shrink-0 whitespace-nowrap">{label}</span>
        <Indicator variant={state} />
      </BaseTabs.Tab>
    </Tooltip>
  );
}

export const Tabs = {
  Root: TabsRoot,
  List: BaseTabs.List,
  Item: TabItem,
  Panel: BaseTabs.Panel,
  Indicator: BaseTabs.Indicator,
};
