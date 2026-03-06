import { Checkbox as C } from "@base-ui/react/checkbox";
import type { ComponentPropsWithoutRef } from "react";
import { useId } from "react";
import { tv } from "../utils/tv";
import { Icon } from "./icon";

const root = tv({
  base: [
    "peer group my-px inline-flex size-4.5 shrink-0 items-center justify-center rounded-[3px]",
    "bg-gray-1",
    "transition-[background-color,box-shadow,color] duration-300 ease-out",
    "group-hover:shadow-[inset_0_0_0_1px_var(--color-grayA-6)] hover:shadow-[inset_0_0_0_1px_var(--color-grayA-6)]",
    "data-unchecked:group-hover:transition-none data-unchecked:hover:transition-none",
    "focus-visible:ring-1 focus-visible:ring-blue-8 focus-visible:ring-offset-0 focus-visible:outline-none",
    "data-checked:bg-blue-3 data-checked:shadow-[inset_0_0_0_1px_var(--color-blue-10)]",
    "data-indeterminate:bg-blueA-2 data-indeterminate:shadow-[inset_0_0_0_1px_var(--color-blue-8)]",
    "data-disabled:cursor-not-allowed data-disabled:opacity-50",
  ].join(" "),
});

const indicator = tv({
  base: [
    "flex size-full items-center justify-center text-blue-11",
    "transition-[opacity,transform] duration-150 ease-out",
    "data-unchecked:scale-75 data-unchecked:opacity-0",
    "data-checked:scale-100 data-checked:opacity-100",
    "data-indeterminate:scale-100 data-indeterminate:opacity-100",
  ].join(" "),
});

const label = tv({
  base: ["group w-fill inline-flex items-start gap-2 text-body text-gray-11"],
});

export interface CheckboxProps
  extends Omit<ComponentPropsWithoutRef<typeof C.Root>, "className"> {
  text: string;
  className?: string;
}

export function Checkbox({ text, className, ...props }: CheckboxProps) {
  const generatedId = useId().replace(/:/g, "");
  const inputId = props.id ?? generatedId;

  return (
    <label className={label({ className })} htmlFor={inputId}>
      <C.Root {...props} className={root()} id={inputId}>
        <C.Indicator className={indicator()}>
          <Icon
            aria-hidden
            className="size-4.5"
            focusable="false"
            name="checkmark"
          />
        </C.Indicator>
      </C.Root>
      <span className="peer-data-checked:text-blue-11 peer-data-indeterminate:text-blue-11">
        {text}
      </span>
    </label>
  );
}
