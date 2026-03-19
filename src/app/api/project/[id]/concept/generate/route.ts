import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";
import lunaPrompt from "@/lib/ai-prompts/luna-copy-gpt";
import carlosPrompt from "@/lib/ai-prompts/carlos-visual-dalle";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  console.log("🚀 [concept/generate] gestart voor project:", projectId);

  // ✅ 1. Haal Dennis' debrief op
  const { data: debriefData, error: debriefError } = await supabase
    .from("project_debriefs")
    .select("content")
    .eq("project_id", projectId)
    .single();

  if (debriefError || !debriefData?.content) {
    console.error("❌ Geen debrief gevonden:", debriefError?.message);
    return NextResponse.json(
      { error: "Geen debrief gevonden." },
      { status: 404 }
    );
  }

  const briefing = debriefData.content;
  console.log("📋 Debrief opgehaald:", briefing);

  // ✅ 2. Analyseer de briefing via Dennis
  const analysisResponse = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/gpt`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role: "Dennis",
        messages: [
          {
            role: "system",
            content: `
Je bent Dennis, een analytische AI van Huphe Agency. Je ontvangt een briefing en bepaalt of het project copy nodig heeft, visuals, of beide.

📦 Geef je antwoord uitsluitend in onderstaande JSON-structuur:

{
  "needs_copy": true,
  "needs_visuals": true
}

⚠️ Geef géén toelichting of uitleg, alleen de JSON.
`.trim(),
          },
          {
            role: "user",
            content: briefing,
          },
        ],
      }),
    }
  );

  const analysis = await analysisResponse.json();

  let parsed;
  try {
    parsed = JSON.parse(analysis.response);
  } catch (err) {
    console.error(
      "❌ JSON.parse faalde op Dennis' antwoord:",
      analysis.response
    );
    return NextResponse.json(
      { error: "Dennis gaf geen valide JSON terug." },
      { status: 500 }
    );
  }

  const { needs_copy, needs_visuals } = parsed;
  console.log("📊 Analyse van Dennis:", parsed);

  // ✅ 3. Update project
  await supabase
    .from("projects")
    .update({
      needs_copy,
      needs_visuals,
    })
    .eq("id", projectId);

  await supabase.from("project_files").insert({
    project_id: projectId,
    title: "Analyse van Dennis",
    content: JSON.stringify(parsed, null, 2),
    type: "json",
    phase: "concept",
  });

  let copyConcept = "";
  let visualConcept = "";

  // ✅ 4. Luna maakt concepttekst
  if (needs_copy) {
    console.log("✍️ Luna ingeschakeld voor copy...");

    const gptResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/gpt`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Luna",
          messages: [
            { role: "system", content: lunaPrompt },
            { role: "user", content: briefing },
          ],
        }),
      }
    );

    const { response } = await gptResponse.json();

    if (!response || response.length < 10) {
      return NextResponse.json(
        { error: "Luna gaf geen geldig concept terug." },
        { status: 500 }
      );
    }

    copyConcept = response;
    console.log("✅ Luna's concept:", copyConcept);

    await supabase.from("project_files").insert({
      project_id: projectId,
      title: "Conceptvoorstellen van Luna",
      content: response,
      type: "text",
      phase: "concept",
    });
  }

  // ✅ 5. Carlos maakt beeldprompt en gebruikt /api/dalle
  if (needs_visuals) {
    console.log("🎨 Carlos ingeschakeld voor visuals...");

    const gptResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/gpt`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Carlos",
          messages: [
            { role: "system", content: carlosPrompt },
            { role: "user", content: briefing },
          ],
        }),
      }
    );

    const { response: visualPrompt } = await gptResponse.json();

    if (!visualPrompt || visualPrompt.length < 10) {
      return NextResponse.json(
        { error: "Carlos gaf geen geldig visueel voorstel terug." },
        { status: 500 }
      );
    }

    console.log("🧠 Carlos' beeldprompt:", visualPrompt);

    await supabase.from("project_files").insert({
      project_id: projectId,
      title: "Visueel voorstel (prompt) van Carlos",
      content: visualPrompt,
      type: "text",
      phase: "concept",
    });

    // 📤 Verstuur prompt naar nieuwe /api/dalle endpoint
    const dalleRes = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/dalle`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: visualPrompt,
          project_id: projectId,
        }),
      }
    );

    const { image_url } = await dalleRes.json();

    if (!image_url) {
      return NextResponse.json(
        { error: "DALL·E gaf geen afbeelding terug." },
        { status: 500 }
      );
    }

    console.log("🖼️ Beeld geüpload en ontvangen:", image_url);
    visualConcept = image_url; // voor response
  }

  // ✅ 6. Trigger presentatie
  await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL}/api/project/${projectId}/reviewone`,
    { method: "POST" }
  );

  console.log("📤 ReviewOne getriggerd.");

  // ✅ 7. Return
  return NextResponse.json({
    success: true,
    copy: copyConcept,
    visuals: visualConcept,
  });
}
