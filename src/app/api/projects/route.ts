// src/app/api/projects/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/clients/supabaseRouteClient";

// ✅ POST = Project aanmaken
export async function POST(req: NextRequest) {
  try {
    console.log("📡 [POST] /api/projects aangeroepen");

    const supabase = createSupabaseRouteClient();
    const { title, status = "Actief" } = await req.json();
    console.log("📥 Request body:", { title, status });

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("❌ [POST] Geen geldige sessie:", authError?.message);
      return NextResponse.json(
        { error: authError?.message ?? "Niet ingelogd" },
        { status: 401 }
      );
    }

    const { data, error: insertError } = await supabase
      .from("projects")
      .insert([{ title, status, user_id: user.id }])
      .select()
      .single();

    if (insertError) {
      console.error("❌ [POST] Insert fout:", insertError.message);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    console.log("✅ [POST] Project succesvol aangemaakt:", data);
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error("❌ [POST] Onverwachte fout:", err.message ?? err);
    return NextResponse.json({ error: "Interne serverfout" }, { status: 500 });
  }
}

// ✅ GET = Projecten ophalen
export async function GET() {
  console.log("📡 [GET] /api/projects aangeroepen");

  const supabase = createSupabaseRouteClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    console.warn("⚠️ [GET] Auth error:", authError?.message ?? "No user");
    return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
  }

  console.log("🧠 [GET] Gebruiker:", user.id);

  const { data: projects, error: fetchError } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (fetchError) {
    console.error("❌ [GET] Projecten ophalen mislukt:", fetchError.message);
    return NextResponse.json({ error: fetchError.message }, { status: 500 });
  }

  console.log(`✅ [GET] ${projects.length} projecten opgehaald`);
  return NextResponse.json({ projects });
}
