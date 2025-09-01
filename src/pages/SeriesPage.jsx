// =============================
// SeriesPage.jsx
// - Magazin-Layout mit dynamischen Spaltenbreiten
// - Reveal-Effekt nur auf dieser Seite (sichtbar bis JS 'ready')
// - Optionales Section-Label
// - Optionale Hero-Abbildung (Full-bleed via Flag)
// - Intro-Zeile (wenn in series.data description vorhanden)
// - "Next series" Navigation am Ende
// - Offsets/Whitespace nur bei großen Kacheln
// =============================

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { UI_FLAGS } from "../ui.flags.js";
import { useReveal } from "../hooks/useReveal.js";

export default function SeriesPage() {
  // Aktuelle Serie per URL-Parameter
  const { id } = useParams();
  const currentIndex = series.findIndex((s) => s.id === id);
  const current = currentIndex >= 0 ? series[currentIndex] : null;

  // Bilder-Array stabilisieren (Memo)
  const items = useMemo(() => current?.images ?? [], [current]);

  // =============================
  // REVEAL (Einblend-Animation)
  // - Bilder sind initial SICHTBAR
  // - Sobald die Section montiert ist, setzen wir 'reveal-ready'
  //   -> dann animiert der IntersectionObserver jedes Figure einzeln
  // =============================
  const sectionRef = useRef(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    // 0ms Timeout = nach nächstem Repaint hinzufügen
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);

  // Nur hier in dieser Seite den Reveal-Hook aktivieren
  useReveal(".reveal-scope figure");

  // =============================
  // DYNAMISCHE GRID-SPANNEN
  // - spanClasses[i] ist z. B. "span-8", "span-10", ...
  // - handleMeasured liest naturalWidth/naturalHeight und entscheidet die Spalte
  // =============================
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6") // Startwert (wird bei onLoad gemappt)
  );

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h; // Aspect Ratio (Breite / Höhe)

    // Magazin-Logik, die du mochtest:
    //  - Breite dominant (werden groß gezeigt)
    //  - Portraits NIE mikrig (mindestens span-6)
    //
    // Schwellen:
    // >2.1 → span-12 (Panorama / sehr breit)
    // >1.6 → span-10 (Landscape groß)
    // >1.3 → span-8  (leicht breiter)
    // 0.9–1.3 → span-8 (Quadrat & moderate Portraits → nicht zu klein)
    // 0.75–0.9 → span-6
    // <0.75 → span-6 (kein span-4 mehr)
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
  // LIGHTBOX (Bild in groß, mit Pfeilen & Swipe)
  // =============================
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // =============================
  // OFFSETS / WHITESPACE (Magazin-Look)
  // - Offsets nur bei großen Kacheln anwenden (span-8/10/12)
  // - Sehr breite (span-10/12) NICHT versetzen, damit sie dominant bleiben
  // =============================
  const OFFSETS_ENABLED = true; // auf false setzen → alle Offsets aus

  function offsetClassFor(i, img, span) {
    if (!OFFSETS_ENABLED) return "";

    const lower = (img?.src || "").toLowerCase();

    // Spezielle Dateien nicht versetzen (optional)
    if (lower.includes("-pano") || lower.includes("-hero")) return "";

    // Nur große Kacheln versetzen
    const isBig = span === "span-8" || span === "span-10" || span === "span-12";
    if (!isBig) return "";

    // Sehr breite NICHT versetzen (sollen "ankern")
    if (span === "span-10" || span === "span-12") return "";

    // Beispiel: jede 3. große Kachel versetzen
    return (i % 3 === 2) ? "offset-2" : "";
  }

  // =============================
  // HERO (optional, per Flag in ui.flags.js)
  // - Nimmt das erste Bild mit "-hero" im Dateinamen
  // - Full-bleed oben (CSS definiert den Look)
  // =============================
  const heroIdx = UI_FLAGS.HERO
    ? items.findIndex((it) => it.src.toLowerCase().includes("-hero"))
    : -1;
  const hero = heroIdx >= 0 ? items[heroIdx] : null;

  // =============================
  // FALLBACK: Serie nicht gefunden
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
  // NEXT SERIES (Design-Idee #5)
  // - führt am Ende zur nächsten Serie weiter
  // - sorgt für Flow ohne zurück zur Startseite
  // =============================
  const nextIndex = (currentIndex + 1) % series.length;
  const next = series[nextIndex];

  // =============================
  // RENDER
  // =============================
  return (
    <div>
      <Header />
      <main className="wrap">
        {/* Back-Link: englisch halten für Konsistenz */}
        <Link to="/" className="backlink">← Back</Link>

        {/* Titel der Serie */}
        <h2 className="series-title">{current.title}</h2>

        {/* (2) Intro-Zeile: nur rendern, wenn in series.data description vorhanden */}
        {current.description && (
          <p className="series-intro">{current.description}</p>
        )}

        {/* Optionales Section-Label */}
        {UI_FLAGS.SECTION_LABEL && (
          <div className="section-label">Selected Works</div>
        )}

        {/* Optionales Hero oben (falls Flag aktiv und Bild vorhanden) */}
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

        {/* Galerie – Reveal nur in dieser Section (reveal-scope) */}
        <section className="grid reveal-scope" ref={sectionRef}>
          {items.map((img, i) => {
            if (i === heroIdx) return null; // Hero nicht doppelt zeigen
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

        {/* (5) Next Series Navigation */}
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

      {/* Lightbox: groß + Navigation */}
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