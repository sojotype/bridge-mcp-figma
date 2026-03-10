import type { Transition } from "motion/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { tv } from "../../utils/tv";
import { Icon } from "./icon";

export interface InputProps {
  id?: string;
  value: string;
  owner: "user" | "default";
  defaultValue?: string;
  error?: string | null;
  onBlur?: () => void;
  onValueChange?: (value: string) => void;
  onSubmit?: (value: string) => void;
  onReset?: () => void;
  className?: string;
}

const root = tv({
  base: "flex flex-col gap-1",
});

const field = tv({
  base: [
    "flex h-7 items-center rounded-sm pr-1",
    "bg-neutral-2 text-body text-neutral-10",
    "focus-within:shadow-[0_0_0_1px_var(--color-primary-8)_inset] hover:shadow-[0_0_0_1px_var(--color-neutral-a-6)_inset] hover:transition-none focus-within:hover:shadow-[0_0_0_1px_var(--color-primary-8)_inset]",
    "transition-[box-shadow,background-color] duration-300 ease-out",
  ].join(" "),
  variants: {
    hasError: {
      true: "bg-error-2 shadow-[0_0_0_1px_var(--color-error-8)_inset] focus-within:shadow-[0_0_0_1px_var(--color-error-8)_inset] hover:shadow-[0_0_0_1px_var(--color-error-8)_inset] focus-within:hover:shadow-[0_0_0_1px_var(--color-error-8)_inset]",
    },
  },
});

const inputStyles =
  "pl-2 flex-1 bg-transparent text-body text-neutral-11 placeholder:text-neutral-10 outline-none";

const buttonStyles = tv({
  base: [
    "ml-1 flex h-5 items-center overflow-hidden rounded-[2px] bg-neutral-4 text-caption font-medium text-neutral-10",
    "hover:shadow-[0_0_0_1px_var(--color-neutral-a-4)_inset]",
    "transition-[background-color,color] duration-150 ease-out",
  ],
  variants: {
    variant: {
      user: "text-primary-10",
      default: "",
    },
    interactive: {
      true: "",
      false: "pointer-events-none",
    },
    hasError: {
      true: "bg-error-4 text-error-10 hover:shadow-[0_0_0_1px_var(--color-error-a-4)_inset]",
      false: "",
    },
  },
});

type UserLabel = "User" | "Reset";
type InputStateLabel = "Default" | UserLabel;

const LABEL_HORIZONTAL_OFFSET = 10;
const DURATION = 0.15;
const DEFAULT_LABEL_TRANSITION: Transition = {
  duration: DURATION,
  ease: "easeOut",
};
const HORIZONTAL_LABEL_TRANSITION: Transition = {
  ease: "easeOut",
  x: { duration: DURATION },
  y: { duration: DURATION },
  opacity: { duration: DURATION },
};

function getUserLabel(isHovered: boolean, isButtonFocused: boolean): UserLabel {
  if (isHovered || isButtonFocused) {
    return "Reset";
  }
  return "User";
}

function getInputStateLabel(
  owner: InputProps["owner"],
  isHovered: boolean,
  isButtonFocused: boolean
): InputStateLabel {
  if (owner === "default") {
    return "Default";
  }
  return getUserLabel(isHovered, isButtonFocused);
}

function DefaultState() {
  return <span className="px-2 whitespace-nowrap">Default</span>;
}

function UserState({
  isHovered,
  isButtonFocused,
}: {
  isHovered: boolean;
  isButtonFocused: boolean;
}) {
  const label = getUserLabel(isHovered, isButtonFocused);
  const didLabelChange = isHovered || isButtonFocused;
  const direction = didLabelChange ? 1 : -1;

  const x = LABEL_HORIZONTAL_OFFSET * direction;

  return (
    <AnimatePresence initial={false} mode="popLayout">
      <motion.span
        animate={{
          opacity: 1,
          x: 0,
        }}
        className="px-2 whitespace-nowrap"
        exit={{
          opacity: 0,
          x,
        }}
        initial={{
          opacity: 0,
          x,
        }}
        key={label}
        layout
        transition={HORIZONTAL_LABEL_TRANSITION}
      >
        {label}
      </motion.span>
    </AnimatePresence>
  );
}

function InputState({
  owner,
  isHovered,
  isButtonFocused,
}: {
  owner: InputProps["owner"];
  isHovered: boolean;
  isButtonFocused: boolean;
}) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [contentWidth, setContentWidth] = useState<number>();
  const currentLabel = getInputStateLabel(owner, isHovered, isButtonFocused);

  useLayoutEffect(() => {
    const node = measureRef.current;

    if (!node) {
      return;
    }

    const nextWidth = node.getBoundingClientRect().width;

    setContentWidth((previousWidth) =>
      previousWidth === nextWidth ? previousWidth : nextWidth
    );
  });

  return (
    <motion.span
      animate={contentWidth == null ? undefined : { width: contentWidth }}
      className="relative block h-full overflow-hidden"
      initial={false}
      transition={DEFAULT_LABEL_TRANSITION}
    >
      <span
        aria-hidden
        className="pointer-events-none invisible inline-flex h-full items-center px-2 whitespace-nowrap"
        ref={measureRef}
      >
        {currentLabel}
      </span>
      <motion.span
        animate={{
          y: owner === "default" ? "0%" : "-50%",
        }}
        className="absolute top-0 right-0 flex h-[200%] flex-col items-end"
        initial={false}
        transition={DEFAULT_LABEL_TRANSITION}
      >
        <span className="flex h-1/2 items-center justify-end">
          <DefaultState />
        </span>
        <span className="flex h-1/2 items-center justify-end">
          <UserState isButtonFocused={isButtonFocused} isHovered={isHovered} />
        </span>
      </motion.span>
    </motion.span>
  );
}

export const Input = ({
  value,
  owner,
  defaultValue = "",
  error: errorProp,
  onBlur,
  onValueChange,
  onSubmit,
  onReset,
  id,
  className,
}: InputProps) => {
  const generatedId = useId().replace(/:/g, "");
  const inputId = id ?? generatedId;

  const [draft, setDraft] = useState(value);
  const [committedValue, setCommittedValue] = useState(value);
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonFocused, setIsButtonFocused] = useState(false);
  const isMirroringLocalChangeRef = useRef(false);

  useEffect(() => {
    setDraft(value);

    if (isMirroringLocalChangeRef.current) {
      isMirroringLocalChangeRef.current = false;
      return;
    }

    setCommittedValue(value);
  }, [value]);

  const isDirty = draft !== committedValue;
  const isButtonInteractive = owner === "user";

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setDraft(next);
    isMirroringLocalChangeRef.current = true;
    onValueChange?.(next);
  };

  const trySubmit = (nextValue = draft) => {
    if (nextValue === committedValue) {
      return;
    }
    setDraft(nextValue);
    setCommittedValue(nextValue);
    onSubmit?.(nextValue);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      trySubmit(event.currentTarget.value);
    }
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    trySubmit(event.currentTarget.value);
    onBlur?.();
  };

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
  };

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (isButtonInteractive) {
      event.stopPropagation();
      onReset?.();
    }
  };

  const showEnterKey = isDirty;

  const hasError = !!errorProp;

  return (
    <div className={twMerge(root({}), className)}>
      <label className={field({ hasError })} htmlFor={inputId}>
        <input
          aria-invalid={hasError ? true : undefined}
          className={inputStyles}
          id={inputId}
          onBlur={handleBlur}
          onChange={handleChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder={defaultValue}
          value={draft}
        />
        {showEnterKey ? (
          <Icon
            aria-hidden
            className="size-4 text-neutral-7"
            focusable="false"
            name="enterKey"
          />
        ) : null}
        <motion.button
          className={twMerge([
            buttonStyles({
              hasError,
              variant: isButtonInteractive ? "user" : "default",
              interactive: isButtonInteractive,
            }),
            "relative",
          ])}
          disabled={!isButtonInteractive}
          onBlur={() => setIsButtonFocused(false)}
          onClick={handleButtonClick}
          onFocus={() => setIsButtonFocused(true)}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          type="button"
        >
          <InputState
            isButtonFocused={isButtonFocused}
            isHovered={isHovered}
            owner={owner}
          />
        </motion.button>
      </label>
    </div>
  );
};
