// app/api/project/briefing/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

export async function POST(req: Request) {
  const { projectId, briefing } = await req.json();

  if (!projectId || !briefing) {
    return NextResponse.json(
      { error: "Project ID en briefing zijn verplicht." },
      { status: 400 }
    );
  }

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY ontbreekt in je .env" },
      { status: 500 }
    );
  }

  const chain: { role: string; prompt: string; input: string }[] = [
    {
      role: "Accountmanager",
      prompt:
        "Je bent een ervaren accountmanager. Bedank de ECD voor de briefing en geef aan wat je ermee gaat doen. Draag het vervolgens over aan de projectmanager.",
      input: briefing,
    },

    /* 
    {
      role: "Projectmanager",
      prompt:
        "Je bent projectmanager. Je coördineert het proces en schakelt de gedragsstrateeg en de strateeg in. Geef aan wat de vervolgstappen zijn.",
      input: "<<Accountmanager>>",
    },
    {
      role: "Gedragsstrateeg",
      prompt:
        "Je bent gedragswetenschapper. Analyseer de briefing vanuit gedragsverandering en geef inzichten.",
      input: briefing,
    },
    {
      role: "Strateeg",
      prompt:
        "Je bent merkstrateeg. Bedenk een strategische richting op basis van de briefing en de gedragsinzichten die je zojuist hebt gelezen.",
      input: "<<Gedragsstrateeg>>",
    },
    {
      role: "Creatief Directeur",
      prompt:
        "Je bent creatief directeur. Geef het creatieve team een briefing op basis van de strategie en gedragsinzichten.",
      input: "<<Strateeg>>\n\n<<Gedragsstrateeg>>",
    },
    {
      role: "Copywriter",
      prompt:
        "Je bent copywriter. Bedenk minstens 3 creatieve concepten, slogans of teksten op basis van de creatieve briefing.",
      input: "<<Creatief Directeur>>",
    },
    {
      role: "Art Director",
      prompt:
        "Je bent art director. Bedenk minstens 3 visuele stijlen of formats op basis van de briefing en ideeën van de copywriter.",
      input: "<<Creatief Directeur>>\n\n<<Copywriter>>",
    },
    {
      role: "ReviewTeam",
      prompt:
        "Je bent het reviewteam (strateeg, gedragsstrateeg, creatief directeur). Reflecteer kritisch op de voorstellen van copywriter en art director. Wat kan beter?",
      input:
        "<<Strateeg>>\n\n<<Gedragsstrateeg>>\n\n<<Copywriter>>\n\n<<Art Director>>",
    },
    {
      role: "ECD",
      prompt:
        "Je bent de Executive Creative Director. Kies de beste richting(en) en motiveer waarom. Geef richting voor de uitwerking.",
      input: "<<ReviewTeam>>",
    },
    {
      role: "Designer",
      prompt:
        "Je bent designer. Werk het gekozen idee visueel uit als stijlsuggestie of presentatievorm, op basis van de ECD-keuze.",
      input: "<<ECD>>",
    },
    {
      role: "Projectmanager (verslag)",
      prompt:
        "Je bent projectmanager. Vat het hele projecttraject kort en helder samen in een verslag voor het team en de klant.",
      input:
        "<<Accountmanager>>\n\n<<Projectmanager>>\n\n<<Gedragsstrateeg>>\n\n<<Strateeg>>\n\n<<Creatief Directeur>>\n\n<<Copywriter>>\n\n<<Art Director>>\n\n<<ReviewTeam>>\n\n<<ECD>>\n\n<<Designer>>",
    }
    */
  ];

  const resultaten: { role: string; output: string }[] = [];
  const outputMap: Record<string, string> = {};

  for (const step of chain) {
    let resolvedInput = step.input;
    Object.keys(outputMap).forEach((key) => {
      resolvedInput = resolvedInput.replaceAll(`<<${key}>>`, outputMap[key]);
    });

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: step.prompt },
        { role: "user", content: resolvedInput },
      ],
    });

    const output =
      completion.choices[0].message?.content || "[Geen reactie ontvangen]";
    resultaten.push({ role: step.role, output });
    outputMap[step.role] = output;
  }

  return NextResponse.json({ resultaten });
}
