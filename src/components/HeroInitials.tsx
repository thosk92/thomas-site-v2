"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroInitials({ letters = ["T", "Z"] }: { letters?: [string, string] }) {
  const [started, setStarted] = useState(false);
  const sigRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStarted(true);
      // Scroll after a short pause when reduced motion
      const toRM = window.setTimeout(() => {
        const main = document.querySelector("main");
        if (main) main.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 2000);
      return () => clearTimeout(toRM);
    }
    const t = requestAnimationFrame(() => setStarted(true));
    // After signature animation ends, wait 2s then scroll
    let endTimer = 0;
    const onEnd = () => {
      endTimer = window.setTimeout(() => {
        const main = document.querySelector("main");
        if (main) main.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 2000);
    };
    const sigNode = sigRef.current;
    sigNode?.addEventListener("animationend", onEnd, { once: true } as any);
    return () => { cancelAnimationFrame(t); if (endTimer) clearTimeout(endTimer); sigNode?.removeEventListener("animationend", onEnd); };
  }, []);

  return (
    <section className="hero-initials" aria-label="Intro">
      {/* Signature overlay */}
      <div ref={sigRef} className={`sig ${started ? "is-started" : ""}`} aria-hidden>
        <svg className="sig-svg" viewBox="0 0 1200 300">
          <text x="50%" y="40%" textAnchor="middle" className="sig-text">Thomas</text>
          <text x="50%" y="72%" textAnchor="middle" className="sig-text">Zanelli</text>
        </svg>
      </div>
      <div className="sr-only">Thomas Zanelli</div>
    </section>
  );
}
