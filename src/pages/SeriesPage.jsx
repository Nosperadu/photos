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
  // REVEAL-EFFEKT (Bilder einblenden beim Scrollen)
  // =============================
  // .reveal-scope sorgt dafür, dass der Effekt nur hier greift.
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    // Erst nach Mount → Klasse "reveal-ready" hinzufügen
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);

  // Hook aktiviert IntersectionObserver
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

    // Standard-Heuristik + optional Tuning über Flag
    const cls = UI_FLAGS.RATIO_TWEAKS
      ? (r > 2.2 ? "span-12"
        : r > 1.7 ? "span-10"
        : r > 1.35 ? "span-8"
        : r < 0.85 ? "span-4" : "span-6")
      : (r > 2.2 ? "span-12"
        : r > 1.6 ? "span-10"
        : r > 1.3 ? "span-8"
        : r < 0.85 ? "span-4" : "span-6");

    setSpanClasses(prev => {
      const next = [...prev];
      next[i] = cls;
      return next;
    });
  }

  // =============================
  // LIGHTBOX (Bild groß öffnen)
  // =============================
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // =============================
  // OFFSETS (Whitespace im Grid, Magazin-Look)
  // =============================
  const OFFSETS_ENABLED = true; // auf false setzen → alle Bilder normal

  function offsetClassFor(i, img) {
    if (!OFFSETS_ENABLED) return "";
    const lower = (img?.src || "").toLowerCase();
    if (lower.includes("-pano")) return "";    // Panoramen nicht versetzen
    return (i % 3 === 2) ? "offset-2" : "";    // Beispiel: jedes 3. Bild versetzt
  }

  // =============================
  // HERO-BILD (optional Full-Bleed ganz oben)
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

        {/* optionales Section-Label */}
        {UI_FLAGS.SECTION_LABEL && (
          <div className="section-label">Selected Works</div>
        )}

        {/* Hero-Bild, wenn Flag aktiv und vorhanden */}
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
            const offset = offsetClassFor(i, img);
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