// lib/messages.ts

import { supabase } from "@/lib/clients/supabaseClient";

// Bericht opslaan
export async function saveMessage(
  projectId: string,
  role: string,
  content: string
) {
  console.log("📤 saveMessage aangeroepen met:");
  console.log("   📁 project_id:", projectId);
  console.log("   🧑‍💼 role:", role);
  console.log("   ✏️ content (eerste 100 tekens):", content.slice(0, 100));

  const { error } = await supabase.from("project_messages").insert([
    {
      project_id: projectId,
      role,
      content,
    },
  ]);

  if (error) {
    console.error("❌ Fout bij opslaan bericht:", error.message);
    throw error;
  } else {
    console.log("✅ Bericht succesvol opgeslagen in Supabase");
  }
}

// Berichten ophalen per project
export async function getMessages(projectId: string) {
  console.log("📥 getMessages aangeroepen voor project:", projectId);

  const { data, error } = await supabase
    .from("project_messages")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("❌ Fout bij ophalen berichten:", error.message);
    throw error;
  }

  console.log(`📚 ${data?.length ?? 0} berichten opgehaald`);
  return data || [];
}
