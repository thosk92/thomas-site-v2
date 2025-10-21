"use client";
import { useEffect, useRef } from "react";

// Night window defaults
const NIGHT_START = 19; // 19:00
const NIGHT_END = 7;    // 07:00

function isDarkByTime(d: Date): boolean {
  const h = d.getHours();
  return h >= NIGHT_START || h < NIGHT_END;
}

// Minimal sunrise/sunset approximation (NOAA-based simplified)
function toRadians(d: number) { return (d * Math.PI) / 180; }
function toDegrees(r: number) { return (r * 180) / Math.PI; }
function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  return Math.floor(diff / 86400000);
}
// Returns local times for sunrise/sunset, or nulls on failure
function getSunTimes(date: Date, lat: number, lng: number): { sunrise: Date | null; sunset: Date | null } {
  try {
    const d = dayOfYear(date);
    const lngHour = lng / 15;
    const calc = (isSunrise: boolean) => {
      const t = d + ((isSunrise ? 6 : 18) - lngHour) / 24;
      const M = (0.9856 * t) - 3.289;
      let L = M + (1.916 * Math.sin(toRadians(M))) + (0.020 * Math.sin(toRadians(2 * M))) + 282.634;
      L = ((L + 360) % 360);
      let RA = toDegrees(Math.atan(0.91764 * Math.tan(toRadians(L))));
      RA = ((RA + 360) % 360);
      const Lquadrant = Math.floor(L / 90) * 90;
      const RAquadrant = Math.floor(RA / 90) * 90;
      RA = (RA + (Lquadrant - RAquadrant)) / 15;
      const sinDec = 0.39782 * Math.sin(toRadians(L));
      const cosDec = Math.cos(Math.asin(sinDec));
      const cosH = (Math.cos(toRadians(90.833)) - (sinDec * Math.sin(toRadians(lat)))) / (cosDec * Math.cos(toRadians(lat)));
      if (cosH > 1 || cosH < -1) return null; // no sunrise/sunset
      const H = (isSunrise ? 360 - toDegrees(Math.acos(cosH)) : toDegrees(Math.acos(cosH))) / 15;
      const T = H + RA - (0.06571 * t) - 6.622;
      let UT = (T - lngHour) % 24;
      if (UT < 0) UT += 24;
      const res = new Date(date);
      res.setUTCHours(0, 0, 0, 0);
      res.setUTCMinutes(Math.round(UT * 60));
      return res;
    };
    const sr = calc(true);
    const ss = calc(false);
    return { sunrise: sr, sunset: ss };
  } catch {
    return { sunrise: null, sunset: null };
  }
}

export default function TimeTheme() {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const root = document.documentElement;

    const clearTimers = () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    const notify = () => window.dispatchEvent(new CustomEvent("theme-change"));

    const applyClasses = (mode: "light" | "dark" | "unset") => {
      root.classList.toggle("force-dark", mode === "dark");
      root.classList.toggle("force-light", mode === "light");
      notify();
      // Maintain time-dark separately for time/solar modes for CSS debugging if needed
    };

    const scheduleAt = (when: Date, fn: () => void) => {
      const delay = Math.max(500, when.getTime() - Date.now());
      timeoutRef.current = window.setTimeout(fn, delay);
    };

    const evalSystem = () => window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

    const evalTime = () => isDarkByTime(new Date());

    const parseStoredCoords = (): { lat: number; lng: number } | null => {
      try {
        const latS = window.localStorage.getItem("theme-solar-lat");
        const lngS = window.localStorage.getItem("theme-solar-lng");
        if (!latS || !lngS) return null;
        const lat = parseFloat(latS);
        const lng = parseFloat(lngS);
        if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
      } catch {}
      return null;
    };

    const evalSolar = async (): Promise<{ hasCoords: boolean; isDark: boolean }> => {
      const now = new Date();
      const setDark = (d: boolean) => { root.classList.toggle("time-dark", d); notify(); };
      // Try geolocation first; if fails or denied, fallback to stored coords; if none, fallback to time window
      const getCoords = async (): Promise<{ lat: number; lng: number } | null> => {
        if ("geolocation" in navigator) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              const id = window.setTimeout(() => reject(new Error("geo-timeout")), 5000);
              navigator.geolocation.getCurrentPosition(
                (p) => { window.clearTimeout(id); resolve(p); },
                (err) => { window.clearTimeout(id); reject(err); },
                { maximumAge: 6 * 60 * 60 * 1000, timeout: 5000, enableHighAccuracy: false }
              );
            });
            const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            try {
              window.localStorage.setItem("theme-solar-lat", String(coords.lat));
              window.localStorage.setItem("theme-solar-lng", String(coords.lng));
            } catch {}
            return coords;
          } catch {
            // ignore and try stored
          }
        }
        return parseStoredCoords();
      };

      const coords = await getCoords();
      if (!coords) {
        // No coordinates available: report hasCoords=false and do not schedule here; let caller decide fallback
        return { hasCoords: false, isDark: evalTime() };
      }
      const { sunrise, sunset } = getSunTimes(now, coords.lat, coords.lng);
      if (!sunrise || !sunset) {
        return { hasCoords: false, isDark: evalTime() };
      }
      const isDark = now < sunrise || now >= sunset;
      setDark(isDark);
      // schedule at next boundary
      const nextBoundary = now < sunrise ? sunrise : now < sunset ? sunset : new Date(sunrise.getTime() + 24 * 60 * 60 * 1000);
      scheduleAt(nextBoundary, tick);
      return { hasCoords: true, isDark };
    };

    const tick = async () => {
      clearTimers();
      root.classList.remove("time-dark");
      // 1) Try Solar
      applyClasses("unset");
      try {
        const res = await evalSolar();
        if (res.hasCoords) {
          root.classList.toggle("time-dark", res.isDark);
          notify();
          return;
        }
      } catch {}
      // 2) Fallback to Time
      try {
        const dark = evalTime();
        root.classList.toggle("time-dark", dark);
        notify();
        const now = new Date();
        const h = now.getHours();
        const next = new Date(now);
        next.setSeconds(0); next.setMilliseconds(0); next.setMinutes(0);
        if (dark) {
          if (h < NIGHT_END) next.setHours(NIGHT_END); else { next.setDate(next.getDate() + 1); next.setHours(NIGHT_END); }
        } else {
          if (h < NIGHT_START) next.setHours(NIGHT_START); else { next.setDate(next.getDate() + 1); next.setHours(NIGHT_START); }
        }
        scheduleAt(next, tick);
        return;
      } catch {}
      // 3) Fallback to System
      const sysDark = evalSystem();
      root.classList.toggle("time-dark", sysDark);
      notify();
    };

    // initial
    tick();

    const onVis = () => { if (!document.hidden) tick(); };
    document.addEventListener("visibilitychange", onVis);

    const onSys = () => { tick(); };
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    mql.addEventListener?.("change", onSys);

    // No user preference handling anymore; we only react to visibility/system changes.

    return () => {
      clearTimers();
      document.removeEventListener("visibilitychange", onVis);
      mql.removeEventListener?.("change", onSys);
    };
  }, []);

  return null;
}
