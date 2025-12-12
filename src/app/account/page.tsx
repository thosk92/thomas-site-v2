"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { User } from "@supabase/supabase-js";
import AccountProfileForm from "@/components/AccountProfileForm";
import { supabase } from "@/lib/supabaseClient";
import {
  isSupportedLang,
  mapLocaleToLang,
  type Lang,
} from "@/lib/languageDetection";

type Profile = {
  name: string | null;
  age: number | null;
  gender: string | null;
  personal_goal: string | null;
  language_preference: string | null;
};

type AccountCopy = {
  sectionLabel: string;
  title: string;
  subtitle: string;
  backToChat: string;
  loading: string;
  guestTitle: string;
  guestSubtitle: string;
  gotoLogin: string;
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

const ACCOUNT_COPY: { default: AccountCopy } & Partial<Record<Lang, AccountCopy>> = {
  default: {
    sectionLabel: "Account",
    title: "Your profile",
    subtitle: "Update the data EMMA can use to personalize replies.",
    backToChat: "Back to chat",
    loading: "Loading…",
    guestTitle: "Sign in to manage your profile",
    guestSubtitle: "To edit profile data, sign in with your account.",
    gotoLogin: "Go to login",
  },
  it: {
    sectionLabel: "Account",
    title: "Il tuo profilo",
    subtitle: "Aggiorna i dati che EMMA può usare per personalizzare le risposte.",
    backToChat: "Torna alla chat",
    loading: "Caricamento…",
    guestTitle: "Accedi per gestire il profilo",
    guestSubtitle: "Per modificare i dati del profilo entra con il tuo account.",
    gotoLogin: "Vai al login",
  },
  es: {
    sectionLabel: "Cuenta",
    title: "Tu perfil",
    subtitle: "Actualiza los datos que EMMA puede usar para personalizar las respuestas.",
    backToChat: "Volver al chat",
    loading: "Cargando…",
    guestTitle: "Inicia sesión para gestionar el perfil",
    guestSubtitle: "Para editar los datos de tu perfil, inicia sesión.",
    gotoLogin: "Ir al login",
  },
  fr: {
    sectionLabel: "Compte",
    title: "Ton profil",
    subtitle: "Mets à jour les données qu’EMMA peut utiliser pour personnaliser les réponses.",
    backToChat: "Retour au chat",
    loading: "Chargement…",
    guestTitle: "Connecte-toi pour gérer ton profil",
    guestSubtitle: "Pour modifier ton profil, connecte-toi.",
    gotoLogin: "Aller au login",
  },
  de: {
    sectionLabel: "Konto",
    title: "Dein Profil",
    subtitle: "Aktualisiere die Daten, die EMMA zur Personalisierung nutzt.",
    backToChat: "Zurück zum Chat",
    loading: "Lädt…",
    guestTitle: "Melde dich an, um dein Profil zu verwalten",
    guestSubtitle: "Zum Bearbeiten des Profils melde dich an.",
    gotoLogin: "Zum Login",
  },
  "pt-PT": {
    sectionLabel: "Conta",
    title: "O teu perfil",
    subtitle: "Atualiza os dados que a EMMA pode usar para personalizar respostas.",
    backToChat: "Voltar ao chat",
    loading: "A carregar…",
    guestTitle: "Inicia sessão para gerir o perfil",
    guestSubtitle: "Para editar o perfil, inicia sessão.",
    gotoLogin: "Ir para login",
  },
  "pt-BR": {
    sectionLabel: "Conta",
    title: "Seu perfil",
    subtitle: "Atualize os dados que a EMMA pode usar para personalizar as respostas.",
    backToChat: "Voltar para o chat",
    loading: "Carregando…",
    guestTitle: "Faça login para gerenciar o perfil",
    guestSubtitle: "Para editar o perfil, faça login.",
    gotoLogin: "Ir para login",
  },
};

const FORM_COPY: { default: FormCopy } & Partial<Record<Lang, FormCopy>> = {
  default: {
    profileLabel: "Profile",
    manageTitle: "Manage your data",
    manageSubtitle: "These details help EMMA personalize responses. You can edit or leave them blank.",
    nameLabel: "Name",
    ageLabel: "Age",
    genderLabel: "Gender",
    languageLabel: "Preferred language",
    languageAuto: "Auto (browser language)",
    personalGoalLabel: "Personal goal",
    personalGoalPlaceholder: "E.g. manage work anxiety, communicate better with someone, etc.",
    namePlaceholder: "How you’d like to be called",
    agePlaceholder: "e.g. 28",
    genderOptions: [
      { value: "", label: "Not specified" },
      { value: "female", label: "Female" },
      { value: "male", label: "Male" },
      { value: "non-binary", label: "Non-binary" },
      { value: "prefer-not-to-say", label: "Prefer not to say" },
      { value: "other", label: "Other" },
    ],
    reset: "Reset",
    save: "Save changes",
    signOut: "Sign out",
    success: "Profile updated successfully.",
    errorGeneric: "Unable to update the profile.",
    emailPrefix: "Email:",
    dataNote: "Data is only used to personalize EMMA’s responses.",
  },
  it: {
    profileLabel: "Profilo",
    manageTitle: "Gestisci i tuoi dati",
    manageSubtitle:
      "Le informazioni qui sotto aiutano EMMA a rispondere in modo più personale. Puoi modificarle o lasciarle vuote.",
    nameLabel: "Nome",
    ageLabel: "Età",
    genderLabel: "Genere",
    languageLabel: "Lingua preferita",
    languageAuto: "Auto (lingua del browser)",
    personalGoalLabel: "Obiettivo personale",
    personalGoalPlaceholder: "Es. gestire l’ansia sul lavoro, comunicare meglio con qualcuno, ecc.",
    namePlaceholder: "Come preferisci essere chiamato/a",
    agePlaceholder: "Es. 28",
    genderOptions: [
      { value: "", label: "Non specificato" },
      { value: "female", label: "Femmina" },
      { value: "male", label: "Maschio" },
      { value: "non-binary", label: "Non binario" },
      { value: "prefer-not-to-say", label: "Preferisco non dirlo" },
      { value: "other", label: "Altro" },
    ],
    reset: "Reimposta",
    save: "Salva modifiche",
    signOut: "Esci",
    success: "Profilo aggiornato con successo.",
    errorGeneric: "Impossibile aggiornare il profilo.",
    emailPrefix: "Email:",
    dataNote: "I dati sono usati solo per personalizzare le risposte di EMMA.",
  },
  es: {
    profileLabel: "Perfil",
    manageTitle: "Gestiona tus datos",
    manageSubtitle:
      "Estos datos ayudan a EMMA a personalizar las respuestas. Puedes editarlos o dejarlos vacíos.",
    nameLabel: "Nombre",
    ageLabel: "Edad",
    genderLabel: "Género",
    languageLabel: "Idioma preferido",
    languageAuto: "Auto (idioma del navegador)",
    personalGoalLabel: "Objetivo personal",
    personalGoalPlaceholder: "Ej. manejar la ansiedad en el trabajo, comunicar mejor con alguien, etc.",
    namePlaceholder: "Cómo quieres que te llamen",
    agePlaceholder: "Ej. 28",
    genderOptions: [
      { value: "", label: "No especificado" },
      { value: "female", label: "Femenino" },
      { value: "male", label: "Masculino" },
      { value: "non-binary", label: "No binario" },
      { value: "prefer-not-to-say", label: "Prefiero no decirlo" },
      { value: "other", label: "Otro" },
    ],
    reset: "Restablecer",
    save: "Guardar cambios",
    signOut: "Salir",
    success: "Perfil actualizado correctamente.",
    errorGeneric: "No se pudo actualizar el perfil.",
    emailPrefix: "Email:",
    dataNote: "Los datos se usan solo para personalizar las respuestas de EMMA.",
  },
  fr: {
    profileLabel: "Profil",
    manageTitle: "Gère tes données",
    manageSubtitle:
      "Ces infos aident EMMA à personnaliser les réponses. Tu peux les modifier ou les laisser vides.",
    nameLabel: "Nom",
    ageLabel: "Âge",
    genderLabel: "Genre",
    languageLabel: "Langue préférée",
    languageAuto: "Auto (langue du navigateur)",
    personalGoalLabel: "Objectif personnel",
    personalGoalPlaceholder: "Ex. gérer l’anxiété au travail, mieux communiquer avec quelqu’un, etc.",
    namePlaceholder: "Comment tu veux être appelé·e",
    agePlaceholder: "Ex. 28",
    genderOptions: [
      { value: "", label: "Non spécifié" },
      { value: "female", label: "Femme" },
      { value: "male", label: "Homme" },
      { value: "non-binary", label: "Non binaire" },
      { value: "prefer-not-to-say", label: "Préfère ne pas le dire" },
      { value: "other", label: "Autre" },
    ],
    reset: "Réinitialiser",
    save: "Enregistrer",
    signOut: "Déconnexion",
    success: "Profil mis à jour avec succès.",
    errorGeneric: "Impossible de mettre à jour le profil.",
    emailPrefix: "Email :",
    dataNote: "Les données servent uniquement à personnaliser les réponses d’EMMA.",
  },
  de: {
    profileLabel: "Profil",
    manageTitle: "Verwalte deine Daten",
    manageSubtitle:
      "Diese Infos helfen EMMA, Antworten zu personalisieren. Du kannst sie anpassen oder freilassen.",
    nameLabel: "Name",
    ageLabel: "Alter",
    genderLabel: "Geschlecht",
    languageLabel: "Bevorzugte Sprache",
    languageAuto: "Auto (Browsersprache)",
    personalGoalLabel: "Persönliches Ziel",
    personalGoalPlaceholder: "Z. B. Arbeitsangst managen, besser mit jemandem kommunizieren usw.",
    namePlaceholder: "Wie du genannt werden möchtest",
    agePlaceholder: "z. B. 28",
    genderOptions: [
      { value: "", label: "Nicht angegeben" },
      { value: "female", label: "Weiblich" },
      { value: "male", label: "Männlich" },
      { value: "non-binary", label: "Nicht-binär" },
      { value: "prefer-not-to-say", label: "Keine Angabe" },
      { value: "other", label: "Sonstiges" },
    ],
    reset: "Zurücksetzen",
    save: "Änderungen speichern",
    signOut: "Abmelden",
    success: "Profil erfolgreich aktualisiert.",
    errorGeneric: "Profil konnte nicht aktualisiert werden.",
    emailPrefix: "E-Mail:",
    dataNote: "Daten werden nur zur Personalisierung der EMMA-Antworten genutzt.",
  },
  "pt-PT": {
    profileLabel: "Perfil",
    manageTitle: "Gere os seus dados",
    manageSubtitle:
      "Estas informações ajudam a EMMA a personalizar as respostas. Pode alterá-las ou deixá-las vazias.",
    nameLabel: "Nome",
    ageLabel: "Idade",
    genderLabel: "Género",
    languageLabel: "Idioma preferido",
    languageAuto: "Auto (idioma do browser)",
    personalGoalLabel: "Objetivo pessoal",
    personalGoalPlaceholder: "Ex.: gerir a ansiedade no trabalho, comunicar melhor com alguém, etc.",
    namePlaceholder: "Como prefere ser chamado",
    agePlaceholder: "Ex.: 28",
    genderOptions: [
      { value: "", label: "Não especificado" },
      { value: "female", label: "Feminino" },
      { value: "male", label: "Masculino" },
      { value: "non-binary", label: "Não binário" },
      { value: "prefer-not-to-say", label: "Prefiro não dizer" },
      { value: "other", label: "Outro" },
    ],
    reset: "Repor",
    save: "Guardar alterações",
    signOut: "Terminar sessão",
    success: "Perfil atualizado com sucesso.",
    errorGeneric: "Não foi possível atualizar o perfil.",
    emailPrefix: "Email:",
    dataNote: "Os dados são usados apenas para personalizar as respostas da EMMA.",
  },
  "pt-BR": {
    profileLabel: "Perfil",
    manageTitle: "Gerencie seus dados",
    manageSubtitle:
      "Essas informações ajudam a EMMA a personalizar as respostas. Você pode editar ou deixar em branco.",
    nameLabel: "Nome",
    ageLabel: "Idade",
    genderLabel: "Gênero",
    languageLabel: "Idioma preferido",
    languageAuto: "Auto (idioma do navegador)",
    personalGoalLabel: "Objetivo pessoal",
    personalGoalPlaceholder:
      "Ex.: controlar a ansiedade no trabalho, me comunicar melhor com alguém, etc.",
    namePlaceholder: "Como prefere ser chamado",
    agePlaceholder: "Ex.: 28",
    genderOptions: [
      { value: "", label: "Não especificado" },
      { value: "female", label: "Feminino" },
      { value: "male", label: "Masculino" },
      { value: "non-binary", label: "Não binário" },
      { value: "prefer-not-to-say", label: "Prefiro não dizer" },
      { value: "other", label: "Outro" },
    ],
    reset: "Redefinir",
    save: "Salvar alterações",
    signOut: "Sair",
    success: "Perfil atualizado com sucesso.",
    errorGeneric: "Não foi possível atualizar o perfil.",
    emailPrefix: "Email:",
    dataNote: "Os dados são usados apenas para personalizar as respostas da EMMA.",
  },
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionSynced, setSessionSynced] = useState(false);
  const [lang, setLang] = useState<Lang>("en-US");

  const accountCopy = useMemo(() => ACCOUNT_COPY[lang] ?? ACCOUNT_COPY.default, [lang]);
  const formCopy = useMemo(() => FORM_COPY[lang] ?? FORM_COPY.default, [lang]);

  useEffect(() => {
    let active = true;
    const syncSession = async (session: any) => {
      if (!session?.access_token || !session?.refresh_token) return;
      try {
        await fetch("/api/auth/set-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }),
        });
      } catch (err) {
        console.error("[account] failed to sync session", err);
      }
    };

    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

       // Imposta lingua da localStorage -> metadata -> browser
      if (typeof window !== "undefined") {
        const stored = window.localStorage.getItem("emma:lang");
        if (isSupportedLang(stored)) {
          setLang(stored);
        } else if (sessionUser?.user_metadata?.lang && isSupportedLang(sessionUser.user_metadata.lang)) {
          setLang(sessionUser.user_metadata.lang);
        } else {
          setLang(mapLocaleToLang(navigator.language || navigator.languages?.[0]));
        }
      } else if (sessionUser?.user_metadata?.lang && isSupportedLang(sessionUser.user_metadata.lang)) {
        setLang(sessionUser.user_metadata.lang);
      }

      if (!sessionUser) {
        setLoading(false);
        return;
      }

      // Ensure server-side session cookies are set for API routes (needed for profile update)
      if (!sessionSynced && data.session) {
        await syncSession(data.session);
        if (!active) return;
        setSessionSynced(true);
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", sessionUser.id)
        .maybeSingle();

      if (active) {
        setProfile({
          name: profileData?.name ?? (sessionUser.user_metadata?.name as string | null) ?? null,
          age: profileData?.age ?? (sessionUser.user_metadata?.age as number | null) ?? null,
          gender: profileData?.gender ?? (sessionUser.user_metadata?.gender as string | null) ?? null,
          personal_goal:
            profileData?.personal_goal ??
            (sessionUser.user_metadata?.personal_goal as string | null) ??
            null,
          language_preference:
            profileData?.language_preference ??
            (sessionUser.user_metadata?.lang as string | null) ??
            null,
        });
        setLoading(false);
      }
    })();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      setUser(session?.user ?? null);
      if (session?.user?.user_metadata?.lang && isSupportedLang(session.user.user_metadata.lang)) {
        setLang(session.user.user_metadata.lang);
      }
      if (session) {
        await syncSession(session);
        if (!active) return;
        setSessionSynced(true);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, [sessionSynced]);

  useEffect(() => {
    const onLangChange = (event: Event) => {
      const detail = (event as CustomEvent<{ lang?: Lang }>).detail;
      if (detail?.lang && isSupportedLang(detail.lang)) {
        setLang(detail.lang);
      }
    };
    window.addEventListener("emma:lang-change", onLangChange);
    return () => window.removeEventListener("emma:lang-change", onLangChange);
  }, []);

  const initialProfile: Profile = profile ?? {
    name: null,
    age: null,
    gender: null,
    personal_goal: null,
    language_preference: null,
  };

  return (
    <div className="emma-chat-bg min-h-screen w-full px-6 pb-16 pt-16 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-200/80">
              {accountCopy.sectionLabel}
            </p>
            <h1 className="text-3xl font-semibold text-white">{accountCopy.title}</h1>
            <p className="text-sm text-white/70">{accountCopy.subtitle}</p>
          </div>
          <Link
            href="/chat"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white transition hover:bg-white/10"
          >
            {accountCopy.backToChat}
          </Link>
        </header>

        {loading ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-white/80 backdrop-blur">
            {accountCopy.loading}
          </div>
        ) : user ? (
          <AccountProfileForm initialProfile={initialProfile} email={user.email} copy={formCopy} />
        ) : (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-white/80 backdrop-blur">
            <h2 className="text-xl font-semibold text-white">{accountCopy.guestTitle}</h2>
            <p className="mt-2 text-sm text-white/70">{accountCopy.guestSubtitle}</p>
            <Link
              href="/"
              className="mt-4 inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              {accountCopy.gotoLogin}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
