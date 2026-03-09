import { useNavigate } from "react-router";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { Button } from "../ui/button";
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
  const endpointType = route === ROUTES.ROOT ? "mcp" : "websocket";
  const { state: endpoint } = useEndpoint(endpointType);

  if (route !== ROUTES.ROOT && route !== ROUTES.WEBSOCKET) {
    return null;
  }

  const isUrlValid = isValidHttpUrl(endpoint.url);

  if (route === ROUTES.ROOT) {
    return (
      <footer className="flex w-full items-center justify-between px-3 pt-4 pb-3">
        <ValidationMessage
          message={isUrlValid ? "Config looks good" : "Enter correct URL"}
          tone={isUrlValid ? "neutral" : "error"}
        />
        <Button onClick={() => navigate(ROUTES.WEBSOCKET)} tone="primary">
          Next
        </Button>
      </footer>
    );
  }

  if (route === ROUTES.WEBSOCKET) {
    return (
      <footer className="flex w-full items-center justify-between px-3 pt-5 pb-3">
        <Button
          className="rotate-180"
          iconName="caretRight"
          onClick={() => navigate(ROUTES.ROOT)}
          showIcon
        />

        <ValidationMessage
          message={isUrlValid ? "Config looks good" : "Enter correct URL"}
          tone={isUrlValid ? "neutral" : "error"}
        />
        <Button onClick={() => navigate(ROUTES.SESSION)}>Next</Button>
      </footer>
    );
  }

  return null;
}
