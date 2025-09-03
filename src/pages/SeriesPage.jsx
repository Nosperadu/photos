// =============================
// SeriesPage.jsx — Magazine + Editor + Robust Wide Logic
// - "Breit" = volle Zeile (span-12) via Hints/EXIF/Fallback-Messung
// - Portrait-Schutz (hochkant mind. span-6)
// - Editorial-Blocks (Textkarten) zwischen Bildern (Editor-gesteuert)
// - Lightbox wie gehabt
// - Editor: ?edit=1 → Sidebar (Captions/Intro/Editorials), Autosave, Export
// =============================

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";

// ⬇️ EXIF/Generator-Variante:
import { series } from "../series.generated.js";
// ⬇️ Falls du keinen Generator nutzt, nimm stattdessen:
// import { series } from "../series.data.js";

import Header from "../components/Header.jsx";
import Footer from "../components/Footer.jsx";
import Lightbox from "../components/Lightbox.jsx";

// Flags/Reveal (wie zuvor genutzt)
import { UI_FLAGS } from "../ui.flags.js";
import { useReveal } from "../hooks/useReveal.js";

// Live-Editor (aus meinen Snippets)
import EditorPanel from "../editor/EditorPanel.jsx";
import { useEditor } from "../editor/useEditor.js";

// ———————————————————————————————————————————
// Tuning-Konstanten
// ———————————————————————————————————————————
const WIDE_THRESHOLD = 1.35;      // ab diesem Ratio = "breit" -> volle Zeile
const INLINE_GRID_FALLBACK = true; // section bekommt zur Not inline display:grid
const DEBUG = false;                // Ratio/Entscheidung-Overlay

export default function SeriesPage() {
  // Aktuelle Serie bestimmen
  const { id } = useParams();
  const currentIndex = series.findIndex((s) => s.id === id);
  const current = currentIndex >= 0 ? series[currentIndex] : null;

  // Ursprungsbilder stabilisieren
  const items = useMemo(() => current?.images ?? [], [current]);

  // Editor-Modus per Query (?edit=1)
  const [search] = useSearchParams();
  const editMode = search.get("edit") === "1";

  // Editor-State (Intro, Bilder, Editorials) – Client-only
  const initialIntro = current?.description || "";
  const initialEditorials = []; // Start leer; Editor pflegt das
  const {
    intro, setIntro,
    images, updateCaption,
    editorials, addEditorial, updateEditorial, removeEditorial,
    exportJSON
  } = useEditor(id, items, initialEditorials, initialIntro);

  // Reveal (sichtbar bis ready → danach Einblendung via IntersectionObserver im Hook)
  const sectionRef = useRef(null);
  useEffect(() => {
    if (!sectionRef.current) return;
    const t = setTimeout(() => sectionRef.current.classList.add("reveal-ready"), 0);
    return () => clearTimeout(t);
  }, []);
  useReveal(".reveal-scope figure, .reveal-scope .editorial");

  // ———————————————————————————————————————————
  // Spanning/Inline-Styles + robuste Entscheidung
  // ———————————————————————————————————————————
  const [spans, setSpans] = useState(() => Array(images.length).fill("span-6"));
  const [inlineStyles, setInlineStyles] = useState(() => Array(images.length).fill(null));
  const [ratios, setRatios] = useState(() => Array(images.length).fill(null)); // nur für DEBUG

  // Hard-Entscheidung aus Ratio
  function decideFromRatio(i, r) {
    let span, style = null;

    if (r >= WIDE_THRESHOLD) {
      // ✅ breit → volle Zeile + inline erzwingen (unabhängig von CSS)
      span = "span-12";
      style = { gridColumn: "1 / -1" };
    } else if (r >= 0.9) {
      // ✅ quadrat/leicht quer → präsent, kombinierbar
      span = "span-8";
    } else {
      // ✅ portrait → nie mikrig
      span = "span-6";
    }

    setSpans((prev) => { const n = [...prev]; n[i] = span; return n; });
    setInlineStyles((prev) => { const n = [...prev]; n[i] = style; return n; });
    setRatios((prev) => { const n = [...prev]; n[i] = r; return n; });
  }

  // 1) Dateiname-Hints direkt/hart
  function applyFilenameHint(i, src) {
    const lower = (src || "").toLowerCase();
    if (lower.includes("-wide") || lower.includes("-pano") || lower.includes("-hero")) {
      setSpans((prev) => { const n = [...prev]; n[i] = "span-12"; return n; });
      setInlineStyles((prev) => { const n = [...prev]; n[i] = { gridColumn: "1 / -1" }; return n; });
      setRatios((prev) => { const n = [...prev]; n[i] = 9.99; return n; }); // Debug-Marker
      return true;
    }
    return false;
  }

  // 2) EXIF/Generator-Dimensionen (falls vorhanden)
  function applyExifDims(i, exif) {
    const w = exif?.width;
    const h = exif?.height;
    if (w && h) {
      decideFromRatio(i, w / h);
      return true;
    }
    return false;
  }

  // 3) Fallback: naturalWidth/Height nach dem Laden
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

  // Refs für Fallback-Messung
  const imgRefs = useRef([]);
  imgRefs.current = [];
  const setImgRef = (el) => { if (el) imgRefs.current.push(el); };

  // Initial: pro Bild direkt Hints/EXIF anwenden
  useEffect(() => {
    images.forEach((img, i) => {
      if (applyFilenameHint(i, img.src)) return;
      if (applyExifDims(i, img.exif)) return;
      // sonst wartet onLoad/Safety-Scan
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images.length]);

  // Safety-Scan: nach Mount per naturalWidth nachmessen (0/300/1000ms)
  useEffect(() => {
    function measureAll() {
      imgRefs.current.forEach((el, i) => {
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

  // Hero (optional: erstes Bild mit -hero)
  const heroIdx = UI_FLAGS.HERO
    ? images.findIndex((it) => it.src.toLowerCase().includes("-hero"))
    : -1;
  const hero = heroIdx >= 0 ? images[heroIdx] : null;

  if (!current) {
    return (
      <main className="wrap" style={{ paddingTop: 24 }}>
        <p><Link to="/" className="backlink">← Back</Link></p>
        <h2 className="series-title">Series not found</h2>
      </main>
    );
  }

  // Nächste Serie (dezent)
  const nextIndex = (currentIndex + 1) % series.length;
  const next = series[nextIndex];

  // Editorials + Bilder „mischen“: nach Bild-Index ed.at kommt der Textblock
  const mixed = useMemo(() => {
    if (!editorials.length) return images.map((img, index) => ({ type: "img", img, index }));
    const out = [];
    images.forEach((img, index) => {
      out.push({ type: "img", img, index });
      editorials.forEach((ed, k) => {
        if (ed.at === index) out.push({ type: "ed", ed: { ...ed, key: `ed-${k}-${index}` } });
      });
    });
    return out;
  }, [images, editorials]);

  // Inline-Grid-Fallback (falls dein CSS nicht korrekt greift)
  const sectionStyle = INLINE_GRID_FALLBACK
    ? { display: "grid", gridTemplateColumns: "repeat(12, minmax(0, 1fr))", gap: "var(--gap)" }
    : undefined;

  return (
    <div>
      <Header />
      <main className="wrap">
        {/* Back-Link (englisch, clean) */}
        <Link to="/" className="backlink">← Back</Link>

        {/* Titel + Intro (im Edit-Mode live aus Editor-State) */}
        <h2 className="series-title">{current.title}</h2>
        {(editMode ? intro : current.description) && (
          <p className="series-intro">{editMode ? intro : current.description}</p>
        )}
        {UI_FLAGS.SECTION_LABEL && <div className="section-label">Selected Works</div>}

        {/* Hero (falls gefunden & Flag an) */}
        {hero && (
          <figure
            className="hero"
            onClick={() => { setIdx(heroIdx); setOpen(true); }}
            style={{ cursor: "zoom-in" }}
          >
            <img src={hero.src} alt={hero.title} />
            <figcaption>{editMode ? (images[heroIdx]?.title || "") : hero.title}</figcaption>
          </figure>
        )}

        {/* Grid */}
        <section className="grid reveal-scope" ref={sectionRef} style={sectionStyle}>
          {mixed.map((node, i) => {
            if (node.type === "img") {
              const { img, index } = node;
              if (index === heroIdx) return null; // Hero nicht doppeln

              const cls = spans[index];
              const style = inlineStyles[index] || undefined;

              return (
                <figure key={`img-${index}-${img.src}`} className={cls} style={style}>
                  {/* Debug-Badge */}
                  {DEBUG && ratios[index] && (
                    <span style={{
                      position: "absolute", top: 6, left: 8, zIndex: 2,
                      font: "11px/1.1 system-ui", color: "#fff",
                      background: "rgba(0,0,0,.35)", padding: "2px 6px", borderRadius: 6
                    }}>
                      r={ratios[index]?.toFixed(2)} → {cls}{style?.gridColumn ? " (inline 1/-1)" : ""}
                    </span>
                  )}

                  <img
                    ref={setImgRef}
                    src={img.src}
                    alt={img.title}
                    loading="lazy"
                    onLoad={(e) => {
                      if (!inlineStyles[index] && ratios[index] == null) {
                        applyNaturalDims(index, e.currentTarget);
                      }
                    }}
                    style={{ cursor: "zoom-in", width: "100%", height: "auto", display: "block" }}
                    onClick={() => { setIdx(index); setOpen(true); }}
                  />
                  <figcaption>{editMode ? (images[index].title || "") : img.title}</figcaption>
                </figure>
              );
            }

            // Editorial-Block
            if (node.type === "ed") {
              const { ed } = node;
              const spanClass =
                ed.span === 12 ? "span-12" :
                ed.span === 10 ? "span-10" :
                ed.span === 8  ? "span-8"  :
                ed.span === 4  ? "span-4"  :
                "span-6";

              return (
                <article key={ed.key} className={`editorial ${spanClass}`}>
                  {ed.kicker && <div className="ed-kicker">{ed.kicker}</div>}
                  {ed.title && <h3 className="ed-title">{ed.title}</h3>}
                  {ed.body && <p className="ed-body">{ed.body}</p>}
                </article>
              );
            }

            return null;
          })}
        </section>

        {/* Nächste Serie – dezent */}
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

      {/* Lightbox mit Pfeilen & Swipe bleibt */}
      <Lightbox
        open={open}
        items={images}
        index={idx}
        onClose={() => setOpen(false)}
        onIndex={setIdx}
      />

      {/* Editor-Sidebar (nur bei ?edit=1) */}
      {editMode && (
        <EditorPanel
          intro={intro} setIntro={setIntro}
          images={images} updateCaption={updateCaption}
          editorials={editorials}
          addEditorial={addEditorial} updateEditorial={updateEditorial} removeEditorial={removeEditorial}
          onExport={exportJSON}
          onClose={() => {
            // Editor „ausknipsen“ (Query entfernen) + reload
            const base = window.location.pathname + window.location.hash.split("?")[0];
            window.history.replaceState({}, "", base);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}