import { tv } from "../../lib/tv";

type ValidationMessageTone = "neutral" | "error";

interface ValidationMessageProps {
  message: string;
  tone?: ValidationMessageTone;
  className?: string;
}

const validationMessage = tv({
  base: "text-body",
  variants: {
    tone: {
      neutral: "text-neutral-10",
      error: "text-error-10",
    },
  },
  defaultVariants: {
    tone: "neutral",
  },
});

export function ValidationMessage({
  message,
  tone = "neutral",
  className,
}: ValidationMessageProps) {
  return <p className={validationMessage({ tone, className })}>{message}</p>;
}
