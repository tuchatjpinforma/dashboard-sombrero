"use server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function getWhatsAppHistoryAction(input: { sessionId: string }) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("n8n_chatwhatsapp_histories")
    .select("id,message,created_at")
    .eq("session_id", input.sessionId)
    .order("created_at", { ascending: true })
    .limit(400);

  if (error) throw new Error(error.message);
  return (data as any) ?? [];
}
