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
          {/* Elegant T: high-contrast serif with slight flare and curved arm */}
          <path
            className="hi-letter hi-t"
            transform="translate(-165 0) scale(1.06)"
            d="M -150 -150 H 150 Q 130 -138 118 -120 H 36 Q 22 -120 22 -104 V 132 Q -8 138 -28 134 V -104 Q -28 -120 -42 -120 H -118 Q -132 -138 -150 -150 Z"
          />
          {/* Elegant Z: tapered diagonal with soft terminals and slight curvature */}
          <path
            className="hi-letter hi-z"
            transform="translate(165 0) scale(1.06)"
            d="M -150 -150 H 150 Q 132 -134 118 -118 H -24 Q -6 -104 10 -86 L 150 52 Q 150 68 150 86 H -150 Q -132 70 -118 54 H 32 Q 12 42 -6 24 L -150 -114 Q -150 -132 -150 -150 Z"
          />
        </g>
      </svg>
      <div className="sr-only">Thomas Zanelli</div>
    </section>
  );
}
