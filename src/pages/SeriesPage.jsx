// =============================
// SeriesPage.jsx – Wide-on-own-row
// Ziel: Querformat immer allein in einer Zeile, Portraits/Quadrate nebeneinander
// - r >= 1.35 => span-12 (ganze Zeile)
// - 0.9 <= r < 1.35 => span-8 (nebeneinander, aber präsent)
// - r < 0.9 => span-6 (Portrait-Schutz, nie mikrig)
// - Keine Offsets für span-12 (und Portraits), nur optional für span-8
// =============================

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// Falls du noch series.data.js nutzt: Pfad anpassen
import { series } from "../series.generated.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { UI_FLAGS } from "../ui.flags.js";
import { useReveal } from "../hooks/useReveal.js";

export default function SeriesPage() {
  const { id } = useParams();
  const currentIndex = series.findIndex((s) => s.id === id);
  const current = currentIndex >= 0 ? series[currentIndex] : null;
  const items = useMemo(() => current?.images ?? [], [current]);

  // =============================
  // REVEAL – sichtbar bis "ready"
  // =============================
  const sectionRef = useRef(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);
  useReveal(".reveal-scope figure");

  // =============================
  // SPANNEN – Querformat allein, Portraits/Quadrat nebeneinander
  // =============================
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6")
  );

  // Schwelle, ab der ein Bild als „breit“ gilt und allein stehen soll:
  // 1.35 ist spürbar quer, aber nicht zu aggressiv. Gern auf 1.30/1.40 anpassen.
  const WIDE_THRESHOLD = 1.35;

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h; // Seitenverhältnis

    let cls;
    if (r >= WIDE_THRESHOLD) {
      // Querformat → ganze Zeile
      cls = "span-12";
    } else if (r >= 0.9) {
      // Quadrat/leicht quer → präsent, aber kombinierbar
      cls = "span-8";
    } else {
      // Portrait → nie zu klein
      cls = "span-6";
    }

    setSpanClasses((prev) => {
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
  // OFFSETS – Weißraum nur für mittlere Kacheln (span-8)
  // =============================
  const OFFSETS_ENABLED = true; // auf false setzen, wenn du strikt ohne Versatz willst

  function offsetClassFor(i, img, span) {
    if (!OFFSETS_ENABLED) return "";

    // Querformat (span-12) nie versetzen – sie sollen „ankern“
    if (span === "span-12") return "";

    // Portraits (span-6) nicht versetzen, um saubere Reihen zu halten
    if (span === "span-6") return "";

    // Nur span-8 (Quadrat/leicht quer) bekommt leichtes Spiel
    // Beispielhaft: jede dritte span-8 mit kleinem Offset
    return (i % 3 === 2) ? "offset-2" : "";
  }

  // =============================
  // HERO (optional)
  // =============================
  const heroIdx = UI_FLAGS.HERO
    ? items.findIndex((it) => it.src.toLowerCase().includes("-hero"))
    : -1;
  const hero = heroIdx >= 0 ? items[heroIdx] : null;

  // =============================
  // FALLBACK
  // =============================
  if (!current) {
    return (
      <main className="wrap" style={{ paddingTop: 24 }}>
        <p><Link to="/" className="backlink">← Back</Link></p>
        <h2 className="series-title">Series not found</h2>
      </main>
    );
  }

  // =============================
  // NEXT SERIES
  // =============================
  const nextIndex = (currentIndex + 1) % series.length;
  const next = series[nextIndex];

  return (
    <div>
      <Header />
      <main className="wrap">
        <Link to="/" className="backlink">← Back</Link>
        <h2 className="series-title">{current.title}</h2>
        {current.description && <p className="series-intro">{current.description}</p>}
        {UI_FLAGS.SECTION_LABEL && <div className="section-label">Selected Works</div>}

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

        {next && (
          <div className="series-next">
            <span className="series-next__label">Next series</span>
            <Link className="series-next__link" to={`/series/${next.id}`}>
              {next.title} →
            </Link>
          </div>
        )}
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