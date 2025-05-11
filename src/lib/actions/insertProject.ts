// src/lib/actions/insertProject.ts
"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function insertProjectServer(title: string, status = "Actief") {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error:", authError?.message || "No user found");
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([{ title, status, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("Insert error:", error.message);
    return null;
  }

  return data;
}
