import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";
import type { Database } from "@/types/supabase";

// Supabase init
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// OpenAI init
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-4";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;

  // ✅ 1. Haal de goedgekeurde debrief + AI flags op
  const { data: debriefData, error: debriefError } = await supabase
    .from("project_debriefs")
    .select(
      "content, needs_copy, needs_visuals, needs_concept, needs_strategy, concept_types"
    )
    .eq("project_id", projectId)
    .eq("status", "goedgekeurd")
    .single();

  if (debriefError || !debriefData?.content) {
    console.error(
      "❌ Geen goedgekeurde debrief gevonden:",
      debriefError?.message
    );
    return NextResponse.json(
      { error: "Geen goedgekeurde debrief gevonden." },
      { status: 400 }
    );
  }

  // ✅ 2. Vraag Claire om een creatieve briefing
  const prompt = `Je bent Claire, een ervaren accountmanager. Maak een heldere en inspirerende creatieve briefing op basis van onderstaande projectdebrief. Richt je op wat het creatieve team nodig heeft om ideeën te ontwikkelen. Gebruik duidelijke taal en schrijf het in Markdown-indeling.`;

  let creativeBrief = "";

  try {
    const completion = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: debriefData.content },
      ],
    });

    creativeBrief = completion.choices?.[0]?.message?.content ?? "";

    if (!creativeBrief || creativeBrief.length < 20) {
      return NextResponse.json(
        { error: "De creatieve briefing is te kort of leeg." },
        { status: 500 }
      );
    }

    // ✅ 3. Sla de briefing op
    const { error: insertError } = await supabase
      .from("project_creative_briefs")
      .insert({
        project_id: projectId,
        content: creativeBrief,
      });

    if (insertError) {
      console.error(
        "❌ Opslaan creatieve briefing mislukt:",
        insertError.message
      );
      return NextResponse.json(
        { error: "Opslaan creatieve briefing mislukt." },
        { status: 500 }
      );
    }
  } catch (err: any) {
    console.error("❌ OpenAI fout bij genereren:", err.message);
    return NextResponse.json(
      { error: "Genereren creatieve briefing mislukt." },
      { status: 500 }
    );
  }

  // ✅ 4. Analyseer de creatieve briefing om needs af te leiden
  try {
    const analysis = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `
Je bent een strategisch AI-assistent. Analyseer de volgende creatieve briefing en bepaal of het creatieve team tekst (copy), beeld (visuals), of beide moet opleveren. Geef je antwoord in JSON als volgt:

{
  "needs_copy": true,
  "needs_visuals": false
}

Baseer je antwoord uitsluitend op de inhoud van de briefing.
          `.trim(),
        },
        {
          role: "user",
          content: creativeBrief,
        },
      ],
    });

    const parsed = JSON.parse(analysis.choices?.[0]?.message?.content ?? "{}");

    if (
      parsed &&
      (parsed.needs_copy !== undefined || parsed.needs_visuals !== undefined)
    ) {
      await supabase
        .from("projects")
        .update({
          needs_copy: parsed.needs_copy ?? false,
          needs_visuals: parsed.needs_visuals ?? false,
        })
        .eq("id", projectId);
    }
  } catch (err: any) {
    console.warn("⚠️ Analyse needs mislukt:", err.message);
  }

  // ✅ 5. Trigger AI-agenten
  const triggers: Promise<any>[] = [];

  if (debriefData.needs_copy) {
    triggers.push(
      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/project/${projectId}/concept/generate`,
        {
          method: "POST",
        }
      )
    );
  }

  if (debriefData.needs_visuals) {
    triggers.push(
      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/project/${projectId}/visuals/generate`,
        {
          method: "POST",
        }
      )
    );
  }

  if (debriefData.needs_concept) {
    triggers.push(
      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/project/${projectId}/concepts/strategy`,
        {
          method: "POST",
        }
      )
    );
  }

  if (debriefData.needs_strategy) {
    triggers.push(
      fetch(
        `${process.env.NEXT_PUBLIC_SITE_URL}/api/project/${projectId}/strategy/generate`,
        {
          method: "POST",
        }
      )
    );
  }

  try {
    await Promise.allSettled(triggers);
  } catch {
    console.warn("⚠️ Sommige AI-triggers zijn mogelijk mislukt");
  }

  return NextResponse.json({ success: true });
}
