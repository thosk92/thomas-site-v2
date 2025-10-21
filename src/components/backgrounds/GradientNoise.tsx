"use client";
import React, { useEffect, useMemo, useRef } from "react";

export default function GradientNoise() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const motionOk = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: no-preference)").matches;
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let raf = 0;
    let running = true;

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.floor(w * DPR);
      canvas.height = Math.floor(h * DPR);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const onVis = () => {
      running = !document.hidden;
      if (running && motionOk) loop();
    };

    const drawFrame = (t: number) => {
      const w = canvas.width / DPR;
      const h = canvas.height / DPR;
      ctx.clearRect(0, 0, w, h);

      // Animated radial gradients with slow drift
      const g1 = ctx.createRadialGradient(
        w * (0.25 + 0.05 * Math.sin(t * 0.0006)),
        h * (0.25 + 0.04 * Math.cos(t * 0.0005)),
        0,
        w * 0.25,
        h * 0.25,
        Math.max(w, h) * 0.9
      );
      g1.addColorStop(0, "rgba(102, 115, 2, 0.22)"); // brandish accent
      g1.addColorStop(1, "rgba(0,0,0,0)");

      const g2 = ctx.createRadialGradient(
        w * (0.8 + 0.04 * Math.cos(t * 0.0007)),
        h * (0.2 + 0.05 * Math.sin(t * 0.0008)),
        0,
        w * 0.2,
        h * 0.2,
        Math.max(w, h) * 0.8
      );
      g2.addColorStop(0, "rgba(56, 189, 248, 0.18)");
      g2.addColorStop(1, "rgba(0,0,0,0)");

      const g3 = ctx.createRadialGradient(
        w * (0.5 + 0.03 * Math.sin(t * 0.0004)),
        h * (0.85 + 0.03 * Math.cos(t * 0.0006)),
        0,
        w * 0.25,
        h * 0.25,
        Math.max(w, h) * 0.9
      );
      g3.addColorStop(0, "rgba(236, 72, 153, 0.14)");
      g3.addColorStop(1, "rgba(0,0,0,0)");

      ctx.fillStyle = "#ffffff"; // base background (keeps current design bright)
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = g1; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = g2; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = g3; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      // Subtle grain
      const imgData = ctx.createImageData(64, 64);
      for (let i = 0; i < imgData.data.length; i += 4) {
        const v = 255 * (Math.random() * 0.06);
        imgData.data[i] = v;
        imgData.data[i + 1] = v;
        imgData.data[i + 2] = v;
        imgData.data[i + 3] = 18; // alpha
      }
      // tile the grain
      const patternCanvas = document.createElement("canvas");
      patternCanvas.width = 64; patternCanvas.height = 64;
      const pctx = patternCanvas.getContext("2d")!;
      pctx.putImageData(imgData, 0, 0);
      const pattern = ctx.createPattern(patternCanvas, "repeat");
      if (pattern) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, w, h);
        ctx.globalAlpha = 1;
      }
    };

    const start = performance.now();
    const loop = () => {
      const now = performance.now();
      drawFrame(now);
      if (running) raf = requestAnimationFrame(loop);
    };

    resize();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    if (motionOk) loop(); else drawFrame(start);

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
