"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { LANG_OPTIONS, isSupportedLang } from "@/lib/languageDetection";

type Profile = {
  name: string | null;
  age: number | null;
  gender: string | null;
  personal_goal: string | null;
  language_preference: string | null;
};

type FormCopy = {
  profileLabel: string;
  manageTitle: string;
  manageSubtitle: string;
  nameLabel: string;
  ageLabel: string;
  genderLabel: string;
  languageLabel: string;
  languageAuto: string;
  personalGoalLabel: string;
  personalGoalPlaceholder: string;
  namePlaceholder: string;
  agePlaceholder: string;
  genderOptions: { value: string; label: string }[];
  reset: string;
  save: string;
  signOut: string;
  success: string;
  errorGeneric: string;
  emailPrefix: string;
  dataNote: string;
};

type Props = {
  initialProfile: Profile;
  email?: string | null;
  copy: FormCopy;
};

export default function AccountProfileForm({ initialProfile, email, copy }: Props) {
  const [baseline, setBaseline] = useState<Profile>(initialProfile);
  const [form, setForm] = useState<Profile>(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const langOptions = useMemo(
    () => LANG_OPTIONS.map((opt) => ({ value: opt.code, label: opt.label })),
    [],
  );

  const updateField = (key: keyof Profile, value: string) => {
    setForm((prev) => {
      if (value === "") {
        return { ...prev, [key]: null };
      }
      if (key === "age") {
        const parsed = Number(value);
        return { ...prev, [key]: Number.isNaN(parsed) ? null : parsed };
      }
      return { ...prev, [key]: value };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;

      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const { error: err } = await res.json().catch(() => ({ error: copy.errorGeneric }));
        throw new Error(err || copy.errorGeneric);
      }

      const data = await res.json();
      setForm(data.profile);
      setBaseline(data.profile);
      setMessage(copy.success);

      // Aggiorna subito lo user metadata lato client e salva la lingua in locale
      try {
        await supabase.auth.updateUser({
          data: {
            lang: data.profile?.language_preference,
            name: data.profile?.name,
            age: data.profile?.age,
            gender: data.profile?.gender,
            personal_goal: data.profile?.personal_goal,
          },
        });
      } catch {
        // ignore
      }

      if (typeof window !== "undefined" && isSupportedLang(data.profile?.language_preference)) {
        window.localStorage.setItem("emma:lang", data.profile.language_preference);
        window.dispatchEvent(
          new CustomEvent("emma:lang-change", {
            detail: { lang: data.profile.language_preference },
          }),
        );
      }
    } catch (err: any) {
      setError(err?.message ?? copy.errorGeneric);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSaving(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData.session?.access_token;
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      }).catch(() => {});
    } catch {
      // ignore
    }
    await supabase.auth.signOut();
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("emma:lang");
    }
    window.location.href = "/";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200/80">
          {copy.profileLabel}
        </p>
        <h2 className="text-xl font-semibold text-white">{copy.manageTitle}</h2>
        <p className="text-sm text-white/70">{copy.manageSubtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-white/80">
          {copy.nameLabel}
          <input
            type="text"
            value={form.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-300/60 focus:outline-none"
            placeholder={copy.namePlaceholder}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          {copy.ageLabel}
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={form.age ?? ""}
            onChange={(e) => updateField("age", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-300/60 focus:outline-none"
            placeholder={copy.agePlaceholder}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          {copy.genderLabel}
          <select
            value={form.gender ?? ""}
            onChange={(e) => updateField("gender", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-indigo-300/60 focus:outline-none"
          >
            {copy.genderOptions.map((opt) => (
              <option key={opt.value || "empty"} value={opt.value} className="text-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          {copy.languageLabel}
          <select
            value={form.language_preference ?? ""}
            onChange={(e) => updateField("language_preference", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-indigo-300/60 focus:outline-none"
          >
            <option value="">{copy.languageAuto}</option>
            {langOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-white/80">
        {copy.personalGoalLabel}
        <textarea
          rows={3}
          value={form.personal_goal ?? ""}
          onChange={(e) => updateField("personal_goal", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-300/60 focus:outline-none"
          placeholder={copy.personalGoalPlaceholder}
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-xs text-white/60">
          {email && (
            <p>
              {copy.emailPrefix} <span className="text-white/80">{email}</span>
            </p>
          )}
          <p>{copy.dataNote}</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setForm(baseline)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
            disabled={saving}
          >
            {copy.reset}
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? copy.save : copy.save}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
            disabled={saving}
          >
            {copy.signOut}
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-emerald-200">{message}</p>}
      {error && <p className="text-sm text-red-200">{error}</p>}
    </form>
  );
}
