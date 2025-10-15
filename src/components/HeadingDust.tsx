"use client";
import { useEffect, useRef } from "react";

// Localized dust overlay that renders only within its container box
// - Lightweight 2D canvas
// - Reacts subtly to mouse (deflection) to give life
// - Pointer-events none; intended to sit above the H1
export default function HeadingDust() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: true })!;

    const state = {
      dpr: 1,
      w: 1,
      h: 1,
      last: 0,
      fpsInterval: 1000 / 60,
      cursorX: 0.5,
      cursorY: 0.5,
      running: true,
    };

    const setup = () => {
      state.dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 1.5));
      state.w = canvas.clientWidth;
      state.h = canvas.clientHeight;
      canvas.width = Math.max(1, Math.floor(state.w * state.dpr));
      canvas.height = Math.max(1, Math.floor(state.h * state.dpr));
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    };
    setup();
    const ro = new ResizeObserver(setup);
    ro.observe(canvas);

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      state.cursorX = (e.clientX - r.left) / Math.max(1, r.width);
      state.cursorY = (e.clientY - r.top) / Math.max(1, r.height);
    };
    window.addEventListener("pointermove", onPointer);

    document.addEventListener("visibilitychange", () => {
      state.running = !document.hidden;
    });

    type P = { x: number; y: number; vx: number; vy: number; a: number; size: number };
    const rnd = (a: number, b: number) => a + (b - a) * Math.random();
    const makeParticles = (n: number): P[] =>
      Array.from({ length: n }, () => ({
        x: Math.random() * state.w,
        y: Math.random() * state.h,
        vx: rnd(-0.2, 0.2),
        vy: rnd(-0.2, 0.2),
        a: rnd(0.04, 0.12),
        size: rnd(0.6, 1.6),
      }));

    const count = Math.floor(Math.max(24, (state.w * state.h) / (60 * 140)));
    const ps = makeParticles(count);

    const draw = (t: number) => {
      const now = performance.now();
      if (now - state.last < state.fpsInterval) return;
      state.last = now;

      const { w, h } = state;
      ctx.clearRect(0, 0, w, h);

      const px = (state.cursorX - 0.5) * 0.5; // subtle influence
      const py = (state.cursorY - 0.5) * 0.5;

      for (let i = 0; i < ps.length; i++) {
        const p = ps[i];
        // gentle deflection
        p.vx += px * 0.01;
        p.vy += py * 0.01;
        p.x += p.vx;
        p.y += p.vy;
        // wrap within box
        if (p.x < -2) p.x = w + 2; else if (p.x > w + 2) p.x = -2;
        if (p.y < -2) p.y = h + 2; else if (p.y > h + 2) p.y = -2;
        // slight damping
        p.vx *= 0.99; p.vy *= 0.99;

        ctx.fillStyle = `rgba(0,0,0,${p.a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let rid = 0;
    const loop = (tt: number) => { if (state.running) draw(tt); rid = requestAnimationFrame(loop); };
    rid = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(rid); window.removeEventListener("pointermove", onPointer); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      className="absolute inset-0 pointer-events-none select-none"
      style={{ mixBlendMode: "multiply" }}
      aria-hidden
    />
  );
}
