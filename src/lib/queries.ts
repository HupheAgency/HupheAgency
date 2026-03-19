// src/lib/queries.ts
import { supabase } from "@/lib/clients/supabaseBrowserClient";
import type { Database } from "@/types/supabase";

export async function fetchProjects(email: string) {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("owner", email);

  if (error) {
    console.error("❌ Supabase error:", error.message);
    return [];
  }

  return data || [];
}
