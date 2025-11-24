"use client";

import Card from "@/components/mindclean/Card";
import ThoughtEditor from "@/components/mindclean/ThoughtEditor";
import { getThoughtEntries } from "@/lib/storage";
import { formatDateFriendly } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function ThoughtsPage() {
  const [items, setItems] = useState<{ id: string; rawText: string; reframedText: string; date: string }[]>([]);

  function reload() {
    const list = getThoughtEntries();
    setItems(list);
  }

  useEffect(() => {
    reload();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Reframe thoughts</h1>

      <Card>
        <ThoughtEditor onSaved={reload} />
      </Card>

      <Card>
        <div className="space-y-2">
          <div className="text-base font-semibold flex items-center gap-1">
            <span>Recent reframes</span>
            <span aria-hidden>✨</span>
          </div>
          <ul className="space-y-3">
            {items.length === 0 && <li className="text-sm text-gray-500">You will see your reframed thoughts here.</li>}
            {items.map((t) => (
              <li key={t.id} className="text-sm">
                <div className="text-gray-700">“{t.rawText}”</div>
                <div className="text-gray-500">→ {t.reframedText}</div>
                <div className="text-xs text-gray-400 mt-1">{formatDateFriendly(t.date)}</div>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
}
