// src/components/Footer.jsx
import React from "react";
export default function Footer() {
  return (
    <footer>
      <div>© {new Date().getFullYear()} Jonas Németh</div>
      <div><a href="https://www.instagram.com/jonasnemeth_/" target="_blank" rel="noopener">@jonas.bild</a></div>
      <a href="/#/impressum">Impressum</a>
    </footer>
  );
}