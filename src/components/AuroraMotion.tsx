"use client";
import { useEffect } from "react";

export default function AuroraMotion() {
  useEffect(() => {
    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const pointerFine = window.matchMedia?.("(pointer: fine)").matches;
    if (prefersReduce || !pointerFine) return;

    const root = document.documentElement;
    const el = document.querySelector<HTMLElement>(".aurora-bg");
    if (!el) return;

    let raf = 0;
    let targetX = 0, targetY = 0;
    let xA = 0, yA = 0, xB = 0, yB = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const nx = (e.clientX / vw) * 2 - 1; // -1..1
      const ny = (e.clientY / vh) * 2 - 1;
      // target in px: small parallax offsets
      targetX = nx * 18; // px
      targetY = ny * 12; // px
    };

    const tick = () => {
      // smooth
      xA += (targetX - xA) * 0.06;
      yA += (targetY - yA) * 0.06;
      // opposite/parallax for B
      xB += ((-targetX * 0.8) - xB) * 0.06;
      yB += ((-targetY * 0.6) - yB) * 0.06;
      el.style.setProperty("--aurora-x-a", `${xA}px`);
      el.style.setProperty("--aurora-y-a", `${yA}px`);
      el.style.setProperty("--aurora-x-b", `${xB}px`);
      el.style.setProperty("--aurora-y-b", `${yB}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);
  return null;
}
