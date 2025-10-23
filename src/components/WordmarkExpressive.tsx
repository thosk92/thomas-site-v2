"use client";
import React from "react";

export default function WordmarkExpressive({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 32"
      role="img"
      aria-label="Thomas Zanelli"
      width="auto"
      height="24"
      style={{ display: "block" }}
    >
      <title>Thomas Zanelli</title>
      <defs>
        <linearGradient id="wmx-grad-ink" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--foreground) 92%, transparent)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--foreground) 78%, transparent)" />
        </linearGradient>
        <linearGradient id="wmx-grad-glow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--foreground) 18%, transparent)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--foreground) 8%, transparent)" />
        </linearGradient>
        <filter id="wmx-soft" x="-30%" y="-40%" width="160%" height="180%">
          <feGaussianBlur stdDeviation="0.6" result="b" />
          <feBlend in="SourceGraphic" in2="b" mode="normal" />
        </filter>
      </defs>

      {/* Monogram badge */}
      <g transform="translate(0,0)" style={{ filter: "url(#wmx-soft)" }}>
        {/* outer ring */}
        <circle cx="14" cy="16" r="13.2" fill="none" stroke="url(#wmx-grad-glow)" strokeWidth="1.2" />
        {/* inner ring */}
        <circle cx="14" cy="16" r="10.6" fill="none" stroke="url(#wmx-grad-glow)" strokeWidth="0.8" />
        {/* TZ glyphs (gothic/script mix via fonts) */}
        <text
          x="14"
          y="20.2"
          textAnchor="middle"
          fontFamily="var(--font-gothic), ui-serif, Georgia, serif"
          fontWeight={700}
          fontSize="16"
          letterSpacing="-0.02em"
          fill="url(#wmx-grad-ink)"
          stroke="color-mix(in oklab, var(--foreground) 20%, transparent)"
          strokeWidth="0.4"
          paintOrder="stroke fill"
        >
          TZ
        </text>
      </g>

      {/* Logotype */}
      <g transform="translate(40,0)" style={{ filter: "url(#wmx-soft)" }}>
        <text
          x="0"
          y="22"
          fontFamily="var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
          fontWeight={800}
          fontSize="18"
          letterSpacing="-0.02em"
          fill="url(#wmx-grad-ink)"
          stroke="color-mix(in oklab, var(--foreground) 18%, transparent)"
          strokeWidth="0.3"
          paintOrder="stroke fill"
        >
          Thomas Zanelli
        </text>
      </g>
    </svg>
  );
}
