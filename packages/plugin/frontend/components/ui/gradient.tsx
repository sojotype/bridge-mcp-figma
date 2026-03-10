import { tv } from "../../lib/tv";

interface GradientProps {
  direction: "vertical" | "horizontal";
  tone: "neutral" | "primary" | "success";
  className?: string;
  children: React.ReactNode;
}

const style = tv({
  base: "",
  variants: {
    direction: {
      horizontal: "bg-linear-to-r",
      vertical: "bg-linear-to-b",
    },
    tone: {
      neutral: "from-neutral-a-3 to-neutral-a-1",
      primary: "from-primary-a-3 to-primary-a-1",
      success: "from-success-a-3 to-success-a-1",
    },
  },
  compoundVariants: [
    {
      direction: "vertical",
      tone: "success",
      class: "from-success-6 to-success-a-1",
    },
    {
      direction: "vertical",
      tone: "neutral",
      class: "from-neutral-6 to-neutral-a-1",
    },
  ],
});

export const Gradient = ({
  direction,
  tone,
  className,
  children,
}: GradientProps) => {
  return (
    <div className={style({ direction, tone, className })}>{children}</div>
  );
};
