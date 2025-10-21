"use client";
import { useEffect, useState } from "react";

type Pref = "system" | "time" | "solar" | "light" | "dark";

function readPref(): Pref {
  if (typeof window === "undefined") return "system";
  const v = window.localStorage.getItem("theme-pref");
  if (v === "light" || v === "dark" || v === "time" || v === "solar" || v === "system") return v;
  return "system";
}

export default function ThemeToggle() {
  const [pref, setPref] = useState<Pref>("system");

  useEffect(() => {
    setPref(readPref());
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("theme-pref", pref);
    // dispatch event so TimeTheme can re-evaluate immediately
    window.dispatchEvent(new CustomEvent("theme-pref-change", { detail: { pref } }));
  }, [pref]);

  const Btn = ({ value, label }: { value: Pref; label: string }) => (
    <button
      onClick={() => setPref(value)}
      className={`px-2.5 py-1 rounded-md text-xs border transition`}
      style={
        pref === value
          ? {
              background: "color-mix(in oklab, var(--foreground) 10%, transparent)",
              borderColor: "color-mix(in oklab, var(--foreground) 30%, transparent)",
            }
          : {
              borderColor: "color-mix(in oklab, var(--foreground) 10%, transparent)",
            }
      }
      aria-pressed={pref === value}
    >{label}</button>
  );

  return (
    <div
      className="inline-flex items-center gap-1 backdrop-blur rounded-full p-1 border"
      style={{
        background: "color-mix(in oklab, var(--background) 80%, transparent)",
        borderColor: "color-mix(in oklab, var(--foreground) 20%, transparent)",
      }}
    >
      <Btn value="light" label="Light" />
      <Btn value="dark" label="Dark" />
      <Btn value="time" label="Time" />
      <Btn value="solar" label="Solar" />
      <Btn value="system" label="System" />
    </div>
  );
}
