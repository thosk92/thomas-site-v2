"use client";

import Card from "@/components/mindclean/Card";
import { getExerciseSessions, getMoodEntries, getThoughtEntries } from "@/lib/storage";
import { formatDateFriendly, todayISO } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

export default function HistoryPage() {
  const [moods, setMoods] = useState<{ mood: number; date: string }[]>([]);
  const [thoughts, setThoughts] = useState<{ rawText: string; reframedText: string; date: string }[]>([]);
  const [sessions, setSessions] = useState<{ type: string; date: string }[]>([]);

  useEffect(() => {
    const ms = getMoodEntries();
    const ts = getThoughtEntries();
    const ss = getExerciseSessions();
    setMoods(ms.map(m => ({ mood: m.mood, date: m.date })));
    setThoughts(ts.map(t => ({ rawText: t.rawText, reframedText: t.reframedText, date: t.date })));
    setSessions(ss.map(s => ({ type: s.type, date: s.date })));
  }, []);

  const last7Days = useMemo(() => {
    const result: { label: string; date: string; value: number | null }[] = [];
    const today = new Date(todayISO());

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayLabel = d.toLocaleDateString(undefined, { weekday: "short" });
      const dayMoods = moods.filter((m) => m.date.startsWith(iso));
      if (dayMoods.length === 0) {
        result.push({ label: dayLabel, date: iso, value: null });
      } else {
        const avg = dayMoods.reduce((acc, m) => acc + m.mood, 0) / dayMoods.length;
        result.push({ label: dayLabel, date: iso, value: Math.round(avg * 10) / 10 });
      }
    }

    return result;
  }, [moods]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">History</h1>

      <Card>
        <div className="space-y-3">
          <div className="text-base font-semibold flex items-center gap-1">
            <span>Mood trend · last 7 days</span>
            <span aria-hidden>🌤️</span>
          </div>
          <div className="space-y-2">
            {last7Days.length === 0 && <p className="text-sm text-gray-500">No data recorded yet.</p>}
            {last7Days.length > 0 && (
              <div className="space-y-1">
                {last7Days.map((d) => (
                  <div key={d.date} className="flex items-center gap-2 text-xs text-gray-600">
                    <span className="w-10 shrink-0 text-[11px] font-medium">{d.label}</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100 overflow-hidden">
                      {d.value !== null && (
                        <div
                          className="h-full rounded-full bg-blue-400/80"
                          style={{ width: `${(d.value / 5) * 100}%` }}
                        />
                      )}
                    </div>
                    <span className="w-8 text-right tabular-nums text-[11px]">
                      {d.value !== null ? d.value.toFixed(1) : "–"}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-1">
            <div className="text-sm font-semibold flex items-center gap-1">
              <span>All moods</span>
              <span aria-hidden>⭐</span>
            </div>
            <ul className="space-y-1 text-sm max-h-40 overflow-y-auto pr-1">
              {moods.length === 0 && <li className="text-gray-500">No moods saved yet.</li>}
              {moods.map((m, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span>{"★".repeat(m.mood)}</span>
                  <span className="text-gray-500">{formatDateFriendly(m.date)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="text-base font-semibold flex items-center gap-1">
            <span>Thought reframes</span>
            <span aria-hidden>💭✨</span>
          </div>
          <ul className="space-y-3 text-sm">
            {thoughts.length === 0 && <li className="text-gray-500">You haven&apos;t reframed any thoughts yet.</li>}
            {thoughts.map((t, i) => (
              <li key={i}>
                <div className="text-gray-700">“{t.rawText}”</div>
                <div className="text-gray-500">→ {t.reframedText}</div>
                <div className="text-xs text-gray-400 mt-1">{formatDateFriendly(t.date)}</div>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="text-base font-semibold flex items-center gap-1">
            <span>Exercises</span>
            <span aria-hidden>🧘</span>
          </div>
          <ul className="space-y-1 text-sm">
            {sessions.length === 0 && <li className="text-gray-500">No exercises completed yet.</li>}
            {sessions.map((s, i) => (
              <li key={i} className="flex items-center justify-between">
                <span className="capitalize">{s.type}</span>
                <span className="text-gray-500">{formatDateFriendly(s.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
