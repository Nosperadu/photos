import React from "react";
import { useParams, Link } from "react-router-dom";
import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";

export default function SeriesPage() {
  const { id } = useParams();
  const current = series.find((s) => s.id === id);

  if (!current) {
    return (
      <div style={{ padding: 24 }}>
        <p>Serie nicht gefunden.</p>
        <Link to="/">← Zurück</Link>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="wrap">
        <Link to="/" className="backlink">← Zurück</Link>
        <h2 className="series-title">{current.title}</h2>
        <section className="grid">
          {current.images.map((img, i) => (
            <figure key={i} className="span-4">
              <img src={img.src} alt={img.title} />
              <figcaption>{img.title}</figcaption>
            </figure>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  );
}