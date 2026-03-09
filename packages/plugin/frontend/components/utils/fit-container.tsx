import { type PropsWithChildren, useCallback, useEffect, useRef } from "react";
import { frontendBroker } from "../../utils/frontend-broker";

interface FitContainerProps extends PropsWithChildren {
  className?: string;
}

export function FitContainer({ children, className }: FitContainerProps) {
  const lastSentHeightRef = useRef<number>(0);
  const ref = useRef<HTMLDivElement>(null);

  const sendHeight = useCallback(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const nextHeight = Math.round(el.scrollHeight);
    if (nextHeight <= 0 || nextHeight === lastSentHeightRef.current) {
      return;
    }
    lastSentHeightRef.current = nextHeight;
    frontendBroker.post("uiResize", { height: nextHeight });
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    sendHeight();
    const observer = new ResizeObserver(sendHeight);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sendHeight]);

  return (
    <div className={className}>
      <div className="flex w-full shrink-0 flex-col" ref={ref}>
        {children}
      </div>
    </div>
  );
}
