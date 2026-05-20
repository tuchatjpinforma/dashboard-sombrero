import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { Database } from "@/types/database.types";
import { getSupabaseAdminClient } from "@/lib/supabase-admin";

export async function getUser() {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser();
  if (!user?.id) return null;

  const admin = getSupabaseAdminClient();
  const { data } = await admin
    .from("profiles")
    .select("id,email,full_name,role,is_active,created_at")
    .eq("id", user.id)
    .maybeSingle();

  return (data as any) ?? null;
}
