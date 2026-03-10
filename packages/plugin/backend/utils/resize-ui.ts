import { PLUGIN_WIDTH } from "../const";

export function resizeUi(height: number): void {
  const rounded = Math.round(height);
  if (!Number.isFinite(rounded) || rounded <= 0) {
    return;
  }
  figma.ui.resize(PLUGIN_WIDTH, rounded);
}
