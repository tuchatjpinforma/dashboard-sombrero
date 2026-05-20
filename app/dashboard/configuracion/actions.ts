"use server";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Faltan variables NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function deleteAccountAction(input: { id: string }) {
  const supabase = getAdminClient();
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", input.id);
  if (profileError) throw new Error(profileError.message);
  const { error } = await supabase.auth.admin.deleteUser(input.id);
  if (error) throw new Error(error.message);
}

