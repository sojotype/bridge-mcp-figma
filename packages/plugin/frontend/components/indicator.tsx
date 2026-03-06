import { useCallback, useEffect, useId, useRef, useState } from "react";
import { tv } from "../utils/tv";

const indicatorVariants = [
  "online",
  "offline",
  "warning",
  "idle",
  "connecting",
] as const;

export type IndicatorVariant = (typeof indicatorVariants)[number];

interface IndicatorProps {
  variant?: IndicatorVariant;
}

const root = tv({
  base: "relative size-[16px] shrink-0 rounded-[999px]",
});

const glow = tv({
  base: [
    "absolute top-1/2 left-1/2 size-[88px] -translate-x-1/2 -translate-y-1/2 rounded-[999px] opacity-15",
    "transition-[background-color, opacity] duration-300 ease-out",
  ],
  variants: {
    variant: {
      online:
        "bg-[radial-gradient(circle_at_50%_50%,var(--color-jade-9)_0%,transparent_70%)]",
      offline:
        "bg-[radial-gradient(circle_at_50%_50%,var(--color-ruby-9)_0%,transparent_70%)]",
      warning:
        "bg-[radial-gradient(circle_at_50%_50%,var(--color-orange-9)_0%,transparent_70%)]",
      idle: "bg-[radial-gradient(circle_at_50%_50%,var(--color-blue-9)_0%,transparent_70%)] opacity-0 ease-in",
      connecting:
        "bg-[radial-gradient(circle_at_50%_50%,var(--color-blue-9)_0%,transparent_70%)]",
    },
  },
});

const dot = tv({
  base: [
    "absolute top-1/2 left-1/2 size-[8px] -translate-x-1/2 -translate-y-1/2 rounded-[999px] blur-[1px]",
    "transition-[background-color] duration-300 ease-out",
  ],
  variants: {
    variant: {
      online: "bg-jade-9",
      offline: "bg-ruby-9",
      warning: "bg-orange-9",
      idle: "bg-gray-9 ease-in",
      connecting: "bg-blue-9",
    },
  },
});

const DOT_SIZE = 8;
const LOADER_STROKE = 2;
const LOADER_GAP = 2;
const LOADER_SIZE = DOT_SIZE + LOADER_STROKE * 2 + LOADER_GAP * 2;
const GEOMETRY_SCALE = 2;
const GEOMETRY_SIZE = LOADER_SIZE * GEOMETRY_SCALE;
const CX = GEOMETRY_SIZE / 2;
const CY = GEOMETRY_SIZE / 2;
const R = (DOT_SIZE / 2 + LOADER_GAP + LOADER_STROKE / 2) * GEOMETRY_SCALE;
const GEOMETRY_STROKE = LOADER_STROKE * GEOMETRY_SCALE;
const LOADER_NUDGE_X = 0;
const LOADER_NUDGE_Y = 0;
const SPIN_SPEED_DEG_PER_SEC = 1080;
const APPEAR_DURATION_SEC = 0.33;
const DISAPPEAR_DURATION_SEC = 0.33;

function angleToXY(deg: number) {
  const rad = (deg * Math.PI) / 180;
  return {
    x: CX + R * Math.sin(rad),
    y: CY - R * Math.cos(rad),
  };
}

type LoaderPhase = "idle" | "appear" | "spin" | "disappear";

export function Indicator({ variant = "online" }: IndicatorProps) {
  const loaderMaskId = useId().replace(/:/g, "");
  const isConnecting = variant === "connecting";
  const [phase, setPhase] = useState<LoaderPhase>("idle");
  const phaseRef = useRef<LoaderPhase>("idle");
  const anglesRef = useRef({ arcStart: 0, arcEnd: 0 });
  const gapRef = useRef(0);
  const transitionElapsedRef = useRef(0);
  const disappearStartGapRef = useRef(0);
  const loopRef = useRef<{
    rafId: number;
    lastTime: number | null;
    running: boolean;
  }>({
    rafId: 0,
    lastTime: null,
    running: false,
  });
  const [, setFrame] = useState(0);

  const schedulePathUpdate = useCallback(() => {
    setFrame((f) => f + 1);
  }, []);

  const setPhaseState = useCallback((nextPhase: LoaderPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const advanceGap = useCallback(
    (deltaSec: number) => {
      const currentPhase = phaseRef.current;

      if (currentPhase === "appear") {
        transitionElapsedRef.current += deltaSec;
        const progress = Math.min(
          transitionElapsedRef.current / APPEAR_DURATION_SEC,
          1
        );
        if (progress >= 1) {
          transitionElapsedRef.current = 0;
          setPhaseState("spin");
          return { gap: 360, shouldStop: false };
        }
        return { gap: 360 * progress, shouldStop: false };
      }

      if (currentPhase === "spin") {
        return { gap: 360, shouldStop: false };
      }

      if (currentPhase === "disappear") {
        transitionElapsedRef.current += deltaSec;
        const progress = Math.min(
          transitionElapsedRef.current / DISAPPEAR_DURATION_SEC,
          1
        );
        if (progress >= 1) {
          return { gap: 0, shouldStop: true };
        }
        return {
          gap: disappearStartGapRef.current * (1 - progress),
          shouldStop: false,
        };
      }

      return { gap: gapRef.current, shouldStop: true };
    },
    [setPhaseState]
  );

  const runLoop = useCallback(() => {
    if (loopRef.current.running) {
      return;
    }

    loopRef.current.running = true;
    loopRef.current.lastTime = null;

    const tick = (now: number) => {
      if (!loopRef.current.running) {
        return;
      }

      const lastTime = loopRef.current.lastTime;
      if (lastTime === null) {
        loopRef.current.lastTime = now;
        loopRef.current.rafId = requestAnimationFrame(tick);
        return;
      }
      const deltaSec = (now - lastTime) / 1000;
      loopRef.current.lastTime = now;

      if (phaseRef.current === "idle") {
        loopRef.current.running = false;
        return;
      }

      const arcStart =
        anglesRef.current.arcStart - SPIN_SPEED_DEG_PER_SEC * deltaSec;
      const { gap, shouldStop } = advanceGap(deltaSec);
      if (shouldStop) {
        anglesRef.current = { arcStart: 0, arcEnd: 0 };
        gapRef.current = 0;
        transitionElapsedRef.current = 0;
        setPhaseState("idle");
        schedulePathUpdate();
        loopRef.current.running = false;
        return;
      }

      gapRef.current = gap;
      anglesRef.current = {
        arcStart,
        arcEnd: arcStart + gap,
      };
      schedulePathUpdate();

      loopRef.current.rafId = requestAnimationFrame(tick);
    };

    loopRef.current.rafId = requestAnimationFrame(tick);
  }, [advanceGap, schedulePathUpdate, setPhaseState]);

  useEffect(() => {
    if (!isConnecting) {
      if (phaseRef.current === "appear" || phaseRef.current === "spin") {
        disappearStartGapRef.current = gapRef.current;
        transitionElapsedRef.current = 0;
        setPhaseState("disappear");
        runLoop();
      }
      return;
    }

    if (phaseRef.current === "disappear") {
      gapRef.current = 360;
      transitionElapsedRef.current = 0;
      setPhaseState("spin");
      runLoop();
      return;
    }

    if (phaseRef.current === "idle") {
      anglesRef.current = { arcStart: 0, arcEnd: 0 };
      gapRef.current = 0;
      transitionElapsedRef.current = 0;
      setPhaseState("appear");
      schedulePathUpdate();
      runLoop();
    }
  }, [isConnecting, runLoop, schedulePathUpdate, setPhaseState]);

  useEffect(() => {
    return () => {
      loopRef.current.running = false;
      cancelAnimationFrame(loopRef.current.rafId);
    };
  }, []);

  const { arcStart, arcEnd } = anglesRef.current;
  const startPt = angleToXY(arcStart);
  const endPt = angleToXY(arcEnd);

  const span = arcEnd - arcStart;
  const absSpan = Math.abs(span);
  const isFullCircle = absSpan >= 359.5;
  const largeArc = absSpan >= 180 ? 1 : 0;
  const sweep = arcEnd >= arcStart ? 1 : 0;

  let arcPath: string;
  if (absSpan < 0.5) {
    arcPath = "";
  } else if (isFullCircle) {
    const midPt = angleToXY(arcStart + 180);
    arcPath = `M ${startPt.x} ${startPt.y} A ${R} ${R} 0 1 ${sweep} ${midPt.x} ${midPt.y} A ${R} ${R} 0 1 ${sweep} ${endPt.x} ${endPt.y}`;
  } else {
    arcPath = `M ${startPt.x} ${startPt.y} A ${R} ${R} 0 ${largeArc} ${sweep} ${endPt.x} ${endPt.y}`;
  }

  const conicFromDeg = arcStart;
  const conicMask = `conic-gradient(from ${conicFromDeg}deg at 50% 50%, #000 0deg 70deg, #000 180deg, #0000 320deg 360deg)`;

  const showLoader = phase !== "idle";

  return (
    <div aria-label={variant} className={root({})} role="img">
      <div aria-hidden className={glow({ variant })} />
      <div aria-hidden className={dot({ variant })} />

      {showLoader && (
        <svg
          aria-label="Connecting"
          className="absolute size-[16px] overflow-visible"
          role="img"
          shapeRendering="geometricPrecision"
          style={{
            left: "50%",
            top: "50%",
            transform: `translate(-50%, -50%) translate(${LOADER_NUDGE_X}px, ${LOADER_NUDGE_Y}px)`,
          }}
          viewBox={`0 0 ${GEOMETRY_SIZE} ${GEOMETRY_SIZE}`}
        >
          <title>Connecting</title>
          <defs>
            <mask
              height={GEOMETRY_SIZE}
              id={loaderMaskId}
              maskContentUnits="userSpaceOnUse"
              maskUnits="userSpaceOnUse"
              width={GEOMETRY_SIZE}
              x={0}
              y={0}
            >
              {arcPath ? (
                <path
                  d={arcPath}
                  fill="none"
                  stroke="#fff"
                  strokeLinecap="butt"
                  strokeWidth={GEOMETRY_STROKE}
                />
              ) : null}
            </mask>
          </defs>
          {arcPath ? (
            <foreignObject
              height={GEOMETRY_SIZE}
              mask={`url(#${loaderMaskId})`}
              width={GEOMETRY_SIZE}
              x="0"
              y="0"
            >
              <div
                style={{
                  backgroundColor: "var(--color-blue-9)",
                  height: "100%",
                  maskImage: conicMask,
                  WebkitMaskImage: conicMask,
                  width: "100%",
                }}
              />
            </foreignObject>
          ) : null}
        </svg>
      )}
    </div>
  );
}
