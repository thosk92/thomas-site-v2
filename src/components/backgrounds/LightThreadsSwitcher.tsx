"use client";
import { useEffect, useState } from "react";
import LightThreadsIvory from "./LightThreadsIvory";
import LightThreadsDark from "./LightThreadsDark";

export default function LightThreadsSwitcher({ forceTheme }: { forceTheme?: "light" | "dark" }) {
  const [isDark, setIsDark] = useState<boolean>(() => initialIsDark(forceTheme));
  const [motionEnabled, setMotionEnabled] = useState<boolean>(() => getInitialMotion());

  useEffect(() => {
    if (forceTheme) {
      setIsDark(forceTheme === "dark");
      return;
    }
    const onTheme = () => setIsDark(readIsDark());
    window.addEventListener("theme-change", onTheme as EventListener);
    // also check on visibility restore
    const onVis = () => { if (!document.hidden) setIsDark(readIsDark()); };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      window.removeEventListener("theme-change", onTheme as EventListener);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [forceTheme]);

  useEffect(() => {
    const onMotionToggle = () => setMotionEnabled(readMotion());
    window.addEventListener("motion-toggle", onMotionToggle as EventListener);
    return () => window.removeEventListener("motion-toggle", onMotionToggle as EventListener);
  }, []);

  return isDark ? (
    <LightThreadsDark motionEnabled={motionEnabled} />
  ) : (
    <LightThreadsIvory motionEnabled={motionEnabled} />
  );
}

function readIsDark(): boolean {
  const root = document.documentElement;
  // consider time-dark or force-dark as dark
  return root.classList.contains("time-dark") || root.classList.contains("force-dark");
}
function initialIsDark(forceTheme?: "light" | "dark"): boolean {
  if (typeof window === "undefined") return false;
  if (forceTheme) return forceTheme === "dark";
  return readIsDark();
}

function getInitialMotion(): boolean {
  if (typeof window === "undefined") return true;
  const stored = window.localStorage.getItem("motion-enabled");
  if (stored === "false") return false;
  return true;
}
function readMotion(): boolean {
  const stored = window.localStorage.getItem("motion-enabled");
  if (stored === "false") return false;
  return true;
}
