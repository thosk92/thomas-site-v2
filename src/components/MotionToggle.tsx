"use client";
import { useEffect, useState } from "react";

export default function MotionToggle() {
  const [off, setOff] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("motionOff");
    setOff(saved === "1");
  }, []);

  useEffect(() => {
    window.localStorage.setItem("motionOff", off ? "1" : "0");
    const evt = new CustomEvent("motion-toggle", { detail: off });
    window.dispatchEvent(evt);
  }, [off]);

  return (
    <button
      onClick={() => setOff(v => !v)}
      className="fixed bottom-4 right-4 z-50 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs shadow-sm backdrop-blur hover:bg-white"
      title="Toggle motion"
      aria-pressed={off}
    >
      {off ? "Motion off" : "Motion on"}
    </button>
  );
}
