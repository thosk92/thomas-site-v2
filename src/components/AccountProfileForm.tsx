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

type Props = {
  initialProfile: Profile;
  email?: string | null;
};

export default function AccountProfileForm({ initialProfile, email }: Props) {
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
        const { error: err } = await res.json().catch(() => ({ error: "Errore sconosciuto" }));
        throw new Error(err || "Errore sconosciuto");
      }

      const data = await res.json();
      setForm(data.profile);
      setBaseline(data.profile);
      setMessage("Profilo aggiornato con successo.");

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
      }
    } catch (err: any) {
      setError(err?.message ?? "Impossibile aggiornare il profilo.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    setSaving(true);
    try {
      await fetch("/api/auth/signout", { method: "POST" }).catch(() => {});
    } catch {
      // ignore
    }
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur"
    >
      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-indigo-200/80">Profilo</p>
        <h2 className="text-xl font-semibold text-white">Gestisci i tuoi dati</h2>
        <p className="text-sm text-white/70">
          Le informazioni qui sotto aiutano EMMA a rispondere in modo più personale. Puoi
          modificarle o lasciarle vuote.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-white/80">
          Nome
          <input
            type="text"
            value={form.name ?? ""}
            onChange={(e) => updateField("name", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-300/60 focus:outline-none"
            placeholder="Come preferisci essere chiamato/a"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          Età
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={form.age ?? ""}
            onChange={(e) => updateField("age", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-300/60 focus:outline-none"
            placeholder="Es. 28"
          />
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          Genere
          <select
            value={form.gender ?? ""}
            onChange={(e) => updateField("gender", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-indigo-300/60 focus:outline-none"
          >
            <option value="">Non specificato</option>
            <option value="female">Femmina</option>
            <option value="male">Maschio</option>
            <option value="non-binary">Non binario</option>
            <option value="prefer-not-to-say">Preferisco non dirlo</option>
            <option value="other">Altro</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm text-white/80">
          Lingua preferita
          <select
            value={form.language_preference ?? ""}
            onChange={(e) => updateField("language_preference", e.target.value)}
            className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:border-indigo-300/60 focus:outline-none"
          >
            <option value="">Auto (lingua del browser)</option>
            {langOptions.map((opt) => (
              <option key={opt.value} value={opt.value} className="text-slate-900">
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-white/80">
        Obiettivo personale
        <textarea
          rows={3}
          value={form.personal_goal ?? ""}
          onChange={(e) => updateField("personal_goal", e.target.value)}
          className="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-indigo-300/60 focus:outline-none"
          placeholder="Es. gestire l’ansia sul lavoro, comunicare meglio con qualcuno, ecc."
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1 text-xs text-white/60">
          {email && <p>Email: <span className="text-white/80">{email}</span></p>}
          <p>I dati sono usati solo per personalizzare le risposte di EMMA.</p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => setForm(baseline)}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
            disabled={saving}
          >
            Reimposta
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-900/40 transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Salvataggio..." : "Salva modifiche"}
          </button>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
            disabled={saving}
          >
            Esci
          </button>
        </div>
      </div>

      {message && <p className="text-sm text-emerald-200">{message}</p>}
      {error && <p className="text-sm text-red-200">{error}</p>}
    </form>
  );
}
