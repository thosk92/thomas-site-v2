"use client";
import React from "react";

export default function Wordmark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 720 120"
      role="img"
      aria-label="Thomas Zanelli"
      width="auto"
      height="24"
      style={{ display: "block" }}
    >
      <title>Thomas Zanelli</title>
      <defs>
        <linearGradient id="wm-grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--foreground) 80%, transparent)" />
          <stop offset="100%" stopColor="color-mix(in oklab, var(--foreground) 90%, transparent)" />
        </linearGradient>
        <filter id="wm-soft" x="-20%" y="-40%" width="140%" height="180%">
          <feGaussianBlur stdDeviation="0.6" result="blur" />
          <feBlend in="SourceGraphic" in2="blur" mode="normal" />
        </filter>
      </defs>
      {/* Wordmark built as text for responsive crispness; inherits loaded Space Grotesk */}
      <g style={{ filter: "url(#wm-soft)" }}>
        <text
          x="0"
          y="84"
          fontFamily="var(--font-geist-sans), system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif"
          fontWeight={700}
          fontSize="78"
          letterSpacing="-0.02em"
          fill="url(#wm-grad)"
          stroke="color-mix(in oklab, var(--foreground) 20%, transparent)"
          strokeWidth="0.6"
          paintOrder="stroke fill"
        >
          Thomas Zanelli
        </text>
      </g>
    </svg>
  );
}
