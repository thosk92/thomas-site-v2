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
          {/* Gothic glyphs via UnifrakturCook */}
          <text x="44%" y="20%" className="hi-letter hi-gothic hi-t" textAnchor="middle" dominantBaseline="middle">{letters[0]}</text>
          <text x="56%" y="20%" className="hi-letter hi-gothic hi-z" textAnchor="middle" dominantBaseline="middle">{letters[1]}</text>
        </g>
      </svg>
      <div className="sr-only">Thomas Zanelli</div>
    </section>
  );
}
