"use client";
import { useEffect, useRef } from "react";

export default function HeroMonogram({ letters = ["T", "Z"] }: { letters?: [string, string] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let raf = 0;
    let tx = 0, ty = 0; // targets
    let x = 0, y = 0;   // smoothed

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const r = el.getBoundingClientRect();
      const nx = ((e.clientX - (r.left + r.width / 2)) / Math.max(1, r.width / 2)); // -1..1
      const ny = ((e.clientY - (r.top + r.height / 2)) / Math.max(1, r.height / 2));
      tx = nx * 10; // px
      ty = ny * 8;  // px
    };

    const onOrient = (e: DeviceOrientationEvent) => {
      const beta = (e.beta ?? 0);
      const gamma = (e.gamma ?? 0);
      const nx = Math.max(-1, Math.min(1, gamma / 45));
      const ny = Math.max(-1, Math.min(1, beta / 60));
      tx = nx * 8;
      ty = ny * 6;
    };

    const tick = () => {
      x += (tx - x) * 0.08;
      y += (ty - y) * 0.08;
      el.style.setProperty("--hero-tx", `${x.toFixed(2)}px`);
      el.style.setProperty("--hero-ty", `${y.toFixed(2)}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    let orientAttached = false;
    const attachOrient = () => {
      if (orientAttached) return;
      window.addEventListener("deviceorientation", onOrient);
      orientAttached = true;
    };
    if (typeof window.DeviceOrientationEvent !== "undefined") {
      type DOEWithPermission = typeof window.DeviceOrientationEvent & {
        requestPermission?: () => Promise<"granted" | "denied">;
      };
      const doe = window.DeviceOrientationEvent as DOEWithPermission;
      const req = doe.requestPermission;
      if (typeof req === "function") {
        const onFirstTouch = async () => {
          try { const res = await req(); if (res === "granted") attachOrient(); } catch {}
          window.removeEventListener("touchend", onFirstTouch);
        };
        window.addEventListener("touchend", onFirstTouch, { passive: true, once: true });
      } else {
        attachOrient();
      }
    }

    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (orientAttached) window.removeEventListener("deviceorientation", onOrient);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hero-monogram" ref={ref} aria-label="Intro">
      <div className="hero-mono-wrap" aria-hidden>
        <span className="hero-letter hero-letter-a">{letters[0]}</span>
        <span className="hero-letter hero-letter-b">{letters[1]}</span>
      </div>
      <div className="sr-only">Thomas Zanelli</div>
    </section>
  );
}
