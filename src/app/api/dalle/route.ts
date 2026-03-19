// app/api/dalle/route.ts

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

// 🔑 Supabase init
const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🔑 OpenAI init
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// 📡 POST: Genereer beeld met DALL·E en upload naar Supabase
export async function POST(req: NextRequest) {
  console.log("🎯 [API] /dalle aangeroepen");

  try {
    const { prompt, project_id } = await req.json();

    if (!prompt || !project_id) {
      return NextResponse.json(
        { error: "Zowel 'prompt' als 'project_id' zijn verplicht." },
        { status: 400 }
      );
    }

    console.log("🧠 Prompt ontvangen:", prompt);

    // 🔄 Beeld genereren via DALL·E
    const dalleRes = await openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
      quality: "hd",
      response_format: "b64_json",
    });

    const base64 = dalleRes.data[0]?.b64_json;

    if (!base64) {
      throw new Error("Geen afbeelding ontvangen van OpenAI.");
    }

    const buffer = Buffer.from(base64, "base64");
    const filename = `carlos-${Date.now()}.png`;

    // 🆙 Upload naar Supabase bucket
    const { error: uploadError } = await supabase.storage
      .from("generated-images")
      .upload(filename, buffer, {
        contentType: "image/png",
        upsert: false,
      });

    if (uploadError) {
      console.error("❌ Upload fout:", uploadError.message);
      return NextResponse.json(
        { error: "Upload naar Supabase Storage mislukt." },
        { status: 500 }
      );
    }

    // 🌍 Haal publieke URL op
    const { data: publicUrlData } = supabase.storage
      .from("generated-images")
      .getPublicUrl(filename);

    const imageUrl = publicUrlData?.publicUrl;

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Kon publieke URL niet genereren." },
        { status: 500 }
      );
    }

    console.log("✅ Beeld geüpload en beschikbaar:", imageUrl);

    // 🗂️ Voeg toe aan project_files
    const { error: insertError } = await supabase.from("project_files").insert({
      project_id,
      title: "Beeld door Carlos",
      content: imageUrl,
      type: "image",
      phase: "concept",
    });

    if (insertError) {
      console.error(
        "❌ Fout bij opslaan in project_files:",
        insertError.message
      );
      return NextResponse.json(
        { error: "Beeld geüpload maar niet opgeslagen in database." },
        { status: 500 }
      );
    }

    // 🎉 Succes
    return NextResponse.json({ image_url: imageUrl });
  } catch (err: any) {
    console.error("🚨 Interne fout:", err.message);
    return NextResponse.json(
      { error: "Er ging iets mis bij het genereren of uploaden." },
      { status: 500 }
    );
  }
}
