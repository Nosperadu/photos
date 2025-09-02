// =============================
// SeriesPage.jsx
// Magazin-Layout mit dynamischen Spalten
// - Portrait-Schutz: Hochkant bleibt span-6 (keine Offsets)
// - Wide-Boost: breite Motive werden konsequent span-10/12
// - Dateinamen-Hints: -wide / -pano / -hero erzwingen groß
// - Offsets nur bei großen Kacheln; NIE für span-10/12
// - Reveal nur auf dieser Seite (sichtbar bis "ready")
// - Optional: Hero, Intro, Next-Series
// =============================

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// ⬇️ Wenn du das EXIF-Script nutzt:
import { series } from "../series.generated.js";
// ⬇️ Ansonsten:
// import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { UI_FLAGS } from "../ui.flags.js";
import { useReveal } from "../hooks/useReveal.js";

export default function SeriesPage() {
  // Aktuelle Serie aus URL
  const { id } = useParams();
  const currentIndex = series.findIndex((s) => s.id === id);
  const current = currentIndex >= 0 ? series[currentIndex] : null;

  // Bilder stabilisieren
  const items = useMemo(() => current?.images ?? [], [current]);

  // ========= REVEAL =========
  // Bilder sind sichtbar; nachdem die Section gemountet ist,
  // setzt .reveal-ready die "Einblende"-Animation (per IntersectionObserver im Hook)
  const sectionRef = useRef(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);
  useReveal(".reveal-scope figure");

  // ========= DYNAMISCHE SPANNEN =========
  // spanClasses[i] -> "span-12" | "span-10" | "span-8" | "span-6"
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6")
  );

  // Viewport-Boost: auf breiten Screens noch eine Stufe größer
  function boostForViewport(cls) {
    if (typeof window === "undefined") return cls;
    const w = window.innerWidth || 0;
    if (w >= 1360) {
      if (cls === "span-8") return "span-10";
      if (cls === "span-10") return "span-12";
    } else if (w >= 1200) {
      if (cls === "span-8") return "span-10";
    }
    return cls;
  }

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h; // Seitenverhältnis (Breite/Höhe)
    const srcLower = (items[i]?.src || "").toLowerCase();

    // ✅ PORTRAIT-SCHUTZ:
    // Echte Hochkantbilder bleiben "span-6" und werden NICHT weiter geboostet.
    if (r < 0.9) {
      setSpanClasses((prev) => {
        const next = [...prev];
        next[i] = "span-6";
        return next;
      });
      return;
    }

    // ✅ DATEINAMEN-HINTS (erzwingen groß)
    // -wide / -pano / -hero -> immer span-12 (danach ggf. Viewport-Boost)
    if (srcLower.includes("-pano") || srcLower.includes("-hero") || srcLower.includes("-wide")) {
      setSpanClasses((prev) => {
        const next = [...prev];
        next[i] = boostForViewport("span-12");
        return next;
      });
      return;
    }

    // ✅ WIDE-BOOST (breite Motive sichtbar machen)
    // >1.90 → 12 | >1.50 → 10 | >1.25 → 8 | 0.90–1.25 → 8
    // (Quadrat/leicht quer nicht zu klein)
    let cls =
      r > 1.90 ? "span-12" :
      r > 1.50 ? "span-10" :
      r > 1.25 ? "span-8"  :
                 "span-8";

    // Auf großen Screens eine Stufe hoch
    cls = boostForViewport(cls);

    setSpanClasses((prev) => {
      const next = [...prev];
      next[i] = cls;
      return next;
    });
  }

  // ========= LIGHTBOX =========
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // ========= OFFSETS =========
  // Weißraum-Versatz im Grid für Magazin-Look
  // - nur bei großen Kacheln (span-8)
  // - NIE bei span-10/12 (die sollen "ankern")
  const OFFSETS_ENABLED = true; // auf false -> komplett aus

  function offsetClassFor(i, img, span) {
    if (!OFFSETS_ENABLED) return "";

    // Portraits (span-6) → nie versetzen
    if (span === "span-6") return "";

    // sehr große Kacheln → nie versetzen (dominant bleiben)
    if (span === "span-12" || span === "span-10") return "";

    const lower = (img?.src || "").toLowerCase();
    // Spezielle Weitformate ebenfalls nicht versetzen
    if (lower.includes("-pano") || lower.includes("-hero") || lower.includes("-wide")) return "";

    // Beispiel: jede 3. große Kachel leicht versetzen
    return (i % 3 === 2) ? "offset-2" : "";
  }

  // ========= HERO (optional per Flag) =========
  // Zeigt erstes Bild mit "-hero" im Namen als Full-Bleed oben
  const heroIdx = UI_FLAGS.HERO
    ? items.findIndex((it) => it.src.toLowerCase().includes("-hero"))
    : -1;
  const hero = heroIdx >= 0 ? items[heroIdx] : null;

  // ========= FALLBACK =========
  if (!current) {
    return (
      <main className="wrap" style={{ paddingTop: 24 }}>
        <p><Link to="/" className="backlink">← Back</Link></p>
        <h2 className="series-title">Series not found</h2>
      </main>
    );
  }

  // ========= NEXT SERIES =========
  // Dezente Navigation am Seitenende, hält User im Flow
  const nextIndex = (currentIndex + 1) % series.length;
  const next = series[nextIndex];

  // ========= RENDER =========
  return (
    <div>
      <Header />
      <main className="wrap">
        {/* Back-Link auf Englisch für Konsistenz */}
        <Link to="/" className="backlink">← Back</Link>

        {/* Serientitel */}
        <h2 className="series-title">{current.title}</h2>

        {/* Optionaler Intro-Lead (aus series.data/generated) */}
        {current.description && (
          <p className="series-intro">{current.description}</p>
        )}

        {/* Optionales Section-Label */}
        {UI_FLAGS.SECTION_LABEL && (
          <div className="section-label">Selected Works</div>
        )}

        {/* Hero oben (falls Flag aktiv & Bild vorhanden) */}
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

        {/* Galerie mit Reveal-Scope */}
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

        {/* Next-Series Link (dezent) */}
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

      {/* Lightbox mit Pfeilen & Swipe */}
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