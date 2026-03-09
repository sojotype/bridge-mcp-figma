import { ROUTES } from "../../routes";

interface AboutScreenProps {
  route: keyof typeof ROUTES;
}

export default function AboutScreen({ route }: AboutScreenProps) {
  return route === ROUTES.ABOUT ? <div>About</div> : null;
}
