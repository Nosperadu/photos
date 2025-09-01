import { useEffect, useState } from "react";

export function useTheme() {
  const KEY = "theme";
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem(KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}