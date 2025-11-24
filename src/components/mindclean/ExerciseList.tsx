"use client";

import { addExerciseSession } from "@/lib/storage";
import { ExerciseType } from "@/lib/types";
import { todayISO, uid } from "@/lib/utils";
import { useState } from "react";

export default function ExerciseList() {
  const [active, setActive] = useState<ExerciseType | null>(null);

  function start(type: ExerciseType) {
    setActive(type);
    addExerciseSession({ id: uid(), date: todayISO(), type });
  }

  if (active === "breathing") {
    return (
      <div className="space-y-4">
        <div className="text-center text-sm font-medium text-slate-800">Inhale 4 · Hold 4 · Exhale 6</div>
        <div className="animate-pulse mx-auto size-24 rounded-full bg-blue-200/70" />
        <button className="w-full rounded-xl bg-blue-600 text-white py-2 text-sm" onClick={() => setActive(null)}>I&apos;m done</button>
      </div>
    );
  }

  if (active === "journal") {
    return (
      <div className="space-y-3">
        <textarea
          rows={6}
          className="w-full rounded-xl border border-slate-200/80 bg-white/80 p-3 text-sm"
          placeholder="Write freely for a few minutes, without judging yourself."
        />
        <button className="w-full rounded-xl bg-blue-600 text-white py-2 text-sm" onClick={() => setActive(null)}>I&apos;m done</button>
      </div>
    );
  }

  if (active === "reframe") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-600">
          Pick a difficult thought and try to rewrite it in a kinder, more balanced way.
        </p>
        <button className="w-full rounded-xl bg-blue-600 text-white py-2 text-sm" onClick={() => setActive(null)}>I&apos;m done</button>
      </div>
    );
  }

  const items: { type: ExerciseType; title: string; desc: string; emoji: string }[] = [
    { type: "breathing", title: "Breathing", desc: "1 minute to slow down your breath", emoji: "🌬️" },
    { type: "journal", title: "Journaling", desc: "Unload your thoughts onto the page", emoji: "📔" },
    { type: "reframe", title: "Reframe", desc: "See the thought from another angle", emoji: "✨" },
  ];

  return (
    <div className="space-y-3">
      {items.map((it) => (
        <button
          key={it.type}
          onClick={() => start(it.type)}
          className="w-full text-left rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] hover:border-blue-200 hover:bg-blue-50/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">{it.emoji}</div>
            <div>
              <div className="font-medium text-sm text-slate-800">{it.title}</div>
              <div className="text-xs text-gray-600">{it.desc}</div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
