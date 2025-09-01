import { UI_FLAGS } from "./ui.flags.js";

export function applyUiFlags() {
  const root = document.documentElement;
  Object.entries(UI_FLAGS).forEach(([key, val]) => {
    const cls = "f-" + key.toLowerCase().replace(/_/g, "-");
    root.classList.toggle(cls, !!val);
  });
}