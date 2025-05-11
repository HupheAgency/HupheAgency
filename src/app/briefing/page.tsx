"use client";
console.log("📄 BriefingPage geladen");

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthProvider";
import DashboardNavbar from "@/components/dashboardnavbar";

export default function BriefingPage() {
  const { user, loading: authLoading } = useAuth();
  console.log("👤 BriefingPage | user:", user, "| loading:", authLoading);
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [response, setResponse] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading) return <p className="p-6">⏳ Authenticatie laden...</p>;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/project/briefing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId: "test-project", briefing: input }),
      });

      const data = await res.json();

      if (data.resultaten) {
        setResponse(
          data.resultaten.map((r: any) => `💬 ${r.role}:\n${r.output}`)
        );

        const newProjectRes = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            title: title || input.slice(0, 50) || "Nieuw project",
            status: "Actief",
          }),
        });

        const newProject = await newProjectRes.json();
        console.log("📦 newProject response:", newProject);

        if (newProject?.data?.id) {
          router.push(`/project/${newProject.data.id}`);
        } else {
          console.error("❌ Project kon niet worden aangemaakt.");
          console.error(
            "🧯 Mislukte projectresponse:",
            JSON.stringify(newProject, null, 2)
          );
        }
      } else {
        setResponse(["⚠️ Geen respons ontvangen van het team."]);
      }
    } catch (error) {
      setResponse([
        "❌ Er ging iets mis tijdens het versturen van de briefing.",
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="min-h-screen bg-white px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Briefing indienen</h1>
        <p className="text-sm text-gray-600 mb-6">
          Ingelogd als: <span className="font-medium">{user?.email}</span>
        </p>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <input
            type="text"
            placeholder="Projecttitel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 p-2 rounded"
            required
          />
          <textarea
            className="w-full border border-gray-300 p-4 rounded h-40"
            placeholder="Typ hier je briefing..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            required
          />
          <button
            type="submit"
            disabled={loading || !input || !title}
            className="bg-black text-white px-6 py-2 rounded disabled:opacity-50"
          >
            {loading ? "Versturen..." : "Verstuur briefing"}
          </button>
        </form>

        {response && (
          <div className="bg-gray-50 p-4 rounded space-y-4 whitespace-pre-line">
            {response.map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
