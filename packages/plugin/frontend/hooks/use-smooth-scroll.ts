import { useEffect } from "react";

export function useSmoothScroll(ref: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    let targetScrollLeft = el.scrollLeft;
    let rafId: number;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const animate = () => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      const diff = targetScrollLeft - el.scrollLeft;

      // Snap immediately at edges to avoid lerp precision issues (4px offset)
      if (targetScrollLeft <= 0 || targetScrollLeft >= maxScroll) {
        el.scrollLeft = targetScrollLeft <= 0 ? 0 : maxScroll;
        return;
      }
      if (Math.abs(diff) < 0.5) {
        el.scrollLeft = targetScrollLeft;
        return;
      }
      el.scrollLeft = lerp(el.scrollLeft, targetScrollLeft, 0.12);
      rafId = requestAnimationFrame(animate);
    };

    const handleWheel = (e: WheelEvent) => {
      const hasHorizontalOverflow = el.scrollWidth > el.clientWidth;
      const delta =
        Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (delta === 0) {
        return;
      }
      if (hasHorizontalOverflow) {
        e.preventDefault();
        const maxScroll = el.scrollWidth - el.clientWidth;
        targetScrollLeft = Math.max(
          0,
          Math.min(maxScroll, targetScrollLeft + delta)
        );
        // Snap target to edges when within threshold (discrete delta remainder)
        if (targetScrollLeft <= 4) {
          targetScrollLeft = 0;
        }
        if (targetScrollLeft >= maxScroll - 4) {
          targetScrollLeft = maxScroll;
        }
        cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(animate);
      }
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", handleWheel);
      cancelAnimationFrame(rafId);
    };
  }, [ref.current]);
}
