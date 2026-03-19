import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import dennisPrompt from "@/lib/ai-prompts/dennis-debrief-gpt";
import { Database } from "@/types/supabase";

// ✅ Init Supabase en OpenAI
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4";

// 🧠 Genereer en bewaar debrief (POST)
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  try {
    // 📨 Haal alle projectberichten op
    const { data: messages, error } = await supabase
      .from("project_messages")
      .select("role, content")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error || !messages) {
      console.error("❌ Fout bij ophalen berichten:", error?.message);
      return NextResponse.json(
        { error: "Kon geen berichten ophalen." },
        { status: 500 }
      );
    }

    console.log("📨 Aantal berichten gevonden:", messages.length);

    // 💬 Format voor OpenAI
    const formattedMessages = messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // 🤖 Vraag Dennis om een briefing te genereren
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: dennisPrompt },
        ...formattedMessages,
      ],
    });

    const debrief = completion.choices?.[0]?.message?.content ?? "";

    if (!debrief || debrief.length < 20) {
      return NextResponse.json(
        { error: "De gegenereerde debrief is te kort of leeg." },
        { status: 500 }
      );
    }

    console.log("📋 Genereerde debrief:", debrief.slice(0, 200));

    // 💾 Sla de debrief op (vereist UNIQUE op project_id!)
    const { error: upsertError } = await supabase
      .from("project_debriefs")
      .upsert(
        {
          project_id: projectId,
          content: debrief,
          status: "concept",
        },
        { onConflict: "project_id" } // Zorg dat deze kolom UNIQUE is
      );

    if (upsertError) {
      console.error("❌ Fout bij opslaan debrief:", upsertError.message);
      return NextResponse.json(
        { error: "Kon debrief niet opslaan." },
        { status: 500 }
      );
    }

    return NextResponse.json({ debrief });
  } catch (err: any) {
    console.error("❌ Serverfout:", err.message);
    return NextResponse.json({ error: "Interne serverfout." }, { status: 500 });
  }
}

// 📥 Ophalen bestaande debrief (GET)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  try {
    const { data, error } = await supabase
      .from("project_debriefs")
      .select("content")
      .eq("project_id", projectId)
      .single();

    if (error || !data) {
      console.error("❌ Debrief ophalen mislukt:", error?.message);
      return NextResponse.json(
        { error: "Debrief niet gevonden." },
        { status: 404 }
      );
    }

    return NextResponse.json({ debrief: data.content });
  } catch (err: any) {
    console.error("❌ Serverfout:", err.message);
    return NextResponse.json({ error: "Interne serverfout." }, { status: 500 });
  }
}
