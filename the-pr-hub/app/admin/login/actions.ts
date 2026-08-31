"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function signIn(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const nextRaw = String(formData.get("next") || "/admin");
  const next = nextRaw.startsWith("/admin") ? nextRaw : "/admin";

  if (!email || !password) {
    return { error: "Enter your email and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Invalid email or password." };
  }

  redirect(next);
}
