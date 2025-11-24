"use client";

import { useState } from "react";
import { addThoughtEntry } from "@/lib/storage";
import { uid, todayISO } from "@/lib/utils";

export default function ThoughtEditor({ onSaved }: { onSaved?: () => void }) {
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  async function handleSuggestWithAI(formData: FormData) {
    const rawText = String(formData.get("rawText") || "").trim();
    const emotion = String(formData.get("emotion") || "").trim();
    const intensity = String(formData.get("intensity") || "").trim();
    const evidence = String(formData.get("evidence") || "").trim();

    if (!rawText) {
      setAiError("Please type the automatic thought first.");
      return;
    }

    setAiError(null);
    setAiLoading(true);
    try {
      const res = await fetch("/api/mindclean/reframe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText, emotion, intensity, evidence }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI suggest error", res.status, text);
        setAiError("I can&apos;t generate a reframe right now. Please try again.");
        return;
      }

      const data = (await res.json()) as { suggestion?: string };
      if (!data.suggestion) {
        setAiError("AI returned an empty response.");
        return;
      }

      const field = document.querySelector<HTMLTextAreaElement>("textarea[name='reframedText']");
      if (field) {
        field.value = data.suggestion.trim();
        field.dispatchEvent(new Event("input", { bubbles: true }));
      }
    } catch (err) {
      console.error("AI suggest exception", err);
      setAiError("An error occurred while calling the AI.");
    } finally {
      setAiLoading(false);
    }
  }

  function handleSubmit(formData: FormData) {
    const rawText = String(formData.get("rawText") || "").trim();
    const emotion = String(formData.get("emotion") || "").trim();
    const intensity = String(formData.get("intensity") || "").trim();
    const evidence = String(formData.get("evidence") || "").trim();
    const reframedText = String(formData.get("reframedText") || "").trim();
    if (!rawText || !reframedText) return;
    addThoughtEntry({ id: uid(), date: todayISO(), rawText, reframedText });
    onSaved?.();
    (document.getElementById("thought-form") as HTMLFormElement | null)?.reset();
  }

  return (
    <form
      id="thought-form"
      action={async (fd) => {
        handleSubmit(fd);
      }}
      className="space-y-3"
    >
      <div className="space-y-1">
        <label className="text-sm font-medium">Automatic thought</label>
        <textarea
          name="rawText"
          rows={3}
          className="w-full rounded-xl border border-slate-200/80 bg-white/80 p-3 text-sm"
          placeholder="E.g. &apos;I always mess things up at work.&apos;"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Emotion</label>
          <input
            name="emotion"
            type="text"
            className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm"
            placeholder="Anxiety, sadness..."
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-600">Intensity (1–10)</label>
          <input
            name="intensity"
            type="number"
            min={1}
            max={10}
            className="w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-600">Evidence and alternatives</label>
        <textarea
          name="evidence"
          rows={3}
          className="w-full rounded-xl border border-slate-200/80 bg-white/80 p-3 text-sm"
          placeholder="What facts support or challenge this thought?"
        />
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">More balanced thought</label>
        <textarea
          name="reframedText"
          rows={3}
          className="w-full rounded-xl border border-slate-200/80 bg-white/80 p-3 text-sm"
          placeholder="A kinder, more realistic version of the thought."
        />
      </div>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            const form = document.getElementById("thought-form") as HTMLFormElement | null;
            if (!form) return;
            const fd = new FormData(form);
            void handleSuggestWithAI(fd);
          }}
          disabled={aiLoading}
          className="w-full rounded-xl border border-blue-200 bg-blue-50/70 text-blue-800 py-2 text-xs font-medium hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {aiLoading ? "Thinking..." : "Suggest reframe with AI"}
        </button>

        <button
          type="submit"
          className="w-full rounded-xl bg-blue-600 text-white py-2.5 text-sm font-medium shadow-[0_10px_30px_rgba(37,99,235,0.35)]"
        >
          Save reframe
        </button>

        {aiError && <p className="text-[11px] text-red-600">{aiError}</p>}
      </div>
    </form>
  );
}
