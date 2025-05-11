// app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServerClient";

export async function POST(req: NextRequest) {
  console.log("🚀 /api/projects POST route aangeroepen");

  const supabase = createSupabaseServerClient(req); // ✅ CORRECT
  const { title, status = "Actief" } = await req.json();

  console.log("📦 Gegevens uit request body:", { title, status });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.error("❌ Auth fout:", authError?.message);
    return NextResponse.json(
      { error: authError?.message || "Not authenticated" },
      { status: 401 }
    );
  }

  console.log("✅ Ingelogde gebruiker:", user.id);

  const { data, error } = await supabase
    .from("projects")
    .insert([{ title, status, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error("❌ Insert fout:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("✅ Project aangemaakt:", data);

  return NextResponse.json({ data });
}
