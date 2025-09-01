import React from "react";
import { useTheme } from "../hooks/useTheme.js";

export default function Header() {
  const [theme, setTheme] = useTheme();

  return (
    <header className="mast">
      <div className="brand">
        <h1>Jonas Németh</h1>
        <div className="strap">Street · Architecture · Landscape</div>
      </div>
      <div className="aside">
        <nav className="theme-toggle">
          <button
            className={theme === "light" ? "active" : ""}
            onClick={() => setTheme("light")}
          >
            Light
          </button>
          <button
            className={theme === "dark" ? "active" : ""}
            onClick={() => setTheme("dark")}
          >
            Dark
          </button>
        </nav>
      </div>
    </header>
  );
}