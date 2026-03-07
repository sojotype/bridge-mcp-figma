import { Toggle as T } from "@base-ui/react/toggle";
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
    pressed: {
      true: [
        "bg-neutral-1 text-neutral-12 shadow-[inset_0_0_0_1px_var(--color-neutral-a-5)]",
        "hover:shadow-[inset_0_0_0_1px_var(--color-neutral-a-5)]",
      ].join(" "),
    },
  },
});

export interface ToggleProps {
  label?: string;
  value?: string;
  state: "online" | "offline" | "connecting" | "idle" | "warning";
}

const stateLabels: Record<ToggleProps["state"], string> = {
  online: "Online",
  offline: "Offline",
  connecting: "Connecting",
  idle: "Idle",
  warning: "Warning",
};

export function Toggle({ label = "Toggle", value, state }: ToggleProps) {
  const tooltipContent = stateLabels[state];

  return (
    <Tooltip content={tooltipContent}>
      <T
        className={(state) =>
          toggle({
            pressed: state.pressed,
          })
        }
        value={value}
      >
        <span className="relative z-2 shrink-0 whitespace-nowrap">{label}</span>
        <Indicator variant={state} />
      </T>
    </Tooltip>
  );
}
