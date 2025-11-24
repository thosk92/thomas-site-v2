"use client";

import Card from "@/components/mindclean/Card";
import MoodSelector from "@/components/mindclean/MoodSelector";
import { addMoodEntry, getMoodEntries } from "@/lib/storage";
import { todayISO, uid, formatDateFriendly } from "@/lib/utils";
import Link from "next/link";
import type { Route } from "next";
import { useEffect, useState } from "react";

export default function MoodPage() {
  const [mood, setMood] = useState<number | undefined>();
  const [recent, setRecent] = useState<{ mood: number; date: string }[]>([]);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  useEffect(() => {
    const moods = getMoodEntries();
    setRecent(moods.slice(0, 10).map(m => ({ mood: m.mood, date: m.date })));
  }, []);

  function save() {
    if (!mood) return;
    const date = todayISO();
    addMoodEntry({ id: uid(), date, mood });
    setRecent((r) => [{ mood, date }, ...r].slice(0, 10));
    setMood(undefined);

    if (mood <= 2) {
      setSuggestion("Today feels heavy. A short breathing or journaling exercise might help lighten things.");
    } else if (mood >= 4) {
      setSuggestion("Nice! You could capture this moment with a short gratitude note.");
    } else {
      setSuggestion(null);
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Mood check-in</h1>
      <Card>
        <div className="space-y-3">
          <MoodSelector value={mood} onChange={setMood} />
          <button onClick={save} className="w-full rounded-xl bg-blue-600 text-white py-2 text-sm font-medium shadow-[0_8px_22px_rgba(37,99,235,0.35)] disabled:opacity-50 disabled:shadow-none" disabled={!mood}>
            Save how I feel today
          </button>
        </div>
      </Card>

      {suggestion && (
        <Card className="bg-blue-50/60 border-blue-100">
          <div className="space-y-2 text-sm text-slate-700">
            <p>{suggestion}</p>
            <Link
              href={"/mindclean/exercises" as Route}
              className="inline-flex items-center text-[11px] font-medium text-blue-700 hover:text-blue-800"
            >
              Go to exercises →
            </Link>
          </div>
        </Card>
      )}

      <Card>
        <div className="space-y-2">
          <div className="text-base font-semibold flex items-center gap-1">
            <span>Recent moods</span>
            <span aria-hidden>📅</span>
          </div>
          <ul className="space-y-1">
            {recent.length === 0 && <li className="text-sm text-gray-500">No entries yet.</li>}
            {recent.map((m, i) => (
              <li key={i} className="text-sm flex items-center justify-between">
                <span>{"★".repeat(m.mood)}</span>
                <span className="text-gray-500">{formatDateFriendly(m.date)}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
