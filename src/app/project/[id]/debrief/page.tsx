"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardNavbar from "@/components/dashboardnavbar";

export default function DebriefPage() {
  const { id } = useParams();
  const router = useRouter();

  const [debrief, setDebrief] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDebrief = async () => {
      if (!id) return;

      try {
        const res = await fetch(`/api/project/${id}/debrief`, {
          method: "POST",
        });

        const data = await res.json();

        if (res.ok && data.debrief) {
          setDebrief(data.debrief);
        } else {
          setError("Debrief niet gevonden.");
        }
      } catch (err) {
        console.error("❌ Fout bij ophalen debrief:", err);
        setError("Er ging iets mis bij het ophalen van de debrief.");
      } finally {
        setLoading(false);
      }
    };

    fetchDebrief();
  }, [id]);

  const handleAkkoord = async () => {
    try {
      // ✅ 1. Debrief goedkeuren
      const res = await fetch(`/api/project/${id}/debrief/upsert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: id,
          content: debrief,
          status: "goedgekeurd",
        }),
      });

      if (!res.ok) {
        alert("❌ Er ging iets mis bij het opslaan.");
        return;
      }

      // ✅ 2. Creatieve briefing laten genereren
      const creativeRes = await fetch(`/api/project/${id}/creative-brief`, {
        method: "POST",
      });

      if (!creativeRes.ok) {
        alert("⚠️ De creatieve brief kon niet worden gegenereerd.");
        return;
      }

      // ✅ 3. Doorsturen naar projectpagina
      router.push(`/project/${id}`);
    } catch (err) {
      console.error("❌ Fout bij verwerken akkoord:", err);
      alert("❌ Er ging iets mis. Probeer het opnieuw.");
    }
  };

  const handleWijzigen = () => {
    router.push(`/project/${id}/chat?editDebrief=true`);
  };

  return (
    <>
      <DashboardNavbar />
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          📄 Samenvatting van je briefing
        </h1>

        {loading ? (
          <p>⏳ Debrief wordt opgehaald...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="bg-white border rounded p-4 whitespace-pre-wrap mb-6">
            {debrief}
          </div>
        )}

        {!loading && !error && (
          <div className="flex gap-4">
            <button
              onClick={handleWijzigen}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded"
            >
              Wijzigen
            </button>
            <button
              onClick={handleAkkoord}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Akkoord
            </button>
          </div>
        )}
      </div>
    </>
  );
}
