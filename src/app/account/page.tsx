import Link from "next/link";
import AccountProfileForm from "@/components/AccountProfileForm";
import { createClient } from "@/lib/supabaseServerClient";

export const revalidate = 0;
export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="emma-chat-bg min-h-screen w-full px-6 pb-16 pt-16 text-white">
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center text-center gap-4">
          <h1 className="text-3xl font-semibold">Accedi per gestire il profilo</h1>
          <p className="text-sm text-white/70">
            Per modificare i dati del profilo entra con il tuo account.
          </p>
          <Link
            href="/"
            className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Vai al login
          </Link>
        </div>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const initialProfile = {
    name: profile?.name ?? null,
    age: profile?.age ?? null,
    gender: profile?.gender ?? null,
    personal_goal: profile?.personal_goal ?? null,
    language_preference: profile?.language_preference ?? null,
  };

  return (
    <div className="emma-chat-bg min-h-screen w-full px-6 pb-16 pt-16 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-indigo-200/80">Account</p>
            <h1 className="text-3xl font-semibold text-white">Il tuo profilo</h1>
            <p className="text-sm text-white/70">
              Aggiorna i dati che EMMA può usare per personalizzare le risposte.
            </p>
          </div>
          <Link
            href="/emma"
            className="rounded-full border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
          >
            Torna alla chat
          </Link>
        </header>

        <AccountProfileForm initialProfile={initialProfile} email={user.email} />
      </div>
    </div>
  );
}
