import React, { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";

export default function SeriesPage() {
  const { id } = useParams();
  const current = series.find((s) => s.id === id);

  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  const items = useMemo(() => current?.images ?? [], [current]);

  if (!current) {
    return (
      <main className="wrap" style={{ paddingTop: 24 }}>
        <p><Link to="/" className="backlink">← Zurück</Link></p>
        <h2 className="series-title">Serie nicht gefunden</h2>
      </main>
    );
  }

  return (
    <div>
      <Header />
      <main className="wrap">
        <Link to="/" className="backlink">← Zurück</Link>
        <h2 className="series-title">{current.title}</h2>
        <section className="grid">
          {items.map((img, i) => (
            <figure key={i} className="span-4">
              <img
                src={img.src}
                alt={img.title}
                onClick={() => { setIdx(i); setOpen(true); }}
                style={{ cursor: "zoom-in" }}
              />
              <figcaption>{img.title}</figcaption>
            </figure>
          ))}
        </section>
      </main>
      <Footer />

      {/* Lightbox */}
      <Lightbox
        open={open}
        items={items}
        index={idx}
        onClose={() => setOpen(false)}
        onIndex={setIdx}
      />
    </div>
  );
}