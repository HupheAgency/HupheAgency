// src/app/api/project/start/route.ts
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const { title, description } = await req.json();

  if (!title || !description) {
    return NextResponse.json(
      { error: "Titel en omschrijving vereist" },
      { status: 400 }
    );
  }

  const projectId = uuidv4();

  // 👉 hier kunnen we later echte opslag aanroepen (bijv. database of file)
  const project = {
    id: projectId,
    title,
    description,
    createdAt: new Date().toISOString(),
    status: "briefing",
  };

  // Simuleer opslag (voor nu, zonder persistente storage)
  console.log("📁 Nieuw project aangemaakt:", project);

  return NextResponse.json({ projectId, status: project.status });
}
