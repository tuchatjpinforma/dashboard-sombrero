"use server";

import { getSupabaseServerClient } from "@/lib/supabase-server";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function getMyProfileAction() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.id) return null;

  const admin = getSupabaseAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .select("id,email,full_name,role,is_active,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as any) ?? null;
}

