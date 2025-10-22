"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroInitials() {
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
      }, 1000);
      return () => clearTimeout(toRM);
    }
    const t = requestAnimationFrame(() => setStarted(true));
    // After signature animation ends, wait 2s then scroll
    let endTimer = 0;
    const onEnd: EventListener = () => {
      endTimer = window.setTimeout(() => {
        const main = document.querySelector("main");
        if (main) main.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 1000);
    };
    const sigNode = sigRef.current;
    const options: AddEventListenerOptions = { once: true };
    sigNode?.addEventListener("animationend", onEnd, options);
    return () => { cancelAnimationFrame(t); if (endTimer) clearTimeout(endTimer); sigNode?.removeEventListener("animationend", onEnd); };
  }, []);

  return (
    <section className="hero-initials" aria-label="Intro">
      {/* Signature overlay */}
      <div ref={sigRef} className={`sig ${started ? "is-started" : ""}`} aria-hidden>
        <svg className="sig-svg" viewBox="0 0 1200 380">
          <text x="50%" y="30%" textAnchor="middle" className="sig-text">Thomas</text>
          <text x="50%" y="88%" textAnchor="middle" className="sig-text">Zanelli</text>
        </svg>
      </div>
      <div className="sr-only">Thomas Zanelli</div>
    </section>
  );
}
