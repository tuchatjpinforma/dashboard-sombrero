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

export async function createBlockAction(input: { user_number: string; motivo: string | null }) {
  const supabase = getAdminClient();
  const userNumber = String(input.user_number ?? "").replace(/\D/g, "");
  const whatsappId = userNumber ? `${userNumber}@s.whatsapp.net` : null;

  const { error } = await supabase.from("bloqueados_whatsapp").insert({
    user_number: userNumber || null,
    whatsapp_id: whatsappId,
    user_name: null,
    motivo: input.motivo ?? null,
    mensaje_orig: null,
    fecha: new Date().toISOString(),
  });
  if (error) throw new Error(error.message);
}

export async function retirarBloqueoAction(input: { id: number; user_number: string; limpiarIntentos: boolean }) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("bloqueados_whatsapp").delete().eq("id", input.id);
  if (error) throw new Error(error.message);

  if (input.limpiarIntentos) {
    const userNumber = String(input.user_number ?? "").replace(/\D/g, "");
    if (userNumber) {
      await supabase.from("intentos_bloqueados_whatsapp").delete().eq("user_number", userNumber);
    }
  }
}
