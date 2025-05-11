// app/api/gpt/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

console.log("🔑 KEY uit .env:", process.env.OPENAI_API_KEY);
console.log("📦 Model uit .env:", process.env.OPENAI_MODEL);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const roles = {
  Ava: "Jij bent een copywriter die vlot, speels en creatief schrijft. Reageer met een slogan of headline.",
  Jules:
    "Jij bent een Art Director. Denk in beelden, beschrijf sfeer en visualisatie bij een concept.",
  Lio: "Jij bent een merkstrateeg. Denk strategisch en onderbouw de kern van het idee.",
  Claire:
    "Jij bent de accountmanager van het team. Je zorgt dat de klantvraag helder geformuleerd wordt. Je stelt verhelderende vragen, vat input samen en zet het daarna door naar het strategisch team als alles duidelijk is.",
  Max: "Jij bent de projectmanager. Je bewaakt deadlines en zorgt ervoor dat taken op tijd worden uitgevoerd. Je overlegt met Claire en koppelt alles terug.",
  Noor: "Jij bent gedragswetenschapper. Je toetst of creatieve concepten gedragsverandering stimuleren en baseert je argumentatie op wetenschappelijke inzichten.",
  Sam: "Jij bent de innovator. Je denkt buiten de gebaande paden, zoekt naar technologische of format-gedreven vernieuwingen en werkt samen met de strateeg en gedragswetenschapper.",
  Daan: "Jij bent de planner. Jij bewaakt de voortgang en maakt planningen voor campagnes, opleveringen en presentaties.",
  Zoë: "Jij bent brand designer. Jij ontwikkelt merken visueel, bewaakt identiteit en werkt nauw samen met de art director.",
  Finn: "Jij bent studio designer. Jij werkt presentaties uit in InDesign of Figma op basis van input van het creatieve team.",
  Nina: "Jij bent de Creative Director. Jij begeleidt het creatieve proces, stuurt copywriter en art director aan, en bewaakt de creatieve kwaliteit.",
  Tom: "Jij bent de Executive Creative Director. Jij bent eindverantwoordelijk voor de creatieve koers van het bureau. Je bepaalt welke ideeën doorgaan, waar we naartoe werken en hoe het team samenwerkt.",
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Geen OpenAI key gevonden in .env");
    return NextResponse.json(
      { error: "Geen API key gevonden." },
      { status: 500 }
    );
  }

  const { role, briefing } = await req.json();
  const systemPrompt = roles[role];

  if (!systemPrompt) {
    console.error("❌ Ongeldige rol:", role);
    return NextResponse.json(
      { error: "Ongeldige AI-rol gekozen." },
      { status: 400 }
    );
  }

  const model = process.env.OPENAI_MODEL || "gpt-3.5-turbo";

  try {
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: briefing },
      ],
    });

    return NextResponse.json({
      response:
        chatCompletion.choices?.[0]?.message?.content ??
        "⚠️ Geen antwoord ontvangen van AI.",
    });
  } catch (error: any) {
    console.error("❌ OpenAI error:", error.message);
    return NextResponse.json({ error: "GPT request failed" }, { status: 500 });
  }
}
