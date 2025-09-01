import { useEffect } from "react";
import { UI_FLAGS } from "../ui.flags.js";

export function useReveal(selector = "figure", options = {}) {
  useEffect(() => {
    if (!UI_FLAGS.REVEAL) return;
    const items = document.querySelectorAll(selector);
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add("reveal-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "8% 0px -4% 0px", ...options });
    items.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, [selector, options]);
}