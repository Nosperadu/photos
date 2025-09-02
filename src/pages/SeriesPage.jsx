// =============================
// SeriesPage.jsx – ROBUST FINAL
// Priorität für "breit = volle Zeile":
// 1) Dateiname-Hint (-wide/-pano/-hero)
// 2) EXIF/Generator-Dimensionen (exif.width/height)
// 3) Fallback: naturalWidth/Height nach dem Laden
// Zusätzlich: Für "breit" inline gridColumn: '1 / -1' erzwingen
// Portrait bleibt wie gehabt (mind. span-6).
// =============================

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link } from "react-router-dom";

// ⬇️ Wenn du den EXIF/Generator nutzt:
import { series } from "../series.generated.js";
// ⬇️ sonst: import { series } from "../series.data.js";

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
  // Flags
  // =============================
  const WIDE_THRESHOLD = 1.35;     // ab diesem Ratio = "breit" → volle Zeile
  const INLINE_GRID_FALLBACK = true; // section bekommt zur Not inline display:grid
  const DEBUG = false;                // Ratio/Entscheidung zeigen

  // =============================
  // Reveal (Bilder sind sichtbar; nach Mount animiert es rein)
  // =============================
  const sectionRef = useRef(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);
  useReveal(".reveal-scope figure");

  // =============================
  // Spanning-Status + Inline-Fallbacks
  // =============================
  const [spans, setSpans] = useState(() => Array(items.length).fill("span-6"));
  const [inlineStyles, setInlineStyles] = useState(() => Array(items.length).fill(null));
  const [ratios, setRatios] = useState(() => Array(items.length).fill(null)); // nur für Debug

  function decideFromRatio(i, r) {
    let span, style = null;

    if (r >= WIDE_THRESHOLD) {
      // ✅ breit → volle Zeile + inline erzwingen
      span = "span-12";
      style = { gridColumn: "1 / -1" };
    } else if (r >= 0.9) {
      // ✅ quadrat/leicht quer → präsent, kombinierbar
      span = "span-8";
    } else {
      // ✅ portrait → nie mikrig
      span = "span-6";
    }

    setSpans(prev => { const n = [...prev]; n[i] = span; return n; });
    setInlineStyles(prev => { const n = [...prev]; n[i] = style; return n; });
    setRatios(prev => { const n = [...prev]; n[i] = r; return n; });
  }

  // 1) Dateinamen-Hint (sofort & hart)
  function applyFilenameHint(i, src) {
    const lower = (src || "").toLowerCase();
    if (lower.includes("-wide") || lower.includes("-pano") || lower.includes("-hero")) {
      setSpans(prev => { const n = [...prev]; n[i] = "span-12"; return n; });
      setInlineStyles(prev => { const n = [...prev]; n[i] = { gridColumn: "1 / -1" }; return n; });
      setRatios(prev => { const n = [...prev]; n[i] = 9.99; return n; }); // Debug-Marker
      return true;
    }
    return false;
  }

  // 2) EXIF/Generator-Dimensionen (exif.width/height)
  function applyExifDims(i, exif) {
    const w = exif?.width;
    const h = exif?.height;
    if (w && h) {
      const r = w / h;
      decideFromRatio(i, r);
      return true;
    }
    return false;
  }

  // 3) Fallback: naturalWidth/Height, falls oben nichts griff
  function applyNaturalDims(i, el) {
    if (!el) return false;
    const w = el.naturalWidth;
    const h = el.naturalHeight;
    if (w && h) {
      decideFromRatio(i, w / h);
      return true;
    }
    return false;
  }

  // Refs zum Fallback-Messen (falls onLoad nicht feuert)
  const imgRefs = useRef([]);
  imgRefs.current = [];
  const setImgRef = (el) => { if (el) imgRefs.current.push(el); };

  // Initiale Entscheidung: pro Bild sofort 1) Hint → 2) EXIF
  useEffect(() => {
    items.forEach((img, i) => {
      if (applyFilenameHint(i, img.src)) return;
      if (applyExifDims(i, img.exif)) return;
      // sonst wartet onLoad / Safety-Scan (unten)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length]);

  // Safety-Scan: nach Mount per naturalWidth nachmessen (0/300/1000ms)
  useEffect(() => {
    function measureAll() {
      imgRefs.current.forEach((el, i) => {
        // nur, wenn noch keine Entscheidung getroffen wurde (kein inlineStyle & Ratio null)
        if (!inlineStyles[i] && ratios[i] == null) {
          if (el?.complete) applyNaturalDims(i, el);
        }
      });
    }
    const t1 = setTimeout(measureAll, 0);
    const t2 = setTimeout(measureAll, 300);
    const t3 = setTimeout(measureAll, 1000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [inlineStyles, ratios]);

  // =============================
  // Lightbox
  // =============================
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);

  // =============================
  // Hero optional (Flag)
  // =============================
  const heroIdx = UI_FLAGS.HERO
    ? items.findIndex((it) => it.src.toLowerCase().includes("-hero"))
    : -1;
  const hero = heroIdx >= 0 ? items[heroIdx] : null;

  if (!current) {
    return (
      <main className="wrap" style={{ paddingTop: 24 }}>
        <p><Link to="/" className="backlink">← Back</Link></p>
        <h2 className="series-title">Series not found</h2>
      </main>
    );
  }

  const nextIndex = (currentIndex + 1) % series.length;
  const next = series[nextIndex];

  const sectionStyle = INLINE_GRID_FALLBACK
    ? { display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "var(--gap)" }
    : undefined;

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

        <section className="grid reveal-scope" ref={sectionRef} style={sectionStyle}>
          {items.map((img, i) => {
            if (i === heroIdx) return null;

            const cls = spans[i];                  // Klassen-Info (für dein CSS)
            const style = inlineStyles[i] || null; // inline gridColumn-Fallback, wenn breit

            return (
              <figure key={i} className={cls} style={style ?? undefined}>
                {/* Debug-Badge */}
                {DEBUG && ratios[i] && (
                  <span style={{
                    position: "absolute", top: 6, left: 8, zIndex: 2,
                    font: "11px/1.1 system-ui", color: "#fff",
                    background: "rgba(0,0,0,.35)", padding: "2px 6px", borderRadius: 6
                  }}>
                    r={ratios[i]?.toFixed(2)} → {cls}{style?.gridColumn ? " (inline 1/-1)" : ""}
                  </span>
                )}

                <img
                  ref={setImgRef}
                  src={img.src}
                  alt={img.title}
                  loading="lazy"
                  onLoad={(e) => {
                    // Nur wenn vorher weder Hint noch EXIF entschieden haben
                    if (!inlineStyles[i] && ratios[i] == null) {
                      applyNaturalDims(i, e.currentTarget);
                    }
                  }}
                  style={{ cursor: "zoom-in", width: "100%", height: "auto", display: "block" }}
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