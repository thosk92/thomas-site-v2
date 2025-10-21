"use client";
import React, { useEffect, useMemo, useRef } from "react";

export default function Starfield() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const motionOk = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let running = true;
    let raf = 0;

    const stars: { x: number; y: number; z: number; s: number }[] = [];
    const layers = 3;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      const count = Math.floor((w * h) / 3000);
      stars.length = 0;
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.3 + Math.random() * 0.7,
          s: 0.4 + Math.random() * 1.2,
        });
      }
    };

    const onVis = () => {
      running = !document.hidden;
      if (running) loop();
    };

    let t = 0;
    const render = (drift = { x: 0, y: 0 }) => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, w, h);
      let driftX = drift.x;
      let driftY = drift.y;
      if (motionOk) {
        t += 0.003;
        driftX = Math.sin(t) * 1.0;
        driftY = Math.cos(t * 0.8) * 1.0;
      }

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const par = st.z; // parallax factor
        const x = (st.x + driftX * 80 * par + w) % w;
        const y = (st.y + driftY * 80 * par + h) % h;
        ctx.globalAlpha = 0.65 + 0.35 * par;
        ctx.fillStyle = "#141416";
        ctx.beginPath();
        ctx.arc(x, y, st.s * par + 0.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const loop = () => {
      render();
      if (running) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (motionOk) loop(); else render({ x: 0.2, y: 0.15 });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [motionOk]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
