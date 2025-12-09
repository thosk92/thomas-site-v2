import { supabase } from "@/lib/supabaseClient";

export async function createConversation(userId: string, title?: string | null) {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title: title ?? null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getConversations(userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function deleteConversation(conversationId: string) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("id", conversationId);

  if (error) throw error;
}

export async function deleteAllConversations(userId: string) {
  const { error } = await supabase
    .from("conversations")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
}
