// app/api/debrief/upsert/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { project_id, content, status = "concept" } = await req.json();

  if (!project_id || !content) {
    return NextResponse.json(
      { error: "project_id en content zijn verplicht." },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("project_debriefs")
      .upsert(
        [
          {
            project_id,
            content,
            status,
          },
        ],
        { onConflict: "project_id" }
      )
      .select();

    if (error) throw error;

    // 🧠 Trigger conceptgeneratie als debrief is goedgekeurd
    if (status === "goedgekeurd") {
      await fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/project/${project_id}/concept/generate`,
        {
          method: "POST",
        }
      );
      console.log("🧠 Conceptgeneratie gestart via upsert.");
    }

    return NextResponse.json({ success: true, debrief: data[0] });
  } catch (err: any) {
    console.error("❌ Fout bij upsert van debrief:", err.message);
    return NextResponse.json(
      { error: "Fout bij opslaan van debrief." },
      { status: 500 }
    );
  }
}
