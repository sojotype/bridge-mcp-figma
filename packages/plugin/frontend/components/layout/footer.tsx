import { useNavigate } from "react-router";
import { useValidUrl } from "../../hooks/use-valid-url";
import { ROUTES } from "../../routes";
import { useEndpoint } from "../../stores/endpoints";
import { Button } from "../ui/button";
import { ValidationMessage } from "../utils/validation-message";

interface FooterProps {
  route: keyof typeof ROUTES;
}

export default function Footer({ route }: FooterProps) {
  const navigate = useNavigate();
  const endpointType = route === ROUTES.ROOT ? "mcp" : "websocket";
  const { state: endpoint } = useEndpoint(endpointType);
  const { isValid } = useValidUrl(endpoint.url, endpoint.routing);

  if (route !== ROUTES.ROOT && route !== ROUTES.WEBSOCKET) {
    return null;
  }

  if (route === ROUTES.ROOT) {
    return (
      <footer className="flex w-full items-center justify-between px-3 pt-4 pb-3">
        {!isValid && (
          <ValidationMessage
            message={"Enter correct URL"}
            tone={isValid ? "neutral" : "error"}
          />
        )}
        <Button
          className="ml-auto self-end"
          onClick={() => navigate(ROUTES.WEBSOCKET)}
          tone={isValid ? "primary" : "neutral"}
        >
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

        {!isValid && (
          <ValidationMessage
            message={"Enter correct URL"}
            tone={isValid ? "neutral" : "error"}
          />
        )}
        <Button onClick={() => navigate(ROUTES.SESSION)}>Next</Button>
      </footer>
    );
  }

  return null;
}
