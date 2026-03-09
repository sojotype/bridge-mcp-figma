import { ROUTES } from "../../routes";

interface MiniScreenProps {
  route: keyof typeof ROUTES;
}

export default function MiniScreen({ route }: MiniScreenProps) {
  return route === ROUTES.MINI ? <div>Mini</div> : null;
}
