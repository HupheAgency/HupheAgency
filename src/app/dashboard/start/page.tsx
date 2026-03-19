"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function StartProjectPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/project/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, description }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      router.push(`/project/${data.projectId}`);
    } else {
      alert("❌ Fout: " + data.error);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🚀 Nieuw project starten</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Titel van het project</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block font-medium">Korte briefing</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border px-3 py-2 rounded"
            rows={5}
            required
          ></textarea>
        </div>
        <button
          type="submit"
          className="bg-black text-white px-4 py-2 rounded"
          disabled={loading}
        >
          {loading ? "Project wordt aangemaakt..." : "Start project"}
        </button>
      </form>
    </div>
  );
}
