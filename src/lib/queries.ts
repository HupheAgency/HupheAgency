import { supabase } from "@/lib/supabaseClient";

export async function insertProject({
  title,
  status = "Actief",
}: {
  title: string;
  status?: "Actief" | "Afgerond";
}) {
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

// ✅ Deze functie moet apart staan
export async function fetchProjects() {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("Auth error:", authError?.message || "No user found");
    return [];
  }

  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fetch error:", error.message);
    return [];
  }

  return data;
}
