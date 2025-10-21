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
      const count = Math.floor((w * h) / 4500);
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
    const loop = () => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.fillRect(0, 0, w, h);

      t += 0.0025;
      const driftX = Math.sin(t) * 0.6;
      const driftY = Math.cos(t * 0.8) * 0.6;

      for (let i = 0; i < stars.length; i++) {
        const st = stars[i];
        const par = st.z; // parallax factor
        const x = (st.x + driftX * 50 * par + w) % w;
        const y = (st.y + driftY * 50 * par + h) % h;
        ctx.globalAlpha = 0.35 + 0.6 * par;
        ctx.fillStyle = "#000000";
        ctx.beginPath();
        ctx.arc(x, y, st.s * par, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (running) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (motionOk) loop(); else ctx.clearRect(0, 0, canvas.width, canvas.height);

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
