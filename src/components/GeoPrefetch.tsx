"use client";
import { useEffect } from "react";

// Requests geolocation once on site load to cache coordinates for Solar mode.
// Non-blocking: times out after 5s. Stores in localStorage as 'theme-solar-lat'/'theme-solar-lng'.
export default function GeoPrefetch() {
  useEffect(() => {
    let done = false;
    const already = (() => {
      try {
        return !!(localStorage.getItem("theme-solar-lat") && localStorage.getItem("theme-solar-lng"));
      } catch {
        return true; // avoid prompting if storage not available
      }
    })();
    if (already) return;

    if ("geolocation" in navigator) {
      const timer = window.setTimeout(() => {
        // give up silently after 5s
        done = true;
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (done) return;
          window.clearTimeout(timer);
          try {
            localStorage.setItem("theme-solar-lat", String(pos.coords.latitude));
            localStorage.setItem("theme-solar-lng", String(pos.coords.longitude));
          } catch {}
          // Trigger theme re-evaluation if user is on Solar
          window.dispatchEvent(new CustomEvent("theme-pref-change", { detail: { pref: "solar" } }));
        },
        () => {
          if (done) return;
          window.clearTimeout(timer);
          // ignore errors; fallbacks handled by TimeTheme
        },
        { maximumAge: 6 * 60 * 60 * 1000, timeout: 5000, enableHighAccuracy: false }
      );
    }

    return () => { done = true; };
  }, []);

  return null;
}
