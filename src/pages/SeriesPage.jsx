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
    // Nach Mount: "reveal-ready" setzen → erst dann werden die Figuren voranimiert
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);

  // IntersectionObserver nur für diese Seite aktivieren
  useReveal(".reveal-scope figure");

  // =============================
  // DYNAMISCHE SPALTENBREITEN (Grid)
  // =============================
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6") // Startwert
  );

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h; // aspect ratio

    // Großzügigere Heuristik (weniger zu kleine Kacheln):
    //  >2.1 → 12  | >1.6 → 10 | >1.33 → 8
    //  0.9–1.33 → 8 (Quadrate & leichte Portraits größer als früher)
    //  0.75–0.9 → 6 | <0.75 → 4 (selten)
    let cls =
      r > 2.1 ? "span-12" :
      r > 1.6 ? "span-10" :
      r > 1.33 ? "span-8"  :
      r >= 0.9 ? "span-8"  :
      r >= 0.75 ? "span-6" :
      "span-4";

    // Optional: „Notbremse“, wenn du niemals span-4 willst:
    // if (cls === "span-4") cls = "span-6";

    // Optionales Tuning via Flag (falls du wieder feiner justieren willst)
    if (!UI_FLAGS.RATIO_TWEAKS) {
      cls =
        r > 2.2 ? "span-12" :
        r > 1.6 ? "span-10" :
        r > 1.3 ? "span-8"  :
        r < 0.85 ? "span-4" : "span-6";
    }

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
  // OFFSETS (Whitespace; nur bei großen Kacheln anwenden)
  // =============================
  const OFFSETS_ENABLED = true; // auf false setzen → komplett aus

  function offsetClassFor(i, img, span) {
    if (!OFFSETS_ENABLED) return "";
    // Nur große Kacheln versetzen, sonst wirken kleine noch kleiner
    const isBig = span === "span-8" || span === "span-10" || span === "span-12";
    if (!isBig) return "";

    const lower = (img?.src || "").toLowerCase();
    if (lower.includes("-pano")) return ""; // Panos meist already heroisch

    // Beispiel: jede 3. große Kachel leicht versetzen
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

        {/* optionales Section-Label */}
        {UI_FLAGS.SECTION_LABEL && (
          <div className="section-label">Selected Works</div>
        )}

        {/* Hero-Bild (wenn Flag aktiv und vorhanden) */}
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