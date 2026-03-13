import { motion } from "motion/react";
import { ROUTES } from "../../routes";

interface LoadingScreenProps {
  route: keyof typeof ROUTES;
}

export default function LoadingScreen({ route }: LoadingScreenProps) {
  if (route !== ROUTES.LOADING) {
    return null;
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col overflow-hidden bg-neutral-4"
      style={{
        backgroundImage:
          "radial-gradient(ellipse 100% 100% at 50% 0%, var(--color-primary-5), var(--color-neutral-4))",
      }}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-5">
        {/* Title */}
        <p className="text-title font-medium text-primary-12">
          Cursor to Figma
        </p>

        {/* Loader */}
        <div className="flex h-[18px] w-[200px] items-center gap-0 opacity-50">
          {/* Left bracket */}
          <div className="h-full w-[8px] border-t border-b border-l border-primary-11 opacity-50" />

          {/* Progress bar */}
          <motion.div
            animate={{ scaleX: [0, 1] }}
            className="flex-1"
            style={{
              transformOrigin: "center",
              scaleX: 0,
            }}
            transition={{
              duration: 0.4,
              ease: "easeIn",
            }}
          >
            <div className="h-[2px] w-full bg-primary-11" />
          </motion.div>

          {/* Right bracket */}
          <div className="h-full w-[8px] border-t border-r border-b border-primary-11 opacity-50" />
        </div>
      </div>
    </div>
  );
}
