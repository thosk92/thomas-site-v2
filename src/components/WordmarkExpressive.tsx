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
      height="26"
      style={{ display: "block" }}
      shapeRendering="geometricPrecision"
      textRendering="geometricPrecision"
    >
      <title>Thomas Zanelli</title>
      {/* Monogram badge (crisp, no blur) */}
      <g transform="translate(0,0)">
        {/* outer ring */}
        <circle cx="14" cy="16" r="13.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
        {/* inner ring */}
        <circle cx="14" cy="16" r="10.6" fill="none" stroke="currentColor" strokeWidth="0.8" />
        {/* TZ glyphs */}
        <text
          x="14"
          y="20.2"
          textAnchor="middle"
          fontFamily="var(--font-gothic), ui-serif, Georgia, serif"
          fontWeight={700}
          fontSize="16"
          letterSpacing="-0.02em"
          fill="currentColor"
        >
          TZ
        </text>
      </g>

      {/* Logotype */}
      <g transform="translate(40,0)">
        <text
          x="0"
          y="22"
          fontFamily="var(--font-gothic), ui-serif, Georgia, serif"
          fontWeight={700}
          fontSize="19"
          letterSpacing="-0.02em"
          fill="currentColor"
        >
          Thomas Zanelli
        </text>
      </g>
    </svg>
  );
}
