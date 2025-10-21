"use client";
import { useEffect } from "react";

export default function AuroraMotion() {
  useEffect(() => {
    const prefersReduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduce) return;

    const el = document.querySelector<HTMLElement>(".aurora-bg");
    if (!el) return;

    let raf = 0;
    let targetX = 0, targetY = 0;
    let xA = 0, yA = 0, xB = 0, yB = 0;

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const nx = (e.clientX / vw) * 2 - 1; // -1..1
      const ny = (e.clientY / vh) * 2 - 1;
      // target in px: small parallax offsets
      targetX = nx * 18; // px
      targetY = ny * 12; // px
    };

    // Mobile: use device orientation if available
    const onOrient = (e: DeviceOrientationEvent) => {
      const beta = (e.beta ?? 0);  // front/back tilt [-180,180]
      const gamma = (e.gamma ?? 0); // left/right tilt [-90,90]
      const nx = Math.max(-1, Math.min(1, gamma / 45));
      const ny = Math.max(-1, Math.min(1, beta / 60));
      targetX = nx * 14;
      targetY = ny * 10;
    };

    const tick = () => {
      // smooth
      xA += (targetX - xA) * 0.06;
      yA += (targetY - yA) * 0.06;
      // opposite/parallax for B
      xB += ((-targetX * 0.8) - xB) * 0.06;
      yB += ((-targetY * 0.6) - yB) * 0.06;
      el.style.setProperty("--aurora-x-a", `${xA}px`);
      el.style.setProperty("--aurora-y-a", `${yA}px`);
      el.style.setProperty("--aurora-x-b", `${xB}px`);
      el.style.setProperty("--aurora-y-b", `${yB}px`);
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onMove);
    // Attach orientation only if supported. On iOS, permission is required.
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
          try {
            const res = await req();
            if (res === "granted") attachOrient();
          } catch {}
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
  return null;
}
