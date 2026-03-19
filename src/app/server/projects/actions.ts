import { supabaseServerClient } from "@/lib/clients/supabaseServerClient";
import type { Database } from "@/types/supabase";

type ProjectStatus = "Actief" | "Afgerond";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  created_at: string;
  user_id: string;
}

// ✅ Project toevoegen
export async function insertProject({
  title,
  status = "Actief",
}: {
  title: string;
  status?: ProjectStatus;
}): Promise<Project | null> {
  const supabase = supabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(
      "❌ [Projects Actions] insertProject → Auth error:",
      authError?.message ?? "No user"
    );
    return null;
  }

  const { data, error } = await supabase
    .from("projects")
    .insert([{ title, status, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error(
      "❌ [Projects Actions] insertProject → Insert error:",
      error.message
    );
    return null;
  }

  console.log(
    "✅ [Projects Actions] insertProject → Project aangemaakt:",
    data
  );
  return data as Project;
}

// ✅ Projecten ophalen
export async function fetchProjects(): Promise<Project[]> {
  const supabase = supabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error(
      "❌ [Projects Actions] fetchProjects → Auth error:",
      authError?.message ?? "No user"
    );
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "❌ [Projects Actions] fetchProjects → Fetch error:",
      error.message
    );
    return [];
  }

  console.log(
    `✅ [Projects Actions] fetchProjects → ${data.length} projecten opgehaald.`
  );
  return (data ?? []) as Project[];
}
