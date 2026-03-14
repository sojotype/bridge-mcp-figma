import { frontendBroker } from "../../lib/frontend-broker";
import { ROUTES } from "../../routes";
import { useSettings } from "../../stores/settings";
import { Button } from "../ui/button";

interface DuplicatedScreenProps {
  route: keyof typeof ROUTES;
}

export default function DuplicatedScreen({ route }: DuplicatedScreenProps) {
  const { port } = useSettings();

  if (route !== ROUTES.DUPLICATED) {
    return null;
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 100% 100% at 50% 0%, var(--color-warning-5), var(--color-neutral-4))",
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5 px-3 text-center">
        <p className="text-title font-medium text-warning-12">
          The plugin is already running on this file in another tab
        </p>
        <Button
          className="rounded"
          onClick={() => {
            frontendBroker.post("takeOver", { port });
          }}
          variant="alpha"
        >
          Continue here
        </Button>
      </div>
    </div>
  );
}
