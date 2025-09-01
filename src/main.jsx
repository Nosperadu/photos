import React from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import SeriesPage from "./pages/SeriesPage.jsx";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/series/:id" element={<SeriesPage />} />
    </Routes>
  </HashRouter>
);