import { supabase } from "@/lib/supabaseClient";

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export type ProfileUpdate = {
  name?: string | null;
  age?: number | null;
  gender?: string | null;
  personal_goal?: string | null;
};

export async function updateUserProfile(userId: string, data: ProfileUpdate) {
  const payload = { id: userId, ...data };

  const { data: upserted, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return upserted;
}
