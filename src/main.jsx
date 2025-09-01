// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home.jsx";
import SeriesPage from "./pages/SeriesPage.jsx";
import "./styles.css";
import Impressum from "./pages/Impressum.jsx";

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/series/:id" element={<SeriesPage />} />
      <Route path="/impressum" element={<Impressum />} />
    </Routes>
  </HashRouter>
);