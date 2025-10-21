"use client";
import React from "react";

export default function BackgroundGradient() {
  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 pointer-events-none"
      style={{
        background: "radial-gradient(1200px 800px at 20% 10%, rgba(99,102,241,0.25), rgba(250,250,250,0) 60%), radial-gradient(1000px 700px at 80% 20%, rgba(236,72,153,0.22), rgba(250,250,250,0) 55%), radial-gradient(900px 900px at 50% 80%, rgba(56,189,248,0.18), rgba(250,250,250,0) 50%), #FAFAFA",
        animation: "bg-move 18s ease-in-out infinite alternate",
        willChange: "background-position, transform",
        transform: "translateZ(0)",
      }}
    />
  );
}

const style = typeof document !== "undefined" ? document.createElement("style") : null;
if (style) {
  style.innerHTML = `@keyframes bg-move { 0% { background-position: 0px 0px, 0px 0px, 0px 0px; } 50% { background-position: 60px -40px, -50px 30px, 40px 60px; } 100% { background-position: -90px 60px, 70px -20px, -60px -70px; } }`;
  document.head.appendChild(style);
}
