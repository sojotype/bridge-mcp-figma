import { Collapsible } from "@base-ui/react/collapsible";
import {
  type AutoLayout,
  createLayout,
  createScope,
  type Scope,
} from "animejs";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { tv } from "../../lib/tv";
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
  showHeaderIcon?: boolean;
  iconNameOverride?: IconName;
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
    "relative flex min-h-7 w-full items-start gap-x-1 overflow-hidden px-2 py-1",
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
  variants: {
    tone: {
      neutral: "text-neutral-12",
      error: "text-error-12",
      warning: "text-warning-12",
    },
    isCollapsed: {
      true: "text-neutral-11",
      false: "",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

const body = tv({
  base: [
    "flex w-full flex-col items-end justify-end gap-2 px-2 pt-1.5 pb-2",
    "[&_p]:w-full [&_p]:text-body",
  ],
  variants: {
    tone: {
      neutral: "[&_p]:text-neutral-12/80",
      error: "[&_p]:text-error-12/80",
      warning: "[&_p]:text-warning-12/80",
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
    "transition-[height,opacity] duration-150 ease-out",
    "data-closed:opacity-0 data-open:opacity-100",
    "data-ending-style:h-0 data-starting-style:h-0",
  ].join(" "),
});

const headerIcon = tv({
  base: "relative flex h-5 shrink-0 items-center",
  variants: {
    tone: {
      neutral: "text-neutral-11",
      error: "text-error-11",
      warning: "text-warning-11",
    },
    // isCollapsed: {
    //   true: "hidden",
    //   false: "",
    // },
  },
  defaultVariants: {
    tone: "neutral",
  },
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

export const Callout = ({
  tone = "neutral",
  title,
  children,
  className,
  collapsible = false,
  collapsed,
  onCollapsedChange,
  showHeaderIcon = true,
  iconNameOverride,
}: CalloutProps) => {
  const animeRoot = useRef<HTMLDivElement | null>(null);
  const animeScope = useRef<Scope | null>(null);
  const layoutRefController = useRef<AutoLayout | null>(null);
  const headerRef = useRef<HTMLButtonElement | null>(null);
  const headerIconRef = useRef<HTMLSpanElement | null>(null);

  const isControlled = collapsed != null;
  const [selfCollapsed, setSelfCollapsed] = useState(false);

  const isCollapsed = isControlled ? collapsed : selfCollapsed;

  const [isIconVisible, setIsIconVisible] = useState(showHeaderIcon);

  const iconName = iconNameOverride ?? iconMap[tone];
  const showHeader = Boolean(title);

  useEffect(() => {
    if (layoutRefController.current) {
      return;
    }

    animeScope.current = createScope({ root: animeRoot }).add(() => {
      if (!headerRef.current) {
        return;
      }

      layoutRefController.current = createLayout(headerRef.current, {
        duration: 150,
        ease: "out(2)",
        properties: ["transform", "width", "columnGap"],
        enterFrom: { transform: "translateX(-100%)", opacity: 0 },
        leaveTo: { transform: "translateX(-100%)", opacity: 0 },
      });
    });

    return () => animeScope.current?.revert();
  }, []);

  useLayoutEffect(() => {
    if (!(layoutRefController.current && showHeaderIcon)) {
      return;
    }

    if (!isCollapsed) {
      flushSync(() => setIsIconVisible(true));
    }

    layoutRefController.current.update(() => {
      if (!headerIconRef.current) {
        return;
      }
      headerIconRef.current.style.display = isCollapsed ? "none" : "";
    });
  }, [isCollapsed, showHeaderIcon]);

  const setCollapsed = (nextCollapsed: boolean) => {
    if (!isControlled) {
      setSelfCollapsed(nextCollapsed);
    }
    onCollapsedChange?.(nextCollapsed);
  };

  const headerClassName = header({
    tone,
    collapsible,
    collapsed: isCollapsed,
  });
  const headerContent = (
    <>
      {showHeaderIcon && isIconVisible && (
        <span className={headerIcon({ tone })} ref={headerIconRef}>
          <Icon className="size-4" name={iconName as IconName} />
        </span>
      )}
      <p className={titleText({ tone, isCollapsed })}>{title}</p>
      {collapsible && (
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
    <div className={callout({ tone, className })} ref={animeRoot}>
      {collapsible ? (
        <Collapsible.Root
          onOpenChange={(open) => setCollapsed(!open)}
          open={!isCollapsed}
        >
          <Collapsible.Trigger
            aria-label={isCollapsed ? "Expand" : "Collapse"}
            className={headerClassName}
            ref={headerRef}
          >
            {headerContent}
          </Collapsible.Trigger>
          <Collapsible.Panel className={panel()}>
            <div className={body({ tone })}>{children}</div>
          </Collapsible.Panel>
        </Collapsible.Root>
      ) : (
        <>
          {showHeader && <div className={headerClassName}>{headerContent}</div>}
          <div className={body({ tone })}>{children}</div>
        </>
      )}
    </div>
  );
};
