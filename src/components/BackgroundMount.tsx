"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import Nebula from "@/components/Nebula";
import GradientNoise from "@/components/backgrounds/GradientNoise";

export default function BackgroundMount() {
  const params = useSearchParams();
  const router = useRouter();
  const bg = useMemo(() => (params.get("bg") || "nebula").toLowerCase(), [params]);

  const setBg = (next: "nebula" | "gradient") => {
    const url = new URL(window.location.href);
    if (next === "nebula") url.searchParams.delete("bg");
    else url.searchParams.set("bg", next);
    const href = (url.pathname + (url.search ? url.search : "") + url.hash) as unknown as Route;
    router.replace(href, { scroll: false });
  };

  return (
    <>
      {bg === "gradient" ? <GradientNoise /> : <Nebula />}
      <div style={{ position: "fixed", right: 12, bottom: 12, zIndex: 30 }}>
        <div
          className="inline-flex overflow-hidden rounded-full border backdrop-blur shadow-sm text-xs"
          style={{
            background: "color-mix(in oklab, var(--background) 80%, transparent)",
            borderColor: "color-mix(in oklab, var(--foreground) 20%, transparent)",
          }}
        >
          <button
            onClick={() => setBg("nebula")}
            className={`px-3 py-1.5 transition ${bg !== "gradient" ? "" : ""}`}
            style={bg !== "gradient" ? { background: "color-mix(in oklab, var(--foreground) 10%, transparent)" } : undefined}
            aria-pressed={bg !== "gradient"}
          >Nebula</button>
          <button
            onClick={() => setBg("gradient")}
            className={`px-3 py-1.5 transition ${bg === "gradient" ? "" : ""}`}
            style={bg === "gradient" ? { background: "color-mix(in oklab, var(--foreground) 10%, transparent)" } : undefined}
            aria-pressed={bg === "gradient"}
          >Gradient</button>
        </div>
      </div>
    </>
  );
}
