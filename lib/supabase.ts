"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database.types";

type BrowserSupabaseClient = ReturnType<typeof createBrowserClient<Database>>;

let supabaseClient: BrowserSupabaseClient | null = null;

export function resetSupabaseBrowserClient() {
  supabaseClient = null;
}

export function getSupabaseBrowserClient() {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Faltan variables NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  supabaseClient = createBrowserClient<Database>(url, anonKey);

  return supabaseClient;
}
