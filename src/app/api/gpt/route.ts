import { NextResponse } from "next/server";
import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources";

// ✅ Actieve prompts
import clairePrompt from "@/lib/ai-prompts/claire-briefing-gpt";
import dennisPrompt from "@/lib/ai-prompts/dennis-debrief-gpt";
import lunaPrompt from "@/lib/ai-prompts/luna-copy-gpt";
import NoorPrompt from "@/lib/ai-prompts/noor-presentation-gpt";
import CarlosPrompt from "@/lib/ai-prompts/carlos-visual-dalle";

// 💤 Uitgeschakeld voor nu, klaar voor activatie:
//import samiraPrompt from "@/lib/ai-prompts/samira";
//import thomasPrompt from "@/lib/ai-prompts/thomas";
//import mayaPrompt from "@/lib/ai-prompts/maya";
//import elsaPrompt from "@/lib/ai-prompts/elsa";
//import raviPrompt from "@/lib/ai-prompts/ravi";
//import tomokoPrompt from "@/lib/ai-prompts/tomoko";
//import kwamePrompt from "@/lib/ai-prompts/kwame";
//import jamalPrompt from "@/lib/ai-prompts/jamal";
//import sophiePrompt from "@/lib/ai-prompts/sophie";
//import liangPrompt from "@/lib/ai-prompts/liang";
//import sagePrompt from "@/lib/ai-prompts/sage";
//import jiroPrompt from "@/lib/ai-prompts/jiro";
//import fatimaPrompt from "@/lib/ai-prompts/fatima";
//import daanPrompt from "@/lib/ai-prompts/daan";
//import avaPrompt from "@/lib/ai-prompts/ava";
//import raymondPrompt from "@/lib/ai-prompts/raymond";
//import camilaPrompt from "@/lib/ai-prompts/camila";
//import felixPrompt from "@/lib/ai-prompts/felix";
//import isabelPrompt from "@/lib/ai-prompts/isabel";
//import koenPrompt from "@/lib/ai-prompts/koen";
//import minseoPrompt from "@/lib/ai-prompts/minseo";
//import yuePrompt from "@/lib/ai-prompts/yue";
//import jadePrompt from "@/lib/ai-prompts/jade";
//import almaPrompt from "@/lib/ai-prompts/alma";
//import harutoPrompt from "@/lib/ai-prompts/haruto";
//import miraPrompt from "@/lib/ai-prompts/mira";
//import arvidPrompt from "@/lib/ai-prompts/arvid";
//import zuriPrompt from "@/lib/ai-prompts/zuri";

export const roles = {
  Claire: clairePrompt,
  Dennis: dennisPrompt,
  Luna: lunaPrompt,
  Noor: NoorPrompt,
  Carlos: CarlosPrompt,

  //Samira: samiraPrompt,
  //Thomas: thomasPrompt,
  //Maya: mayaPrompt,
  //Elsa: elsaPrompt,
  //Ravi: raviPrompt,
  //Tomoko: tomokoPrompt,
  //Kwame: kwamePrompt,
  //Jamal: jamalPrompt,
  //Sophie: sophiePrompt,
  //Liang: liangPrompt,
  //Sage: sagePrompt,
  //Jiro: jiroPrompt,
  //Fatima: fatimaPrompt,
  //Daan: daanPrompt,
  //Ava: avaPrompt,
  //Raymond: raymondPrompt,
  //Camila: camilaPrompt,
  //Felix: felixPrompt,
  //Isabel: isabelPrompt,
  //Koen: koenPrompt,
  //Minseo: minseoPrompt,
  //Yue: yuePrompt,
  //Jade: jadePrompt,
  //Alma: almaPrompt,
  //Haruto: harutoPrompt,
  //Mira: miraPrompt,
  //Arvid: arvidPrompt,
  //Zuri: zuriPrompt,
} as const;

type RoleKey = keyof typeof roles;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  console.log("📡 GPT endpoint aangeroepen");

  if (!process.env.OPENAI_API_KEY) {
    console.error("❌ Geen OpenAI API key beschikbaar.");
    return NextResponse.json({ error: "Geen OpenAI API key" }, { status: 500 });
  }

  try {
    const {
      role,
      messages,
    }: {
      role: RoleKey;
      messages: { role: "user" | "assistant"; content: string }[];
    } = await req.json();

    console.log("🎭 Gekozen rol:", role);

    const systemPrompt = roles[role];

    if (!systemPrompt) {
      console.error(`❌ Ongeldige rol: ${role}`);
      return NextResponse.json(
        { error: `Ongeldige rol: ${role}` },
        { status: 400 }
      );
    }

    const model = process.env.OPENAI_MODEL || "gpt-4";
    console.log("⚙️ Model:", model);

    const formattedMessages = messages
      .map((msg, i) => {
        let content: string;

        try {
          content =
            typeof msg.content === "string"
              ? msg.content
              : JSON.stringify(msg.content);
        } catch (err) {
          console.warn(`⚠️ Kon message ${i + 1} niet serialiseren.`);
          content = "⚠️ Niet-serialiseerbare inhoud ontvangen.";
        }

        console.log(`💬 ${i + 1}. ${msg.role}: ${content.slice(0, 100)}...`);

        return {
          role:
            msg.role === "assistant" || msg.role === "system"
              ? msg.role
              : "user",
          content,
        };
      })
      .filter(
        (msg) => typeof msg.content === "string" && msg.content.trim() !== ""
      );

    console.log("🧾 Verstuurde berichten naar OpenAI:", formattedMessages);

    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedMessages,
      ],
    });

    const response =
      chatCompletion.choices?.[0]?.message?.content?.trim() ??
      "⚠️ Geen antwoord ontvangen van AI.";

    console.log("✅ Antwoord van AI:", response.slice(0, 200));

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("❌ GPT fout:", error?.message || error);
    return NextResponse.json(
      {
        error: "Er ging iets mis met de AI.",
        details: error?.message || "Geen extra informatie beschikbaar",
      },
      { status: 500 }
    );
  }
}
