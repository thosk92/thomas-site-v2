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
          <linearGradient id="hi-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#16a34a" stopOpacity="0.9" />
            <stop offset="60%" stopColor="#15803d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.85" />
          </linearGradient>
        </defs>
        <g className="hi-group">
          <text x="20%" y="68%" className="hi-letter hi-t" textAnchor="middle">
            {letters[0]}
          </text>
          <text x="80%" y="68%" className="hi-letter hi-z" textAnchor="middle">
            {letters[1]}
          </text>
        </g>
      </svg>
      <div className="sr-only">Thomas Zanelli</div>
    </section>
  );
}
