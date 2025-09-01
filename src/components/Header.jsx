// src/components/Header.jsx
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="mast">
      <div className="brand">
        <h1>Jonas Németh</h1>
        <div className="strap">Street • Architecture • Landscape</div>
      </div>
      <div className="aside">
        <a href="https://www.instagram.com/jonasnemeth_/" target="_blank" rel="noopener">
          @jonasnemeth_
        </a>
        <Link to="/">🏠</Link>
      </div>
    </header>
  );
}