import { ROUTES } from "../../routes";

interface ErrorScreenProps {
  route: keyof typeof ROUTES;
}

export default function ErrorScreen({ route }: ErrorScreenProps) {
  if (route !== ROUTES.ERROR) {
    return null;
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 100% 100% at 50% 0%, var(--color-error-5), var(--color-neutral-4))",
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-3">
        <p className="text-title font-medium text-error-12">
          An unexpected error has occurred
        </p>
        <p className="text-body text-neutral-a-11">Try restarting the plugin</p>
      </div>
    </div>
  );
}
