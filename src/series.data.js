// src/series.data.js
// Baut automatisch Serien-Daten aus dem Ordner: src/assets/series/**

/**
 * Macht aus "IMG_7237.jpg" -> "IMG 7237"
 * und aus "concrete-calm.jpg" -> "Concrete Calm"
 */
function titleFromFilename(path) {
  const name = path.split('/').pop().replace(/\.[a-z0-9]+$/i, '');
  const cleaned = name.replace(/[_-]+/g, ' ');
  return cleaned.replace(/\b\w/g, s => s.toUpperCase());
}

// Alle Cover-Dateien (als URL)
const coverGlobs = import.meta.glob('/src/assets/series/**/cover.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: { w: 2000, format: 'jpeg' }, // Vite/Image Plugins ignorieren das ohne Plugin – schadet nicht
  import: 'default',
});

// Alle Bilder JE Serie (ohne cover.*)
const imageGlobs = import.meta.glob('/src/assets/series/**/**.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  import: 'default',
});

// Series-Objekte aufbauen
const map = new Map(); // id -> { id, title, cover, images: [] }

Object.entries(coverGlobs).forEach(([path, url]) => {
  // path: '/src/assets/series/street/cover.jpg'
  const parts = path.split('/');
  const id = parts[parts.indexOf('series') + 1]; // z.B. 'street'
  map.set(id, {
    id,
    title: id.replace(/[-_]+/g, ' ').replace(/\b\w/g, s => s.toUpperCase()),
    cover: url,
    images: [],
  });
});

Object.entries(imageGlobs).forEach(([path, url]) => {
  // Skip die Cover selbst
  if (/\/cover\.(jpe?g|png|webp|avif)$/i.test(path)) return;

  const parts = path.split('/');
  const id = parts[parts.indexOf('series') + 1];

  if (!map.has(id)) {
    // Falls Ordner ohne cover.* existiert, trotzdem anlegen
    map.set(id, {
      id,
      title: id.replace(/[-_]+/g, ' ').replace(/\b\w/g, s => s.toUpperCase()),
      cover: undefined,
      images: [],
    });
  }
  map.get(id).images.push({
    src: url,
    title: titleFromFilename(path),
  });
});

// Optional: Bilder sortieren (alphabetisch)
for (const s of map.values()) {
  s.images.sort((a, b) => a.src.localeCompare(b.src));
}

// Final-Array (alphabetisch nach Titel)
export const series = Array.from(map.values()).sort((a, b) => a.title.localeCompare(b.title));