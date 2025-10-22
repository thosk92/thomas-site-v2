"use client";
import { useEffect, useRef, useState } from "react";

export default function HeroInitials({ letters = ["T", "Z"] }: { letters?: [string, string] }) {
  const [started, setStarted] = useState(false);
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setStarted(true);
      return;
    }
    const t = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <section className="hero-initials" aria-label="Intro">
      <svg
        ref={ref}
        className={`hi-svg ${started ? "is-started" : ""}`}
        viewBox="0 0 1200 400"
        role="img"
        aria-labelledby="hi-title"
      >
        <title id="hi-title">Initials {letters[0]} {letters[1]}</title>
        <defs>
          <linearGradient id="hi-fill" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0f766e" stopOpacity="1" />
            <stop offset="50%" stopColor="#115e59" stopOpacity="1" />
            <stop offset="100%" stopColor="#0b4f52" stopOpacity="1" />
          </linearGradient>
        </defs>
        <g className="hi-group" transform="translate(600 200)">
          {/* Stylized T: asymmetric arm with block stem */}
          <path
            className="hi-letter hi-t"
            transform="translate(-190 0) scale(1.05)"
            d="M -140 -150 H 140 V -106 H 30 V 90 H -26 V -106 H -140 Z"
          />
          {/* Stylized Z: slanted diagonal with chamfered joints */}
          <path
            className="hi-letter hi-z"
            transform="translate(190 0) scale(1.05)"
            d="M -140 -150 H 140 V -106 H -20 L 140 90 V 134 H -140 V 90 H 20 L -140 -106 Z"
          />
        </g>
      </svg>
      <div className="sr-only">Thomas Zanelli</div>
    </section>
  );
}
