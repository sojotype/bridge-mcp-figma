import { Activity } from "react";
import { ROUTES } from "../../routes";

export default function SessionScreen({
  route,
}: {
  route: keyof typeof ROUTES;
}) {
  return (
    <Activity mode={route === ROUTES.SESSION ? "visible" : "hidden"}>
      <div>Session</div>
    </Activity>
  );
}
