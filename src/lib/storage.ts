"use client";

import { ExerciseSession, MoodEntry, ThoughtEntry } from "./types";

const KEYS = {
  moods: "emma_moods",
  thoughts: "emma_thoughts",
  sessions: "emma_sessions",
};

function safeParse<T>(raw: string | null, fallback: T): T {
  try {
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  const raw = localStorage.getItem(key);
  return safeParse<T>(raw, fallback);
}

function setItem<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function getMoodEntries(): MoodEntry[] {
  return getItem<MoodEntry[]>(KEYS.moods, []);
}

export function addMoodEntry(entry: MoodEntry) {
  const all = getMoodEntries();
  const next = [entry, ...all].sort((a, b) => b.date.localeCompare(a.date));
  setItem(KEYS.moods, next);
  return next;
}

export function getThoughtEntries(): ThoughtEntry[] {
  return getItem<ThoughtEntry[]>(KEYS.thoughts, []);
}

export function addThoughtEntry(entry: ThoughtEntry) {
  const all = getThoughtEntries();
  const next = [entry, ...all].sort((a, b) => b.date.localeCompare(a.date));
  setItem(KEYS.thoughts, next);
  return next;
}

export function updateThoughtEntry(id: string, patch: Partial<ThoughtEntry>) {
  const all = getThoughtEntries();
  const next = all.map((t) => (t.id === id ? { ...t, ...patch } : t));
  setItem(KEYS.thoughts, next);
  return next;
}

export function getExerciseSessions(): ExerciseSession[] {
  return getItem<ExerciseSession[]>(KEYS.sessions, []);
}

export function addExerciseSession(entry: ExerciseSession) {
  const all = getExerciseSessions();
  const next = [entry, ...all].sort((a, b) => b.date.localeCompare(a.date));
  setItem(KEYS.sessions, next);
  return next;
}
