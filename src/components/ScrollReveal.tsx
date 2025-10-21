"use client";
import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    const reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (reduce) {
      nodes.forEach((el) => el.classList.add("is-revealed"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            io.unobserve(entry.target);
          }
        }
      },
      { root: null, rootMargin: "0px 0px -10% 0px", threshold: 0.1 }
    );

    nodes.forEach((el) => io.observe(el));
    // Observe DOM mutations to handle route/content changes
    const mo = new MutationObserver(() => {
      const fresh = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)"));
      fresh.forEach((el) => io.observe(el));
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  return null;
}
