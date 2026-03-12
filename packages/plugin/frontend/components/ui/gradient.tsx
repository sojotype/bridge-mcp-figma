import { motion } from "motion/react";

interface GradientProps {
  tone: "neutral" | "primary" | "success";
  className?: string;
  direction?: "right" | "bottom";
  children: React.ReactNode;
}

const TONES: Array<"neutral" | "primary" | "success"> = [
  "neutral",
  "primary",
  "success",
];

const gradientStyle = (
  t: (typeof TONES)[number],
  direction: GradientProps["direction"]
) =>
  `linear-gradient(to ${direction}, var(--color-${t}-a-3), var(--color-${t}-a-1))`;

export const Gradient = ({
  tone,
  className,
  direction = "right",
  children,
}: GradientProps) => {
  return (
    <div className={`relative overflow-hidden ${className ?? ""}`}>
      {TONES.map((t) => (
        <motion.div
          animate={{ opacity: t === tone ? 1 : 0 }}
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          initial={false}
          key={t}
          style={{ backgroundImage: gradientStyle(t, direction) }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      ))}
      {children}
    </div>
  );
};
