// src/app/api/project/route.ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseServerClient } from "@/lib/clients/supabaseServerClient";

export async function POST(req: NextRequest) {
  const supabase = supabaseServerClient(); // ✅ GEEN param doorgeven
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json();
  const { title, status = "Actief" } = body;

  const { data, error } = await supabase
    .from("projects")
    .insert([{ title, status, user_id: user.id }])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
