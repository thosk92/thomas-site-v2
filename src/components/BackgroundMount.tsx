"use client";
import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import Nebula from "@/components/Nebula";
import Starfield from "@/components/backgrounds/Starfield";

export default function BackgroundMount() {
  const params = useSearchParams();
  const router = useRouter();
  const bg = useMemo(() => (params.get("bg") || "nebula").toLowerCase(), [params]);

  const setBg = (next: "nebula" | "stars") => {
    const url = new URL(window.location.href);
    if (next === "nebula") url.searchParams.delete("bg");
    else url.searchParams.set("bg", next);
    const href = (url.pathname + (url.search ? url.search : "") + url.hash) as unknown as Route;
    router.replace(href, { scroll: false });
  };

  return (
    <>
      {bg === "stars" ? <Starfield /> : <Nebula />}
      <div style={{ position: "fixed", right: 12, bottom: 12, zIndex: 30 }}>
        <div className="inline-flex overflow-hidden rounded-full border border-foreground/20 bg-white/80 shadow-sm text-xs">
          <button
            onClick={() => setBg("nebula")}
            className={`px-3 py-1.5 transition ${bg !== "stars" ? "bg-white" : "bg-transparent"}`}
            aria-pressed={bg !== "stars"}
          >Nebula</button>
          <button
            onClick={() => setBg("stars")}
            className={`px-3 py-1.5 transition ${bg === "stars" ? "bg-white" : "bg-transparent"}`}
            aria-pressed={bg === "stars"}
          >Stars</button>
        </div>
      </div>
    </>
  );
}
