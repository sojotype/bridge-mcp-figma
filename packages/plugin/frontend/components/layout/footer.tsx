import { useNavigate } from "react-router";
import { useSnapshot } from "valtio";
import { ROUTES } from "../../routes";
import { endpointsStore } from "../../stores/endpoints";
import { Button } from "../ui/button";
import { Icon } from "../ui/icon";
import { ValidationMessage } from "../utils/validation-message";

function isValidHttpUrl(value: string) {
  if (value.trim() === "") {
    return false;
  }

  try {
    const parsedUrl = new URL(value);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

interface FooterProps {
  route: keyof typeof ROUTES;
}

export default function Footer({ route }: FooterProps) {
  const navigate = useNavigate();
  const endpoints = useSnapshot(endpointsStore);

  if (route !== ROUTES.ROOT && route !== ROUTES.WEBSOCKET) {
    return null;
  }

  const section = route === ROUTES.ROOT ? endpoints.mcp : endpoints.websocket;
  const mode = section.selectedMode;
  const selectedEndpoint = section[mode];
  const selectedUrl = selectedEndpoint.userUrl ?? selectedEndpoint.defaultUrl;
  const isUrlValid = isValidHttpUrl(selectedUrl);

  if (route === ROUTES.WEBSOCKET) {
    return (
      <footer className="flex w-full items-center justify-between px-3 pt-5 pb-3">
        <button
          aria-label="Back to MCP"
          className="inline-flex size-7 items-center justify-center rounded-[4px] bg-neutral-6 text-neutral-12 transition-[background-color] duration-300 ease-out hover:bg-neutral-7 hover:transition-none"
          onClick={() => navigate(ROUTES.ROOT)}
          type="button"
        >
          <Icon className="size-4 rotate-180" name="caretRight" />
        </button>
        <ValidationMessage
          message={isUrlValid ? "Config looks good" : "Enter correct URL"}
          tone={isUrlValid ? "neutral" : "error"}
        />
        <Button onClick={() => navigate(ROUTES.SESSION)}>Next</Button>
      </footer>
    );
  }

  return (
    <footer className="flex w-full items-center justify-between px-3 pt-4 pb-3">
      <ValidationMessage
        message={isUrlValid ? "Config looks good" : "Enter correct URL"}
        tone={isUrlValid ? "neutral" : "error"}
      />
      <Button tone="primary">Next</Button>
    </footer>
  );
}
