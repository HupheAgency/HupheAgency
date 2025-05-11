"use client";

import { useEffect, useState } from "react";

export default function ChatPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [usage, setUsage] = useState<number | null>(null); // 👈 nieuw

  // 👇 Usage ophalen bij laden
  /* useEffect(() => {
    const fetchUsage = async () => {
      const res = await fetch("/api/usage");
      const data = await res.json();
      if (res.ok) {
        setUsage(data.usageInDollars); // ← verwacht een veld uit jouw /api/usage/route.ts
      } else {
        console.error("❌ Usage ophalen mislukt:", data.error);
      }
    };

    fetchUsage();
  }, []);
*/
  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, `🧑‍💼 Jij: ${input}`]);

    const response = await fetch("/api/gpt", {
      method: "POST",
      body: JSON.stringify({
        role: "Accountmanager",
        briefing: input,
      }),
    });

    if (!response.ok) {
      console.error("❌ Serverfout:", await response.text());
      setMessages((prev) => [...prev, "❌ Er ging iets mis met de AI."]);
      return;
    }

    const data = await response.json();
    setMessages((prev) => [...prev, `🤖 Accountmanager: ${data.response}`]);
    setInput("");
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">💬 Chat met je Accountmanager</h1>

      {/* ✅ Usage meter */}
      {usage !== null && (
        <>
          <div className="w-full bg-gray-200 rounded h-4 mb-2">
            <div
              className="bg-green-500 h-4 rounded"
              style={{ width: `${Math.min((usage / 5) * 100, 100)}%` }}
            ></div>
          </div>
          <p className="text-sm mb-4">
            Je hebt <strong>${usage.toFixed(2)}</strong> van je $5 budget
            gebruikt.
          </p>
        </>
      )}

      <div className="bg-gray-100 p-4 rounded mb-4 h-96 overflow-y-auto">
        {messages.map((msg, i) => (
          <p key={i} className="mb-2">
            {msg}
          </p>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 border border-gray-300 rounded px-3 py-2"
          placeholder="Typ je briefing of vraag..."
        />
        <button
          onClick={sendMessage}
          className="bg-black text-white px-4 py-2 rounded"
        >
          Verstuur
        </button>
      </div>
    </div>
  );
}
