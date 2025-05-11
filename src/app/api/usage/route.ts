// src/app/api/usage/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const start = "2025-05-01";
  const end = new Date().toISOString().split("T")[0];

  const res = await fetch(
    `https://api.openai.com/v1/dashboard/billing/usage?start_date=${start}&end_date=${end}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ usageInDollars: data.total_usage / 100 });
}
