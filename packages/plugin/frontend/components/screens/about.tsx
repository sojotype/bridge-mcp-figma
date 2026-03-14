import { Tooltip } from "@base-ui/react/tooltip";
import { Activity } from "react";
import { DOCS_URL, GITHUB_URL } from "../../../lib/constants";
import { ROUTES } from "../../routes";
import { Button } from "../ui/button";
import type { IconName } from "../ui/icon";

const EMAIL_URL = "mailto:contact@example.com";

const LINK_BUTTONS: { href: string; iconName: IconName; ariaLabel: string }[] =
  [
    { href: GITHUB_URL, iconName: "github", ariaLabel: "GitHub" },
    { href: GITHUB_URL, iconName: "globe", ariaLabel: "Website" },
    { href: DOCS_URL, iconName: "document", ariaLabel: "Documentation" },
    { href: EMAIL_URL, iconName: "mail", ariaLabel: "Contact" },
  ];

interface AboutScreenProps {
  route: keyof typeof ROUTES;
}

export default function AboutScreen({ route }: AboutScreenProps) {
  return (
    <Activity mode={route === ROUTES.ABOUT ? "visible" : "hidden"}>
      <section className="flex h-full flex-col justify-center gap-5 pt-10">
        <div className="flex flex-col gap-1 px-3 text-center">
          <p className="text-title font-medium text-neutral-12">
            Cursor to Figma: MCP Service
          </p>
          <p className="text-body text-neutral-11">
            v{__PLUGIN_VERSION__} by sojotype
          </p>
        </div>

        <Tooltip.Provider delay={500} timeout={500}>
          <div className="flex justify-center gap-3">
            {LINK_BUTTONS.map(({ href, iconName, ariaLabel }) => (
              <Button
                as="a"
                className="rounded"
                href={href}
                iconName={iconName}
                key={ariaLabel}
                rel="noreferrer"
                showIcon
                showLabel={false}
                variant="alpha"
              >
                {ariaLabel}
              </Button>
            ))}
          </div>
        </Tooltip.Provider>
      </section>
    </Activity>
  );
}
