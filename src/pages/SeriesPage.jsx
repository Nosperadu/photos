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
  // REVEAL-EFFEKT
  // =============================
  const sectionRef = useRef(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);
  useReveal(".reveal-scope figure");

  // =============================
  // GRID-SPANNEN (aspektabhängig)
  // =============================
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6")
  );

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h;

    // Magazin-Logik (die wir heute hatten):
    // >2.1 → span-12 (Panorama / sehr breit)
    // >1.6 → span-10 (Landscape)
    // >1.3 → span-8  (leicht breiter)
    // 0.9–1.3 → span-8 (Quadrat & moderate Portraits → nicht zu klein!)
    // 0.75–0.9 → span-6
    // <0.75 → span-6 (kein span-4 mehr, damit Portraits nicht winzig sind)
    let cls =
      r > 2.1 ? "span-12" :
      r > 1.6 ? "span-10" :
      r > 1.3 ? "span-8"  :
      r >= 0.9 ? "span-8" :
      r >= 0.75 ? "span-6" :
      "span-6";

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
  // OFFSETS (Whitespace)
  // =============================
  const OFFSETS_ENABLED = true;

  function offsetClassFor(i, img, span) {
    if (!OFFSETS_ENABLED) return "";

    // Nur bei großen Kacheln, damit kleine nicht verloren gehen
    const isBig = span === "span-8" || span === "span-10" || span === "span-12";
    if (!isBig) return "";

    const lower = (img?.src || "").toLowerCase();
    if (lower.includes("-pano") || lower.includes("-hero")) return "";

    // Jede 3. große Kachel versetzt
    return (i % 3 === 2) ? "offset-2" : "";
  }

  // =============================
  // HERO-BILD (optional Full-Bleed)
  // =============================
  const heroIdx = UI_FLAGS.HERO
    ? items.findIndex(it => it.src.toLowerCase().includes("-hero"))
    : -1;
  const hero = heroIdx >= 0 ? items[heroIdx] : null;

  // =============================
  // FALLBACK
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

        {UI_FLAGS.SECTION_LABEL && (
          <div className="section-label">Selected Works</div>
        )}

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

        <section className="grid reveal-scope" ref={sectionRef}>
          {items.map((img, i) => {
            if (i === heroIdx) return null;
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