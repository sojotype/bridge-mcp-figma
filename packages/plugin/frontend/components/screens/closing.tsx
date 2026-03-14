import { ROUTES } from "../../routes";
import { useSession } from "../../stores/session";

interface ClosingScreenProps {
  route: keyof typeof ROUTES;
}

export default function ClosingScreen({ route }: ClosingScreenProps) {
  const { closingGraceful } = useSession();

  if (route !== ROUTES.CLOSING) {
    return null;
  }

  const secondsRemaining = closingGraceful?.secondsRemaining ?? 5;

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 100% 100% at 50% 0%, var(--color-primary-5), var(--color-neutral-4))",
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-3 text-center">
        <p className="text-title font-medium text-primary-12">
          This instance will be closed on command from another instance in{" "}
          {secondsRemaining} second{secondsRemaining === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}
