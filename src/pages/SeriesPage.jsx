// =============================
// SeriesPage.jsx – Wide-on-own-row + Robust-Measure
// Ziel: Querformate stehen (sichtbar) allein in einer Zeile,
//       Portrait/Quadrat nebeneinander. Messung zusätzlich abgesichert.
// =============================

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
// ⬇️ Wenn du das EXIF/Generator-Setup nutzt:
import { series } from "../series.generated.js";
// ⬇️ Andernfalls:
// import { series } from "../series.data.js";
import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";
import { UI_FLAGS } from "../ui.flags.js";
import { useReveal } from "../hooks/useReveal.js";

export default function SeriesPage() {
  // Aktuelle Serie
  const { id } = useParams();
  const currentIndex = series.findIndex((s) => s.id === id);
  const current = currentIndex >= 0 ? series[currentIndex] : null;

  // Bilder stabilisieren
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
  // GRID-SPANNEN
  // - Querformat → eigene Zeile
  // - Quadrat/leicht quer → span-8
  // - Portrait → span-6 (nie mikrig)
  // =============================
  const [spanClasses, setSpanClasses] = useState(() =>
    Array(items.length).fill("span-6")
  );

  // Schwelle für "breit genug für eigene Zeile"
  const WIDE_THRESHOLD = 1.35; // 1.30 aggressiver, 1.40 konservativer

  function handleMeasured(i, w, h) {
    if (!w || !h) return;
    const r = w / h; // Seitenverhältnis

    let cls;
    if (r >= WIDE_THRESHOLD) {
      // ✅ Querformat → ganze Zeile
      cls = "span-12";
    } else if (r >= 0.9) {
      // ✅ Quadrat/leicht quer → präsent nebeneinander
      cls = "span-8";
    } else {
      // ✅ Portrait-Schutz → nie zu klein
      cls = "span-6";
    }

    setSpanClasses((prev) => {
      const next = [...prev];
      next[i] = cls;
      return next;
    });
  }

  // =============================
  // ROBUSTE MESSUNG
  // - onLoad kann bei Cache/StrictMode ausfallen → wir scannen nach Mount
  // =============================
  const imgRefs = useRef([]);
  imgRefs.current = [];
  function setImgRef(el) { if (el) imgRefs.current.push(el); }

  function measureOne(i, el) {
    if (!el) return;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    if (w && h) handleMeasured(i, w, h);
  }

  function measureAll() {
    imgRefs.current.forEach((el, i) => {
      if (el?.complete && el.naturalWidth) measureOne(i, el);
    });
  }

  useEffect(() => {
    // direkt nach Mount + kleine Delays (Decode/Cache)
    const t1 = setTimeout(measureAll, 0);
    const t2 = setTimeout(measureAll, 300);
    const t3 = setTimeout(measureAll, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [items.length]);

  // =============================
  // LIGHTBOX
  // =============================
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // =============================
  // OFFSETS – Weißraum nur bei mittleren Kacheln (span-8)
  // - span-12 und span-6 werden NIE versetzt (wirken sonst kleiner/unklar)
  // =============================
  const OFFSETS_ENABLED = true; // auf false setzen → komplett ohne Versatz

  function offsetClassFor(i, img, span) {
    if (!OFFSETS_ENABLED) return "";

    if (span === "span-12" || span === "span-6") return ""; // NIE versetzen

    // Nur span-8 bekommt minimalen Versatz (magazinartig)
    return (i % 3 === 2) ? "offset-2" : "";
  }

  // =============================
  // HERO (optional per Flag)
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
  // NEXT SERIES (dezent am Ende)
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
            if (i === heroIdx) return null; // Hero nicht doppelt
            const span = spanClasses[i];
            const offset = offsetClassFor(i, img, span);
            const classes = `${span} ${offset}`.trim();

            return (
              <figure key={i} className={classes}>
                <img
                  ref={setImgRef}
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  onLoad={(e) => measureOne(i, e.currentTarget)}
                  style={{ cursor: "zoom-in" }}
                  onClick={() => { setIdx(i); setOpen(true); }}
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