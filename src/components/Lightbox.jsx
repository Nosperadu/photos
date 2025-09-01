import React, { useEffect, useRef, useState } from "react";

export default function Lightbox({ open, items, index, onClose, onIndex }) {
  const [i, setI] = useState(index ?? 0);
  const startX = useRef(null);
  const lastX = useRef(null);
  const moving = useRef(false);

  useEffect(() => { setI(index ?? 0); }, [index, open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => { onIndex?.(i); }, [i, onIndex]);

  if (!open || !items?.length) return null;

  const prev = () => setI((v) => (v - 1 + items.length) % items.length);
  const next = () => setI((v) => (v + 1) % items.length);

  const onPointerDown = (e) => {
    moving.current = true;
    const x = "touches" in e ? e.touches[0].clientX : e.clientX;
    startX.current = x;
    lastX.current = x;
  };
  const onPointerMove = (e) => {
    if (!moving.current) return;
    lastX.current = "touches" in e ? e.touches[0].clientX : e.clientX;
  };
  const onPointerUp = () => {
    if (!moving.current) return;
    const dx = (lastX.current ?? 0) - (startX.current ?? 0);
    moving.current = false;
    startX.current = null; lastX.current = null;
    const THRESHOLD = 50;
    if (dx > THRESHOLD) prev();
    else if (dx < -THRESHOLD) next();
  };

  const current = items[i];

  return (
    <div
      className="lb"
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
    >
      <button className="lb-close" aria-label="Schließen" onClick={onClose}>✕</button>
      <button className="lb-nav lb-prev" aria-label="Vorheriges" onClick={prev}>‹</button>
      
      <figure
        className="lb-figure"
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      >
        <img src={current.src} alt={current.title || "Bild"} />
        {current.title ? <figcaption>{current.title}</figcaption> : null}
      </figure>

      <button className="lb-nav lb-next" aria-label="Nächstes" onClick={next}>›</button>
    </div>
  );
}