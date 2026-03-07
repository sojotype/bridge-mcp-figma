import { Collapsible } from "@base-ui/react/collapsible";
import {
  AnimatePresence,
  MotionConfig,
  motion,
  type Transition,
} from "motion/react";
import type { ReactNode } from "react";
import { useState } from "react";
import { tv } from "../../utils/tv";
import { Icon, type IconName } from "./icon";

type CalloutTone = "neutral" | "error" | "warning";

interface CalloutProps {
  tone?: CalloutTone;
  title?: string;
  children?: ReactNode;
  className?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

const iconMap = {
  neutral: "infoCircle",
  error: "errorOctagon",
  warning: "warningTriangle",
};

const callout = tv({
  base: "group relative flex flex-col overflow-hidden rounded-[4px] text-body",
  variants: {
    tone: {
      neutral:
        "bg-neutral-a-2 text-neutral-12 inset-shadow-[0_0_0_1px_var(--color-neutral-a-3)]",
      error:
        "bg-error-a-2 text-error-12 inset-shadow-[0_0_0_1px_var(--color-error-a-3)]",
      warning:
        "bg-warning-a-2 text-warning-12 inset-shadow-[0_0_0_1px_var(--color-warning-a-3)]",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

const header = tv({
  base: [
    "relative flex min-h-7 w-full items-start gap-1.5 overflow-hidden px-2 py-1",
    "transition-[background-color,border-radius] duration-300 ease-out hover:transition-none",
  ],
  variants: {
    tone: {
      neutral: "bg-linear-to-r from-neutral-a-4 to-neutral-a-1",
      error: "bg-linear-to-r from-error-a-4 to-error-a-1",
      warning: "bg-linear-to-r from-warning-a-4 to-warning-a-1",
    },
    collapsed: {
      true: "",
      false: "",
    },
    collapsible: {
      true: "",
      false: "",
    },
  },
  compoundVariants: [
    {
      tone: "neutral",
      collapsible: true,
      class: "hover:bg-neutral-a-2",
    },
    {
      tone: "error",
      collapsible: true,
      class: "hover:bg-error-a-2",
    },
    {
      tone: "warning",
      collapsible: true,
      class: "hover:bg-warning-a-2",
    },
    {
      tone: "neutral",
      collapsed: true,
      class: "from-neutral-a-1",
    },
    {
      tone: "error",
      collapsed: true,
      class: "from-neutral-a-1",
    },
    {
      tone: "warning",
      collapsed: true,
      class: "from-neutral-a-1",
    },
  ],
  defaultVariants: {
    collapsed: false,
    collapsible: false,
  },
});

const titleText = tv({
  base: "flex w-full text-left text-body",
});

const body = tv({
  base: [
    "flex w-full flex-col items-end justify-end gap-2 px-2 pt-1.5 pb-2",
    "[&_p]:w-full [&_p]:text-body",
  ],
  variants: {
    tone: {
      neutral: "[&_p]:text-neutral-12/70",
      error: "[&_p]:text-error-12/70",
      warning: "[&_p]:text-warning-12/70",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

const panel = tv({
  base: [
    "flex h-(--collapsible-panel-height) w-full flex-col overflow-hidden",
    "[&[hidden]:not([hidden='until-found'])]:hidden",
    "transition-[height,opacity] duration-200 ease-out",
    "data-closed:opacity-0 data-open:opacity-100",
    "data-starting-style:h-0 data-ending-style:h-0",
  ].join(" "),
});

const toggleIcon = tv({
  base: ["flex h-5 shrink-0 items-center transition-opacity"],
  variants: {
    collapsed: {
      true: "opacity-100",
      false:
        "transition-duration-300 opacity-0 ease-out group-hover:opacity-100 group-hover:transition-none",
    },
    tone: {
      neutral: "text-neutral-9",
      error: "text-error-9",
      warning: "text-warning-9",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

const TRANSITION = { duration: 0.2, bounce: 0 } as Transition;
export const Callout = ({
  tone = "neutral",
  title,
  children,
  className,
  collapsible = false,
  collapsed,
  onCollapsedChange,
}: CalloutProps) => {
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = useState(false);
  const isControlled = collapsed != null;
  const isCollapsed = isControlled ? collapsed : uncontrolledCollapsed;

  const showHeader = Boolean(title);
  const isInteractiveCollapsible = collapsible && showHeader;

  const setCollapsed = (nextCollapsed: boolean) => {
    if (!isControlled) {
      setUncontrolledCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };

  const iconName = iconMap[tone];
  const headerClassName = header({
    tone,
    collapsible: isInteractiveCollapsible,
    collapsed: isInteractiveCollapsible && isCollapsed,
  });
  const headerContent = (
    <>
      <AnimatePresence initial={false} mode="popLayout">
        {!isCollapsed && (
          <motion.span
            animate={{ x: 0, opacity: 1 }}
            className="relative flex h-5 shrink-0 items-center"
            exit={{ x: -24, opacity: 0 }}
            initial={{ x: -24, opacity: 0 }}
            layout="position"
          >
            <Icon className="size-4" name={iconName as IconName} />
          </motion.span>
        )}
      </AnimatePresence>
      <motion.p className={titleText()} layout="position">
        {title}
      </motion.p>
      {isInteractiveCollapsible && (
        <span
          aria-hidden
          className={toggleIcon({ collapsed: isCollapsed, tone })}
        >
          <Icon
            className="size-4"
            focusable="false"
            name={isCollapsed ? "plus" : "minus"}
          />
        </span>
      )}
    </>
  );

  return (
    <MotionConfig transition={TRANSITION}>
      <motion.div className={callout({ tone, className })} layout>
        {isInteractiveCollapsible ? (
          <Collapsible.Root
            onOpenChange={(open) => setCollapsed(!open)}
            open={!isCollapsed}
          >
            <Collapsible.Trigger
              aria-label={isCollapsed ? "Expand" : "Collapse"}
              className={headerClassName}
            >
              {headerContent}
            </Collapsible.Trigger>
            <Collapsible.Panel className={panel()}>
              <div className={body({ tone })}>{children}</div>
            </Collapsible.Panel>
          </Collapsible.Root>
        ) : (
          <>
            {showHeader && (
              <div className={headerClassName}>{headerContent}</div>
            )}
            <div className={body({ tone })}>{children}</div>
          </>
        )}
      </motion.div>
    </MotionConfig>
  );
};
