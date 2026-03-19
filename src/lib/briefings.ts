// lib/briefings.ts
import { supabase } from "@/lib/clients/supabaseClient";

type Briefing = {
  id: string;
  project_id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
};

// Briefing aanmaken
export async function createBriefing(projectId: string, content: string) {
  const { data, error } = await supabase
    .from("project_briefings")
    .insert([{ project_id: projectId, content }])
    .select()
    .single();

  if (error) {
    console.error("❌ Fout bij createBriefing:", error.message);
    return null;
  }

  return data as Briefing;
}

// Briefings ophalen bij een project
export async function getBriefings(projectId: string) {
  const { data, error } = await supabase
    .from("project_briefings")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Fout bij getBriefings:", error.message);
    return [];
  }

  return data as Briefing[];
}

// Briefing goedkeuren
export async function approveBriefing(briefingId: string) {
  const { data, error } = await supabase
    .from("project_briefings")
    .update({ is_approved: true })
    .eq("id", briefingId)
    .select()
    .single();

  if (error) {
    console.error("❌ Fout bij approveBriefing:", error.message);
    return null;
  }

  return data as Briefing;
}
