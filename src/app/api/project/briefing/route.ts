// app/api/project/briefing/route.ts
import { NextRequest, NextResponse } from "next/server";
import { saveMessage } from "@/lib/messages";

export async function POST(req: NextRequest) {
  try {
    const { projectId, briefing, assistant } = await req.json();

    console.log("📥 Briefing ontvangen:");
    console.log("   📁 projectId:", projectId);
    console.log("   🧑‍💼 Gebruiker:", briefing.slice(0, 100));
    console.log("   🤖 Claire:", assistant?.slice(0, 100));

    if (!projectId || !briefing || !assistant) {
      return NextResponse.json(
        { error: "Project ID, briefing en assistant-reactie zijn verplicht." },
        { status: 400 }
      );
    }

    // Beide berichten opslaan
    await saveMessage(projectId, "user", briefing);
    await saveMessage(projectId, "assistant", assistant);

    console.log("✅ Beide berichten succesvol opgeslagen.");
    return NextResponse.json({ status: "ok" });
  } catch (err: any) {
    console.error("❌ Fout bij opslaan van berichten:", err.message || err);
    return NextResponse.json(
      { error: "Interne serverfout bij opslaan van briefing." },
      { status: 500 }
    );
  }
}
