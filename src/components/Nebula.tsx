"use client";
import { useEffect, useRef, useState } from "react";

// Minimal, performant nebula made of microparticles (2D canvas)
// - Reacts to mouse (parallax) and scroll (flow speed)
// - DPR clamp, pointer-events none, pauses on hidden tab
export default function Nebula() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const m = matchMedia("(prefers-reduced-motion: reduce)");
    const h = () => setReduced(m.matches);
    h();
    m.addEventListener?.("change", h);
    return () => m.removeEventListener?.("change", h);
  }, []);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d", { alpha: false })!;

    const state = {
      running: !document.hidden,
      dpr: 1,
      w: 1,
      h: 1,
      t0: performance.now(),
      last: 0,
      fpsInterval: 1000 / 60,
      scrollNorm: 0,
      cursorX: 0.5,
      cursorY: 0.5,
    };

    const onVisibility = () => (state.running = !document.hidden);
    document.addEventListener("visibilitychange", onVisibility);

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      state.cursorX = (e.clientX - r.left) / Math.max(1, r.width);
      state.cursorY = (e.clientY - r.top) / Math.max(1, r.height);
    };
    window.addEventListener("pointermove", onPointer);

    const onScroll = () => {
      const max = Math.max(1, document.body.scrollHeight - window.innerHeight);
      state.scrollNorm = Math.min(1, Math.max(0, window.scrollY / max));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

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

    type P = { x: number; y: number; z: number; hue: number; sat: number; light: number; size: number; baseA: number; vx: number; vy: number };
    const mix = (a: number, b: number, t: number) => a + (b - a) * t;
    const rnd = (a: number, b: number) => mix(a, b, Math.random());

    const makeParticles = (w: number, h: number): P[] => {
      const area = (w * h) / (1280 * 800);
      const density = 500 * Math.max(0.6, Math.min(1.2, area)) * (w < 768 ? 0.75 : 1);
      const count = Math.floor(density);
      const arr: P[] = new Array(count);
      for (let i = 0; i < count; i++) {
        const z = Math.pow(Math.random(), 2.2);
        // palette: dark (black/graphite), emerald, petrol
        const roll = Math.random();
        let hue = 0, sat = 0, light = 18;
        if (roll < 0.35) { // dark
          hue = 0; sat = 0; light = rnd(10, 22);
        } else if (roll < 0.7) { // emerald
          hue = rnd(150, 165); sat = rnd(55, 70); light = rnd(45, 62);
        } else { // petrol
          hue = rnd(180, 200); sat = rnd(45, 65); light = rnd(42, 58);
        }
        arr[i] = {
          x: Math.random() * w,
          y: Math.random() * h,
          z,
          hue, sat, light,
          size: mix(1.0, 3.2, 1 - z),
          baseA: mix(0.06, 0.20, 1 - z),
          vx: rnd(-0.25, 0.25) * (0.6 + z),
          vy: rnd(-0.25, 0.25) * (0.6 + z),
        };
      }
      return arr;
    };

    const particles = makeParticles(state.w, state.h);

    const draw = (t: number) => {
      const now = performance.now();
      if (now - state.last < state.fpsInterval) return;
      state.last = now;

      const w = state.w, h = state.h;
      // base white
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "#F7F7F7";
      ctx.fillRect(0, 0, w, h);

      // subtle vignette to increase perceived depth
      const vg = ctx.createRadialGradient(w * 0.5, h * 0.5, Math.min(w, h) * 0.5,
                                          w * 0.5, h * 0.5, Math.max(w, h) * 0.9);
      vg.addColorStop(0, "rgba(0,0,0,0)");
      vg.addColorStop(1, "rgba(0,0,0,0.06)");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      // flow speed reacts to scroll
      const speedBoost = mix(0.85, 1.7, state.scrollNorm);
      const px = (state.cursorX - 0.5) * w * 0.06;
      const py = (state.cursorY - 0.5) * h * 0.06;
      // lightweight global wind (frame-based), with slight per-depth variation
      const windPhase = t * 0.0007;
      const windGX = Math.sin(windPhase) * 0.05;
      const windGY = Math.cos(windPhase * 0.8) * 0.05;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        // gentle cursor influence (deflection/repulsion, not following)
        const dx = p.x - (state.cursorX * w);
        const dy = p.y - (state.cursorY * h);
        const dist = Math.sqrt(dx*dx + dy*dy) + 1e-3;
        const falloff = 1 / (1 + dist * 0.012); // cheaper falloff
        const influence = Math.min(0.04, 10 / dist) * falloff * (0.3 + (1 - p.z));
        p.vx += (dx / dist) * influence;
        p.vy += (dy / dist) * influence;

        // base drift with global wind and scroll boost
        const windX = windGX * (0.6 + p.z * 0.8);
        const windY = windGY * (0.6 + p.z * 0.8);
        p.x += (p.vx * speedBoost) + px * (0.15 + p.z * 0.25) + windX;
        p.y += (p.vy * speedBoost) + py * (0.15 + p.z * 0.25) + windY;

        // edge wrapping
        if (p.x < -10) p.x = w + 10; else if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10; else if (p.y > h + 10) p.y = -10;

        // slight damping
        p.vx *= 0.988; p.vy *= 0.988;

        const a = p.baseA * (1 + Math.sin(t * 0.001 * 0.6) * 0.18);
        const light = Math.min(92, Math.max(8, p.light + (1 - p.z) * 6));
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat.toFixed(0)}%, ${light.toFixed(0)}%, ${a.toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    let rid = 0;
    const loop = (tt: number) => {
      if (!reduced && state.running) draw(tt);
      rid = requestAnimationFrame(loop);
    };
    rid = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rid);
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      ro.disconnect();
    };
  }, [reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="fixed inset-0 -z-10 w-[100vw] h-[100svh] pointer-events-none"
    />
  );
}
