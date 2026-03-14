import { motion } from "motion/react";

interface GradientProps {
  tone: "neutral" | "primary" | "success";
  className?: string;
  direction?: "right" | "bottom";
  children: React.ReactNode;
}

const TONES: Record<GradientProps["tone"], [string, string]> = {
  neutral: ["--color-neutral-a-3", "--color-neutral-a-1"],
  primary: ["--color-primary-a-3", "--color-primary-a-1"],
  success: ["--color-success-a-3", "--color-success-a-1"],
};

const gradientStyle = (
  colors: [string, string],
  direction: GradientProps["direction"]
) => `linear-gradient(to ${direction}, var(${colors[0]}), var(${colors[1]}))`;

export const Gradient = ({
  tone,
  className,
  direction = "right",
  children,
}: GradientProps) => {
  return (
    <div className={`relative ${className ?? ""}`}>
      {Object.entries(TONES).map(([t, colors]) => (
        <motion.div
          animate={{ opacity: tone === t ? 1 : 0 }}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          initial={false}
          key={t}
          style={{
            backgroundImage: gradientStyle(colors, direction),
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ))}
      {children}
    </div>
  );
};
