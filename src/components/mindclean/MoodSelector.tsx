"use client";

import { Frown, Meh, Smile } from "lucide-react";

type Props = { value?: number; onChange?: (v: number) => void };

type Level = {
  value: number;
  label: string;
  intensity: "low" | "medium" | "high";
};

const levels: Level[] = [
  { value: 1, label: "Very low", intensity: "low" },
  { value: 2, label: "Low", intensity: "low" },
  { value: 3, label: "Okay", intensity: "medium" },
  { value: 4, label: "Good", intensity: "high" },
  { value: 5, label: "Great", intensity: "high" },
];

export default function MoodSelector({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-5 gap-3 text-xs">
      {levels.map((lvl) => {
        const active = value === lvl.value;
        const Icon = lvl.intensity === "low" ? Frown : lvl.intensity === "medium" ? Meh : Smile;
        return (
          <button
            key={lvl.value}
            type="button"
            onClick={() => onChange?.(lvl.value)}
            className={
              "flex flex-col items-center justify-center rounded-2xl border px-3 py-2 transition-all duration-200 " +
              (active
                ? "border-blue-500/70 bg-blue-50 shadow-[0_10px_26px_rgba(59,130,246,0.25)] scale-[1.03] text-blue-700"
                : "border-slate-200/80 bg-white/90 text-slate-600 hover:bg-slate-50 hover:border-slate-300")
            }
          >
            <Icon className="mb-1 h-5 w-5" aria-hidden />
            <span className="text-[11px] leading-tight font-medium">{lvl.label}</span>
          </button>
        );
      })}
    </div>
  );
}

