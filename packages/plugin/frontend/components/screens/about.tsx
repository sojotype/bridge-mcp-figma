import { Activity } from "react";
import { frontendBroker } from "../../lib/frontend-broker";
import { ROUTES } from "../../routes";
import { settingsStore, useSettings } from "../../stores/settings";
import { Checkbox } from "../ui/checkbox";
import { Icon, type IconName } from "../ui/icon";

const GITHUB_URL = "https://github.com/sojotype/bridge-mcp-figma";
const DOCS_URL = "https://github.com/sojotype/bridge-mcp-figma#readme";
const EMAIL_URL = "mailto:contact@example.com";

const LINK_BUTTONS: { href: string; iconName: IconName; ariaLabel: string }[] =
  [
    { href: GITHUB_URL, iconName: "github", ariaLabel: "GitHub" },
    { href: GITHUB_URL, iconName: "globe", ariaLabel: "Project site" },
    { href: DOCS_URL, iconName: "document", ariaLabel: "Documentation" },
    { href: EMAIL_URL, iconName: "mail", ariaLabel: "Contact email" },
  ];

interface AboutScreenProps {
  route: keyof typeof ROUTES;
}

export default function AboutScreen({ route }: AboutScreenProps) {
  const { persistSettings } = useSettings();

  const handlePersistChange = (checked: boolean | "indeterminate") => {
    const persist = checked === true;
    settingsStore.persistSettings = persist;
    frontendBroker.post("setPersistSettings", { persist });
  };

  return (
    <Activity mode={route === ROUTES.ABOUT ? "visible" : "hidden"}>
      <section className="flex flex-col gap-5 pt-10">
        <div className="flex flex-col gap-1 px-3 text-center">
          <p className="text-title font-medium text-neutral-12">
            Cursor to Figma: MCP Service
          </p>
          <p className="text-body text-neutral-11">
            v{__PLUGIN_VERSION__} by sojotype
          </p>
        </div>

        <div className="flex justify-center gap-3">
          {LINK_BUTTONS.map(({ href, iconName, ariaLabel }) => (
            <a
              aria-label={ariaLabel}
              className="inline-flex size-7 items-center justify-center rounded-[4px] bg-neutral-a-4 text-neutral-12 transition-colors hover:bg-neutral-a-5"
              href={href}
              key={href + iconName}
              rel="noreferrer"
              target="_blank"
            >
              <Icon
                aria-hidden
                className="size-4"
                focusable="false"
                name={iconName}
              />
            </a>
          ))}
        </div>

        <div className="flex justify-center px-3">
          <Checkbox
            checked={persistSettings}
            onCheckedChange={handlePersistChange}
            text="Save plugin settings"
          />
        </div>
      </section>
    </Activity>
  );
}
