"use server";

import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { revalidateTag } from "next/cache";

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

export async function createUserAction(input: {
  fullName: string;
  email: string;
  role: "admin" | "user";
  password: string;
  sendEmail: boolean;
}) {
  const supabase = getAdminClient();

  const { data, error } = input.sendEmail
    ? await supabase.auth.admin.inviteUserByEmail(input.email, {
        data: { full_name: input.fullName },
      })
    : await supabase.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: { full_name: input.fullName },
      });

  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("No se pudo crear el usuario");

  if (input.sendEmail) {
    const { error: pwError } = await supabase.auth.admin.updateUserById(data.user.id, {
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    });
    if (pwError) throw new Error(pwError.message);
  }

  const { error: upsertError } = await supabase.from("profiles").upsert({
    id: data.user.id,
    email: input.email,
    full_name: input.fullName,
    role: input.role,
    is_active: true,
  });

  if (upsertError) throw new Error(upsertError.message);

  revalidateTag("users-page-data");
  revalidateTag("topbar-notifications");

  return { id: data.user.id };
}

export async function setUserActiveAction(input: { id: string; is_active: boolean }) {
  const supabase = getAdminClient();
  const { error } = await supabase.from("profiles").update({ is_active: input.is_active }).eq("id", input.id);
  if (error) throw new Error(error.message);
  revalidateTag("users-page-data");
}

export async function deleteUserAction(input: { id: string }) {
  const supabase = getAdminClient();
  const { error: profileError } = await supabase.from("profiles").delete().eq("id", input.id);
  if (profileError) throw new Error(profileError.message);
  const { error } = await supabase.auth.admin.deleteUser(input.id);
  if (error) throw new Error(error.message);
  revalidateTag("users-page-data");
  revalidateTag("topbar-notifications");
}

export async function updateUserAction(input: { id: string; fullName: string; role: "admin" | "user"; is_active: boolean }) {
  const supabase = getAdminClient();

  const { error: updateProfileError } = await supabase
    .from("profiles")
    .update({ full_name: input.fullName, role: input.role, is_active: input.is_active })
    .eq("id", input.id);

  if (updateProfileError) throw new Error(updateProfileError.message);

  const { error: updateAuthError } = await supabase.auth.admin.updateUserById(input.id, {
    user_metadata: { full_name: input.fullName },
  });

  if (updateAuthError) throw new Error(updateAuthError.message);

  revalidateTag("users-page-data");
  revalidateTag("topbar-notifications");
}
