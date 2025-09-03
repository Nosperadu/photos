// Minimaler Editor-Store (Client-only)
import { useEffect, useMemo, useState } from "react";

const KEY = "editor-state-v1"; // localStorage-Schlüssel

export function useEditor(seriesId, initialImages, initialEditorials = [], initialIntro = "") {
  // Initial aus localStorage mergen
  const saved = useMemo(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return {};
      return JSON.parse(raw) || {};
    } catch { return {}; }
  }, []);

  const seriesSaved = saved[seriesId] || {};
  const [intro, setIntro] = useState(seriesSaved.intro ?? initialIntro ?? "");
  const [images, setImages] = useState(() =>
    (seriesSaved.images ?? initialImages)?.map((img, i) => ({ ...img, _idx: i })) || []
  );
  const [editorials, setEditorials] = useState(seriesSaved.editorials ?? initialEditorials);

  // Autosave
  useEffect(() => {
    const all = {
      ...(saved || {}),
      [seriesId]: { intro, images, editorials },
    };
    localStorage.setItem(KEY, JSON.stringify(all));
  }, [seriesId, intro, images, editorials]);

  function updateCaption(index, title) {
    setImages(prev => {
      const next = [...prev];
      next[index] = { ...next[index], title };
      return next;
    });
  }

  function addEditorial(afterIndex = 0) {
    setEditorials(prev => [
      ...prev,
      { at: afterIndex, span: 4, kicker: "", title: "New block", body: "..." },
    ]);
  }
  function updateEditorial(idx, patch) {
    setEditorials(prev => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }
  function removeEditorial(idx) {
    setEditorials(prev => prev.filter((_, i) => i !== idx));
  }

  function exportJSON() {
    const data = { id: seriesId, intro, images, editorials };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.download = `series-${seriesId}-editor.json`;
    a.href = url; a.click();
    URL.revokeObjectURL(url);
  }

  return {
    intro, setIntro,
    images, setImages, updateCaption,
    editorials, setEditorials, addEditorial, updateEditorial, removeEditorial,
    exportJSON,
  };
}