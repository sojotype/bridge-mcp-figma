import { Button } from "../ui/button";

interface BackButtonProps {
  onClick: () => void;
  className?: string;
  variant?: "solid" | "alpha";
}

export function BackButton({
  onClick,
  className,
  variant = "solid",
}: BackButtonProps) {
  return (
    <Button
      className={["rotate-180 rounded", className].filter(Boolean).join(" ")}
      iconName="caretRight"
      onClick={onClick}
      showIcon
      showLabel={false}
      variant={variant}
    >
      Back
    </Button>
  );
}
