import { tv } from "tailwind-variants";

interface GradientProps {
  direction: "vertical" | "horizontal";
  tone: "neutral" | "info" | "success";
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
      neutral: "from-grayA-3 to-grayA-1",
      info: "from-blueA-3 to-blueA-1",
      success: "from-jadeA-3 to-jadeA-1",
    },
  },
  compoundVariants: [
    {
      direction: "vertical",
      tone: "success",
      class: "from-jade-6 to-jadeA-1",
    },
    {
      direction: "vertical",
      tone: "neutral",
      class: "from-gray-6 to-grayA-1",
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
