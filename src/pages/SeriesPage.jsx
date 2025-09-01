import React, { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";

export default function SeriesPage() {
  const { id } = useParams();
  const current = series.find((s) => s.id === id);
  const items = useMemo(() => current?.images ?? [], [current]);

  // =============================
  // CONFIG: Offsets (Whitespace)
  // =============================
  // Global an/aus:
  const OFFSETS_ENABLED = false;

  // Definiere hier deine Versatz-Logik:
  // - Beispiel A: jedes 3. Bild (Index 2, 5, 8, …) bekommt offset-2
  // - Beispiel B: Dateiname enthält "-pano" => kein Offset (weil meist schon groß)
  function offsetClassFor(i, img) {
    if (!OFFSETS_ENABLED) return "";
    const lower = (img?.src || "").toLowerCase();
    if (lower.includes("-pano")) return "";        // Beispiel B: Panos ohne Offset
    return (i % 3 === 2) ? "offset-2" : "";        // Beispiel A: jedes 3. Bild
  }

  // =============================
  // Dynamische Spaltenbreiten
  // =============================
  // spanClasses[i] => "span-12" | "span-10" | "span-8" | "span-6" | "span-4"
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6") // Startwert
  );

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h; // aspect ratio

    // Heuristik für moderne Magazine:
    // >2.2 = Panorama (Hero), >1.6 = Landscape sehr groß,
    // >1.3 = Landscape groß, 0.85–1.3 = Normal (span-6), <0.85 = Portrait/Tall
    const cls =
      r > 2.2 ? "span-12" :
      r > 1.6 ? "span-10" :
      r > 1.3 ? "span-8"  :
      r < 0.85 ? "span-4" : "span-6";

    setSpanClasses(prev => {
      const next = [...prev];
      next[i] = cls;
      return next;
    });
  }

  // =============================
  // Lightbox
  // =============================
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

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
          {items.map((img, i) => {
            const span = spanClasses[i];
            const offset = offsetClassFor(i, img); // <<— Offsets hier einmischen
            const classes = `${span} ${offset}`.trim();

            return (
              <figure key={i} className={classes}>
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  onLoad={e => {
                    const el = e.currentTarget;
                    handleMeasured(i, el.naturalWidth, el.naturalHeight);
                  }}
                  style={{ cursor: "zoom-in" }}
                  onClick={() => { setIdx(i); setOpen(true); }}
                  sizes="(max-width:640px) 100vw, (max-width:1100px) 50vw, 33vw"
                />
                <figcaption>{img.title}</figcaption>
              </figure>
            );
          })}
        </section>
      </main>
      <Footer />

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