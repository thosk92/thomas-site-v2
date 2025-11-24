"use client";

import React from "react";

type StepperProps = {
  current: number;
  total: number;
  labels?: string[];
};

export default function Stepper({ current, total, labels }: StepperProps) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-center gap-3 text-xs text-[#777777] mb-4">
      {steps.map((step, idx) => {
        const active = step === current;
        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={
                "flex h-7 w-7 items-center justify-center rounded-full border text-[11px] font-medium transition-colors " +
                (active
                  ? "border-[#D7FBE8] bg-[#D7FBE8] text-[#1F3A5F]"
                  : "border-[#D0D0D0] bg-white text-[#777777]")
              }
            >
              {step}
            </div>
            {labels && labels[idx] && <span className="hidden sm:inline text-[11px] font-medium">{labels[idx]}</span>}
          </div>
        );
      })}
    </div>
  );
}
