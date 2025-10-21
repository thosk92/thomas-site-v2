"use client";
import { useEffect, useRef, useState } from "react";

/**
 * Worley Caustics — Global (v1.7)
 * - Base #FAFAFA (visivamente bianco ma consente highlights visibili)
 * - Solo highlights (blend 'lighter'), nessun scurimento
 * - DPR-aware, FPS cap; se prefers-reduced-motion => frame statico
 * - Position: fixed; copre tutto il sito
 */
export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReduced, setIsReduced] = useState(false);

  const hash = (x: number, y: number) => {
    const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
    return s - Math.floor(s);
  };

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setIsReduced(!!mql.matches);
    onChange();
    mql.addEventListener?.("change", onChange);
    return () => mql.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    const setup = () => {
      const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 1.5));
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(canvas);

    // Galaxy particles parameters (impactful but optimized)
    const FPS = 30;
    const PARALLAX = 0.14;
    const PARTICLE_COUNT_BASE = 900; // scales with area
    const HUES = [210, 265, 300]; // cool spectrum (blue-magenta)
    const mix = (a: number, b: number, t: number) => a + (b - a) * t;
    const rand = (min: number, max: number) => mix(min, max, Math.random());
    const pick = <T,>(arr: T[]) => arr[(Math.random() * arr.length) | 0];

    const fpsInterval = 1000 / Math.max(1, FPS);
    let last = performance.now();
    let running = !document.hidden;
    const onVisibility = () => { running = !document.hidden; };

    // parallax lieve con puntatore
    const cursor = { x: 0.5, y: 0.5 };
    const onPointer = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      cursor.x = (e.clientX - rect.left) / Math.max(1, rect.width);
      cursor.y = (e.clientY - rect.top) / Math.max(1, rect.height);
    };
    window.addEventListener("pointermove", onPointer);

    // Precompute particles in normalized space to be resize-agnostic
    type P = { nx: number; ny: number; z: number; ang: number; spd: number; size: number; hue: number };
    const particles: P[] = (() => {
      const w = Math.max(1, canvas.clientWidth);
      const h = Math.max(1, canvas.clientHeight);
      const area = (w * h) / (1280 * 720);
      const count = Math.floor(PARTICLE_COUNT_BASE * Math.max(0.7, Math.min(2.2, area)));
      const arr: P[] = new Array(count);
      for (let i = 0; i < count; i++) {
        const z = Math.pow(Math.random(), 2.0); // more near-camera points
        const hue = pick(HUES) + rand(-8, 8);
        const size = mix(0.7, 3.2, 1 - z);
        const spd = mix(0.04, 0.9, z);
        arr[i] = { nx: Math.random(), ny: Math.random(), z, ang: Math.random() * Math.PI * 2, spd, size, hue };
      }
      return arr;
    })();

    const draw = (t: number) => {
      const now = performance.now();
      if (now - last < fpsInterval) return;
      last = now;

      const w = canvas.clientWidth, h = canvas.clientHeight;

      // base #FAFAFA (visivamente bianco)
      const BASE = "#FAFAFA";
      const time = (t * 0.001);
      const px = (cursor.x - 0.5) * PARALLAX * w;
      const py = (cursor.y - 0.5) * PARALLAX * h;

      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = BASE;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";

      // soft global glow settings
      ctx.shadowBlur = 10;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // spiral/swirl motion with subtle noise
        const r = mix(40, Math.min(w, h) * 0.45, p.z);
        const ang = p.ang + time * p.spd * 1.8 + Math.sin((p.nx + p.ny) * 10.0 + time * 0.7) * 0.2;
        const cx = w * 0.5 + Math.cos(ang) * r;
        const cy = h * 0.5 + Math.sin(ang) * r;
        const x = cx + px * (0.4 + p.z * 0.6);
        const y = cy + py * (0.4 + p.z * 0.6);

        const alpha = mix(0.05, 0.55, 1 - p.z);
        ctx.fillStyle = `hsla(${p.hue}, 90%, ${mix(55, 80, 1 - p.z).toFixed(0)}%, ${alpha.toFixed(3)})`;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 65%, ${Math.min(0.6, alpha + 0.1).toFixed(3)})`;

        const s = p.size * (1 + Math.sin(time * (0.8 + p.spd)) * 0.2);
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = "source-over";
    };

    let rid = 0;
    const loop = (tt: number) => {
      if (running) { if (isReduced) draw(0); else draw(tt); }
      rid = requestAnimationFrame(loop);
    };
    rid = requestAnimationFrame(loop);

    document.addEventListener("visibilitychange", onVisibility);

    return () => { cancelAnimationFrame(rid); window.removeEventListener("pointermove", onPointer); document.removeEventListener("visibilitychange", onVisibility); ro.disconnect(); };
  }, [isReduced]);

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 h-[100svh] w-[100vw] pointer-events-none" aria-hidden />;
}
