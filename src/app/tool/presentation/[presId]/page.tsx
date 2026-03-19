"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/clients/supabaseBrowserClient";
import PresentationViewer from "@/components/presentation/PresentationViewer";
import { Slide } from "@/types/slide"; // Als je die hebt

function generateSlidesFromText(content: string): Slide[] {
  const lines = content.split("\n");
  const slides: Slide[] = [];

  // Voeg altijd een Intro Slide toe (optioneel dynamisch maken)
  slides.push({
    template: "Intro Slide",
    title: "Creatieve Payoff Voorstellen",
    client: "Nudisten Club Nederland",
  });

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("##")) {
      const title = line.replace(/^##+/, "").trim();
      const bodycopy = lines[i + 1]?.trim() || "";
      slides.push({
        template: "Lege pagina",
        title,
        bodycopy,
      });
    }
  }

  return slides;
}

export default function PresentationPage() {
  const rawId = useParams()?.presId;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;

  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndParseSlides = async () => {
      if (!id) return;

      const { data, error } = await supabase
        .from("project_files")
        .select("content")
        .eq("id", id)
        .eq("type", "presentation")
        .single();

      if (error || !data) {
        console.error("❌ Supabase fout:", error);
        setError("Kon presentatie niet laden.");
        setLoading(false);
        return;
      }

      try {
        const generated = generateSlidesFromText(data.content);
        setSlides(generated);
      } catch (e) {
        console.error("❌ Fout bij genereren van slides:", e);
        setError("Ongeldig formaat van presentatiecontent.");
      }

      setLoading(false);
    };

    fetchAndParseSlides();
  }, [id]);

  if (loading) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        <p>Presentatie wordt geladen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen bg-black text-white flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return <PresentationViewer slides={slides} />;
}
