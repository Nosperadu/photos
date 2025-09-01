#!/usr/bin/env python3
import os

IMAGES_DIR = "images"
OUTPUT_FILE = "snippets.html"

def main():
    if not os.path.isdir(IMAGES_DIR):
        print(f"Ordner '{IMAGES_DIR}' nicht gefunden.")
        return

    figures = []
    for fn in sorted(os.listdir(IMAGES_DIR)):
        if fn.lower().endswith((".jpg", ".jpeg")):
            name = os.path.splitext(fn)[0]
            caption = name.replace("_", " ").title()
            block = f"""<figure>
  <img loading="lazy" src="/{IMAGES_DIR}/{fn}" alt="{caption}">
  <figcaption>{caption}</figcaption>
</figure>"""
            figures.append(block)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n\n".join(figures))

    print(f"[ok] {len(figures)} Bilder gefunden. Galerie gespeichert in {OUTPUT_FILE}.")

if __name__ == "__main__":
    main()