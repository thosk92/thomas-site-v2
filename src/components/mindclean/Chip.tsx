"use client";

import React from "react";

type ChipProps = {
  label: string;
  selected?: boolean;
  onClick?: () => void;
};

export default function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors transition-transform duration-150 ease-out " +
        (selected
          ? "border-[#1F3A5F] bg-[#1F3A5F] text-white shadow-sm scale-[1.02]"
          : "border-[#D0D0D0] bg-white text-[#575757] hover:border-[#A5D8FF] hover:bg-[#F0F7FF]")
      }
    >
      {label}
    </button>
  );
}
