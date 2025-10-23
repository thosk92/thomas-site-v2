"use client";
import { useEffect, useRef } from "react";

type Palette = {
  background: string;
  threads: string[];
  glow: string;
};

type Props = {
  palette: Palette;
  motionEnabled?: boolean;
};

// Lightweight organic thread animation using Canvas 2D.
// - No external deps
// - Prefers-reduced-motion aware
// - Subtle, slow, human-feel movement
export default function LightThreadsBase({ palette, motionEnabled = true }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const wrap = containerRef.current;
    if (!canvas || !wrap) return;

    const _ctx = canvas.getContext("2d", { alpha: true });
    if (!_ctx) return;
    const ctx = _ctx as CanvasRenderingContext2D;

    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

    let w = 0, h = 0;
    const resize = () => {
      const { clientWidth, clientHeight } = wrap;
      w = clientWidth;
      h = clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const shouldAnimate = motionEnabled && !prefersReduce;

    // Thread system (responsive by initial viewport size)
    const initialWidth = wrap.clientWidth;
    const THREADS = initialWidth <= 768 ? 5 : 8; // fewer on small screens
    const POINTS = 6;  // control points per thread

    // Each thread has control points in normalized space [0..1]
    const threads = Array.from({ length: THREADS }, (_, i) => {
      const seed = i * 37 + 13;
      const points = Array.from({ length: POINTS }, (__ , j) => ({
        x: (j / (POINTS - 1)) + rand(seed + j) * 0.02,
        y: 0.2 + 0.6 * rand(seed * 3 + j),
        px: 0,
        py: 0,
        phase: rand(seed * 11 + j) * Math.PI * 2,
        speed: 0.1 + 0.06 * rand(seed * 17 + j),
        amp: 0.02 + 0.025 * rand(seed * 19 + j),
      }));
      return { points, seed, offset: rand(seed) * 1000 };
    });

    function rand(seed: number) {
      // simple pseudo-random (deterministic per seed)
      const s = Math.sin(seed) * 10000;
      return s - Math.floor(s);
    }

    let t = 0;
    let raf = 0;

    function step(dt: number) {
      // background clear
      ctx.clearRect(0, 0, w, h);

      // paint soft background wash to ensure consistency across themes
      ctx.fillStyle = palette.background;
      ctx.globalAlpha = 1;
      ctx.fillRect(0, 0, w, h);

      // composite lighter for glow lines, with subtle shadow blur
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < threads.length; i++) {
        const th = threads[i];
        const color = palette.threads[i % palette.threads.length];
        const baseWidth = Math.max(0.6, Math.min(1.6, 0.9 + 0.25 * Math.sin((i + 1) * 1.3)));

        // Update points
        for (let j = 0; j < th.points.length; j++) {
          const p = th.points[j];
          const freq = 0.4 + 0.25 * (j / (POINTS - 1));
          const phase = p.phase + (t * p.speed) + (i * 0.1);
          const wobble = Math.sin(phase * freq) * p.amp;
          const sway = Math.cos(phase * (freq * 0.6)) * p.amp * 0.6;
          p.px = (p.x + wobble) * w;
          p.py = (p.y + sway) * h;
        }

        // Draw smooth curve
        ctx.save();
        ctx.shadowColor = palette.glow;
        ctx.shadowBlur = Math.max(6, Math.min(22, Math.floor(Math.max(w, h) * 0.014)));
        ctx.strokeStyle = color;
        ctx.globalAlpha = 0.42; // line alpha (was 0.35)
        ctx.lineWidth = baseWidth;
        ctx.beginPath();

        // Catmull-Rom to Bezier approximation
        for (let j = 0; j < th.points.length - 1; j++) {
          const p0 = th.points[Math.max(0, j - 1)];
          const p1 = th.points[j];
          const p2 = th.points[j + 1];
          const p3 = th.points[Math.min(th.points.length - 1, j + 2)];

          if (j === 0) {
            ctx.moveTo(p1.px, p1.py);
          }

          const cp1x = p1.px + (p2.px - p0.px) / 6;
          const cp1y = p1.py + (p2.py - p0.py) / 6;
          const cp2x = p2.px - (p3.px - p1.px) / 6;
          const cp2y = p2.py - (p3.py - p1.py) / 6;
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.px, p2.py);
        }
        ctx.stroke();
        ctx.restore();
      }

      // reset composite
      ctx.globalCompositeOperation = "source-over";
    }

    let last = performance.now();
    const animate = () => {
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      t += dt;
      step(dt);
      raf = requestAnimationFrame(animate);
    };

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    if (shouldAnimate) {
      raf = requestAnimationFrame(animate);
    } else {
      // Render one calm frame when motion is reduced
      step(0);
    }

    return () => {
      window.removeEventListener("resize", onResize);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [palette, motionEnabled]);

  return (
    <div ref={containerRef} aria-hidden className="fixed inset-0 z-0 pointer-events-none">
      <canvas ref={ref} className="w-full h-full" />
    </div>
  );
}
