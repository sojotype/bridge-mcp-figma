import { GITHUB_URL } from "../../../lib/constants";
import { Button } from "../ui/button";

export function SupportLink() {
  return (
    <Button
      as="a"
      className="rounded"
      href={GITHUB_URL}
      iconName="lightning"
      rel="noreferrer"
      showIcon
      tone="success"
      variant="alpha"
    >
      Support this project
    </Button>
  );
}
