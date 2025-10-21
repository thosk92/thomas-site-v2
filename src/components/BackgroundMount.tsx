"use client";
import { useSearchParams } from "next/navigation";
import Nebula from "@/components/Nebula";
import Starfield from "@/components/backgrounds/Starfield";

export default function BackgroundMount() {
  const params = useSearchParams();
  const bg = (params.get("bg") || "nebula").toLowerCase();
  if (bg === "stars") return <Starfield />;
  return <Nebula />;
}
