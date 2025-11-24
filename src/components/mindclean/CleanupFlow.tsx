"use client";

import { useState } from "react";
import Card from "@/components/mindclean/Card";
import Stepper from "@/components/mindclean/Stepper";
import Chip from "@/components/mindclean/Chip";

const CATEGORIES = ["Worry", "Task", "Memory", "Idea", "Other"];
const DECISIONS = ["Keep", "Let go", "Schedule", "Reframe with AI"];

export default function CleanupFlow() {
  const [step, setStep] = useState(1);
  const [thought, setThought] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [decision, setDecision] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);

  const canGoNext =
    (step === 1 && thought.trim().length > 0) ||
    (step === 2 && !!category) ||
    (step === 3 && !!decision && !aiLoading);

  async function handleNext() {
    if (!canGoNext) return;

    if (step < 3) {
      setStep((s) => s + 1);
      return;
    }

    if (decision === "Reframe with AI") {
      if (!thought.trim()) return;
      setAiError(null);
      setAiLoading(true);
      try {
        const res = await fetch("/api/mindclean/reframe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawText: thought }),
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Cleanup AI error", res.status, text);
          setAiError("I couldn&apos;t generate a reframe right now. Please try again.");
          setAiSuggestion(null);
          return;
        }

        const data = (await res.json()) as { suggestion?: string };
        if (!data.suggestion) {
          setAiError("AI returned an empty response.");
          setAiSuggestion(null);
          return;
        }

        setAiSuggestion(data.suggestion.trim());
        setAiError(null);
      } catch (err) {
        console.error("Cleanup AI exception", err);
        setAiError("An error occurred while calling the AI.");
        setAiSuggestion(null);
      } finally {
        setAiLoading(false);
      }
      return;
    }

    setThought("");
    setCategory(null);
    setDecision(null);
    setAiSuggestion(null);
    setAiError(null);
    setStep(1);
  }

  function primaryCtaLabel() {
    if (aiLoading) return "Thinking...";
    if (step === 1) return "Next step";
    if (step === 2) return "Next step";
    if (step === 3 && decision === "Reframe with AI") return "Reframe with AI";
    if (step === 3) return "Finish clean-up";
    return "Next";
  }

  return (
    <div className="max-w-3xl mx-auto animate-[fadeIn_0.22s_ease-out]">
      <div className="mb-6 space-y-1">
        <h1 className="text-[1.6rem] font-semibold tracking-tight text-[#1F3A5F]">Mental Clean-Up</h1>
        <p className="text-[0.9rem] text-[#777777]">
          A calm, step-by-step space to capture a thought, give it a name, and gently choose what to do with it.
        </p>
      </div>

      <Card className="rounded-3xl px-5 py-5 sm:px-7 sm:py-7">
        <Stepper current={step} total={3} labels={["Capture", "Label", "Decide"]} />

        {step === 1 && (
          <div className="space-y-4 animate-[fadeIn_0.18s_ease-out]">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#1F3A5F]">Step 1 · Capture the thought</h2>
              <p className="text-sm text-[#777777]">
                Write down what is looping in your mind, exactly as it shows up. No filter, no judgment.
              </p>
            </div>
            <textarea
              value={thought}
              onChange={(e) => setThought(e.target.value)}
              rows={4}
              className="w-full rounded-2xl border border-[#DCDCDC] bg-white px-4 py-3 text-sm text-[#575757] outline-none focus:border-[#D7FBE8] focus:ring-2 focus:ring-[#D7FBE8]/70 transition-all"
              placeholder="E.g. 'I&apos;m behind on everything and I&apos;ll never catch up.'"
            />
            <p className="text-xs text-[#999999]">
              There is no right or wrong here. This is just a snapshot of your mind in this moment.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-[fadeIn_0.18s_ease-out]">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#1F3A5F]">Step 2 · Label it</h2>
              <p className="text-sm text-[#777777]">
                What kind of mental item is this? A worry, a task, a memory, an idea?
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <Chip
                  key={cat}
                  label={cat}
                  selected={category === cat}
                  onClick={() => setCategory(cat)}
                />
              ))}
            </div>
            <p className="text-xs text-[#999999]">
              Labels don&apos;t have to be perfect. They just help you see the shape of the thought.
            </p>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 animate-[fadeIn_0.18s_ease-out]">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-[#1F3A5F]">Step 3 · Decide what to do</h2>
              <p className="text-sm text-[#777777]">
                Gently choose the most helpful next move for this thought. Small, kind decisions are enough.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {DECISIONS.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDecision(opt)}
                  className={
                    "flex items-center justify-between rounded-2xl border px-4 py-3 text-xs sm:text-sm transition-colors transition-transform duration-150 ease-out " +
                    (decision === opt
                      ? "border-[#1F3A5F] bg-[#1F3A5F] text-white shadow-sm scale-[1.02]"
                      : "border-[#D0D0D0] bg-white text-[#575757] hover:border-[#A5D8FF] hover:bg-[#F0F7FF]")
                  }
                >
                  <span>{opt}</span>
                  {opt === "Reframe with AI" && (
                    <span className="text-[10px] uppercase tracking-wide opacity-80">Uses AI</span>
                  )}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#999999]">
              You can always change your mind later. The goal is to feel a little lighter, not to be perfect.
            </p>

            {decision === "Reframe with AI" && (aiSuggestion || aiError) && (
              <div className="mt-3 rounded-2xl border border-[#E0ECFF] bg-[#F5F8FF] px-4 py-3 text-xs text-[#374151]">
                {aiSuggestion && (
                  <div className="space-y-1">
                    <div className="font-medium text-[11px] uppercase tracking-wide text-[#4B5563]">
                      AI reframe
                    </div>
                    <p className="leading-relaxed whitespace-pre-line">{aiSuggestion}</p>
                  </div>
                )}
                {aiError && <p className="text-[11px] text-red-600">{aiError}</p>}
              </div>
            )}
          </div>
        )}

        <div className="mt-6 flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#888888]">
            Make space for yourself. One small clean-up at a time.
          </p>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canGoNext}
            className="inline-flex items-center justify-center rounded-full bg-[#1F3A5F] px-5 py-2 text-xs font-semibold text-white shadow-md transition-transform transition-shadow duration-200 ease-out hover:scale-[1.03] hover:shadow-lg disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-md"
          >
            {primaryCtaLabel()}
          </button>
        </div>
      </Card>
    </div>
  );
}
