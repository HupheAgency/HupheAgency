// app/api/project/[id]/reviewone/route.ts

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  // ✅ 1. Haal het meest recente concept op uit project_files (fase = 'concept')
  const { data: conceptFile, error: conceptError } = await supabase
    .from("project_files")
    .select("content")
    .eq("project_id", projectId)
    .eq("phase", "concept")
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (conceptError || !conceptFile?.content) {
    console.error("❌ Geen concept gevonden:", conceptError?.message);
    return NextResponse.json(
      { error: "Geen concept beschikbaar voor review." },
      { status: 404 }
    );
  }

  // ✅ 2. Roep Noor aan om er een presentatie van te maken
  const gptResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/gpt`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "Noor",
        messages: [
          {
            role: "user",
            content: `Zet de onderstaande creatieve voorstellen om in een heldere en overzichtelijke visuele presentatie in Markdown, geschikt om te tonen aan een klant. Gebruik duidelijke titels, tussenkopjes, visuele structuur en sluit af met een kort advies of instructie:\n\n${conceptFile.content}`,
          },
        ],
      }),
    }
  );

  const { response } = await gptResponse.json();

  if (!response || response.length < 10) {
    return NextResponse.json(
      { error: "Noor gaf geen geldige presentatie terug." },
      { status: 500 }
    );
  }

  // ✅ 3. Sla het resultaat op in project_files (fase = 'review_1', type = 'presentation')
  const { error: saveError } = await supabase.from("project_files").insert({
    project_id: projectId,
    title: "Eerste visuele presentatie",
    type: "presentation",
    phase: "review_1",
    content: response,
  });

  if (saveError) {
    console.error("❌ Opslaan review mislukt:", saveError.message);
    return NextResponse.json(
      { error: "Opslaan review mislukt." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
