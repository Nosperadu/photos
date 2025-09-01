import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { UI_FLAGS } from "../ui.flags.js";
import { useReveal } from "../hooks/useReveal.js";

export default function SeriesPage() {
  const { id } = useParams();
  const current = series.find((s) => s.id === id);
  const items = useMemo(() => current?.images ?? [], [current]);

  // =============================
  // REVEAL-EFFEKT (nur hier; sichtbar bis JS ready ist)
  // =============================
  const sectionRef = useRef(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    // Erst nach Mount → Klasse "reveal-ready" hinzufügen
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);
  useReveal(".reveal-scope figure");

  // =============================
  // SPALTENKLASSEN (Grid-Größen je nach Seitenverhältnis)
  // =============================
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6") // Startwert
  );

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h; // aspect ratio

    // Angepasste Heuristik:
    // Breite Bilder großzügiger einstufen → wirken nicht mehr "zu klein"
    // >1.9 → 12 | >1.6 → 10 | >1.3 → 8 | 0.85–1.3 → 6 | <0.85 → 4
    let cls =
      r > 1.9 ? "span-12" :
      r > 1.6 ? "span-10" :
      r > 1.3 ? "span-8"  :
      r < 0.85 ? "span-4" : "span-6";

    // Notbremse (falls du nie span-4 willst → einfach aktivieren)
    // if (cls === "span-4") cls = "span-6";

    setSpanClasses(prev => {
      const next = [...prev];
      next[i] = cls;
      return next;
    });
  }

  // =============================
  // LIGHTBOX
  // =============================
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // =============================
  // OFFSETS (Whitespace für Magazin-Look)
  // =============================
  const OFFSETS_ENABLED = true; // auf false setzen → alle Offsets aus

  function offsetClassFor(i, img, span) {
    if (!OFFSETS_ENABLED) return "";

    const lower = (img?.src || "").toLowerCase();

    // Spezielle Dateien nicht versetzen (damit sie "ankern")
    if (lower.includes("-pano") || lower.includes("-hero")) return "";

    // Nur große Kacheln versetzen
    const isBig = span === "span-8" || span === "span-10" || span === "span-12";
    if (!isBig) return "";

    // Sehr breite Bilder (span-10 / span-12) nicht versetzen → wirken sonst kleiner
    if (span === "span-10" || span === "span-12") return "";

    // Beispiel: jedes 3. große Bild leicht versetzen
    return (i % 3 === 2) ? "offset-2" : "";
  }

  // =============================
  // HERO-BILD (optional Full-Bleed oben; Dateiname enthält "-hero")
  // =============================
  const heroIdx = UI_FLAGS.HERO
    ? items.findIndex(it => it.src.toLowerCase().includes("-hero"))
    : -1;
  const hero = heroIdx >= 0 ? items[heroIdx] : null;

  // =============================
  // FALLBACK: Serie nicht gefunden
  // =============================
  if (!current) {
    return (
      <main className="wrap" style={{ paddingTop: 24 }}>
        <p><Link to="/" className="backlink">← Zurück</Link></p>
        <h2 className="series-title">Serie nicht gefunden</h2>
      </main>
    );
  }

  // =============================
  // RENDER
  // =============================
  return (
    <div>
      <Header />
      <main className="wrap">
        <Link to="/" className="backlink">← Zurück</Link>
        <h2 className="series-title">{current.title}</h2>

        {/* Optional: Section Label */}
        {UI_FLAGS.SECTION_LABEL && (
          <div className="section-label">Selected Works</div>
        )}

        {/* Hero-Bild, wenn Flag aktiv */}
        {hero && (
          <figure
            className="hero"
            onClick={() => { setIdx(heroIdx); setOpen(true); }}
            style={{ cursor: "zoom-in" }}
          >
            <img src={hero.src} alt={hero.title} />
            <figcaption>{hero.title}</figcaption>
          </figure>
        )}

        {/* Galerie */}
        <section className="grid reveal-scope" ref={sectionRef}>
          {items.map((img, i) => {
            if (i === heroIdx) return null; // Hero nicht doppelt
            const span = spanClasses[i];
            const offset = offsetClassFor(i, img, span);
            const classes = `${span} ${offset}`.trim();

            return (
              <figure key={i} className={classes}>
                <img
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  onLoad={(e) => {
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