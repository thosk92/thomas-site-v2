"use client";
import React, { useEffect, useMemo, useRef } from "react";

type Props = {
  intensity?: number;
  layers?: number;
};

export default function DepthParallax({ intensity = 12, layers = 3 }: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const motionOk = useMemo(() => {
    if (typeof window === "undefined") return false;
    const mq = window.matchMedia("(prefers-reduced-motion: no-preference)");
    return mq.matches;
  }, []);

  useEffect(() => {
    if (!motionOk) return;
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    let running = true;
    let tx = 0, ty = 0;
    let vx = 0, vy = 0;

    const onMove = (e: MouseEvent) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = (e.clientX / w) * 2 - 1;
      const y = (e.clientY / h) * 2 - 1;
      tx = x;
      ty = y;
    };

    const onVis = () => {
      running = !document.hidden;
      if (running) loop();
    };

    const loop = () => {
      vx += (tx - vx) * 0.06;
      vy += (ty - vy) * 0.06;
      const children = root.children;
      for (let i = 0; i < children.length; i++) {
        const depth = (i + 1) / children.length;
        const dx = -vx * intensity * depth;
        const dy = -vy * intensity * depth;
        (children[i] as HTMLElement).style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
      }
      if (running) raf = requestAnimationFrame(loop);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    loop();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [motionOk, intensity]);

  const elems = useMemo(() => {
    const arr = [] as React.ReactElement[];
    for (let i = 0; i < layers; i++) {
      const o = 0.12 + i * (0.18 / Math.max(1, layers - 1));
      const g = i * 18;
      arr.push(
        <div
          key={i}
          style={{
            position: "absolute",
            inset: 0,
            background:
              i === 0
                ? `radial-gradient(1200px 800px at 20% 30%, rgba(0,0,0,${o}) 0%, transparent 60%), radial-gradient(900px 900px at 80% 70%, rgba(0,0,0,${o * 0.8}) 0%, transparent 55%)`
                : `radial-gradient(${900 + g}px ${700 + g}px at ${25 + i * 12}% ${30 + i * 10}%, rgba(0,0,0,${o * 0.9}) 0%, transparent 60%)`,
            willChange: "transform",
            pointerEvents: "none",
            mixBlendMode: "multiply",
          }}
        />
      );
    }
    return arr;
  }, [layers]);

  return (
    <div
      aria-hidden
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    >
      {elems}
    </div>
  );
}
