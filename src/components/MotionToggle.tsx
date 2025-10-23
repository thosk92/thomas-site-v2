"use client";
import { useEffect, useState } from "react";

export default function MotionToggle() {
  const [enabled, setEnabled] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("motion-enabled");
      if (stored === "false") setEnabled(false);
    } catch {}
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    try {
      window.localStorage.setItem("motion-enabled", next ? "true" : "false");
    } catch {}
    window.dispatchEvent(new CustomEvent("motion-toggle"));
  };

  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={toggle}
      className="text-xs px-2 py-1 rounded-full border transition hover:opacity-80"
      style={{ borderColor: "color-mix(in oklab,var(--foreground) 20%, transparent)", color: "color-mix(in oklab,var(--foreground) 75%, transparent)" }}
      title="Toggle motion"
    >
      Motion: {enabled ? "On" : "Off"}
    </button>
  );
}
