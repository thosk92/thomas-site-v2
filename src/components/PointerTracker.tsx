"use client";
import { useEffect, useRef } from "react";

// Lightweight pointer tracker: soft ring that slightly trails the cursor
// - Hidden on touch devices by default
export default function PointerTracker() {
  // wrapper locked to cursor position (no scale)
  const ref = useRef<HTMLDivElement>(null);
  // inner ring that scales and changes color
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current!;
    const ring = ringRef.current!;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x, ty = y;
    let scale = 1;
    let targetScale = 1;
    let borderColor = "rgba(0,0,0,0.35)";
    let targetBorderColor = borderColor;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return; // ignore touch
      tx = e.clientX;
      ty = e.clientY;
    };
    window.addEventListener("pointermove", onMove);

    const isInteractive = (el: Element | null) => !!el && (
      el instanceof HTMLAnchorElement ||
      el instanceof HTMLButtonElement ||
      (el as HTMLElement).closest?.("a, button, [role=button], [data-hoverable]") !== null
    );

    const getEffectiveBg = (node: HTMLElement | null): string => {
      let el: HTMLElement | null = node;
      while (el) {
        const cs = getComputedStyle(el);
        const bg = cs.backgroundColor;
        if (bg && bg !== "rgba(0, 0, 0, 0)" && bg !== "transparent") return bg;
        el = el.parentElement;
      }
      return "rgb(255,255,255)";
    };

    const luminance = (rgb: string) => {
      const m = rgb.match(/rgba?\(([^)]+)\)/);
      if (!m) return 1;
      const [r,g,b] = m[1].split(",").slice(0,3).map(v=>parseFloat(v));
      const srgb = [r,g,b].map(v=>{
        v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055, 2.4);
      }) as [number,number,number];
      return 0.2126*srgb[0] + 0.7152*srgb[1] + 0.0722*srgb[2];
    };

    const getTextColor = (node: HTMLElement | null): string => {
      let el: HTMLElement | null = node;
      while (el) {
        const cs = getComputedStyle(el);
        const c = cs.color;
        if (c) return c;
        el = el.parentElement;
      }
      return "rgb(0,0,0)";
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const hoverEl = t?.closest?.("a, button, [role=button], [data-hoverable]") as HTMLElement | null;
      if (hoverEl) {
        targetScale = 1.8; // grow a bit more
        const bg = getEffectiveBg(hoverEl);
        const lumBg = luminance(bg);
        // if background is light but text is dark (transparent bg cases), still invert to white
        const textColor = getTextColor(hoverEl);
        const lumText = luminance(textColor);
        const useWhite = lumBg < 0.45 || (lumBg >= 0.45 && lumText < 0.45);
        targetBorderColor = useWhite ? "rgba(255,255,255,0.95)" : "rgba(0,0,0,0.35)";
      } else {
        targetScale = 1;
        targetBorderColor = "rgba(0,0,0,0.35)";
      }
    };
    window.addEventListener("mouseover", onOver);

    let rid = 0;
    const loop = () => {
      // interpolate for subtle trail
      x += (tx - x) * 0.2;
      y += (ty - y) * 0.2;
      scale += (targetScale - scale) * 0.18;
      if (borderColor !== targetBorderColor) {
        // subtle transition handled by CSS transition
        borderColor = targetBorderColor;
        ring.style.borderColor = borderColor;
        const isWhite = borderColor.includes("255");
        ring.style.boxShadow = isWhite ? "0 0 28px rgba(255,255,255,0.22)" : "0 0 24px rgba(0,0,0,0.08)";
        ring.style.mixBlendMode = isWhite ? "normal" : "multiply";
      }
      const base = 14; // half of base ring size (28px)
      // Lock wrapper to cursor center, no scaling here
      el.style.transform = `translate(${x - base}px, ${y - base}px)`;
      // Scale only the inner ring so the center dot stays perfectly centered
      ring.style.transform = `scale(${scale})`;
      rid = requestAnimationFrame(loop);
    };
    rid = requestAnimationFrame(loop);

    return () => { cancelAnimationFrame(rid); window.removeEventListener("pointermove", onMove); window.removeEventListener("mouseover", onOver); };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden
      className="fixed left-0 top-0 z-50 hidden md:block pointer-events-none"
      style={{
        width: 28,
        height: 28,
      }}
    >
      <div
        ref={ringRef}
        aria-hidden
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: 28,
          height: 28,
          borderRadius: 999,
          border: "1.5px solid rgba(0,0,0,0.35)",
          boxShadow: "0 0 24px rgba(0,0,0,0.08)",
          mixBlendMode: "multiply",
          transition: "border-color 120ms ease",
          transformOrigin: "center",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          width: 4,
          height: 4,
          borderRadius: 999,
          background: "#000",
          transform: "translate(-50%, -50%)",
          boxShadow: "0 0 2px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  );
}
