"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardNavbar from "@/components/dashboardnavbar";
import { useSupabase } from "@/context/supabase-context";
import { getMessages, saveMessage } from "@/lib/messages";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

export default function ChatPage() {
  const { id } = useParams();
  const router = useRouter();
  const { session } = useSupabase();
  const user = session?.user;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [readyForDebrief, setReadyForDebrief] = useState(false);
  const [dennisLoading, setDennisLoading] = useState(false);
  const [dennisReply, setDennisReply] = useState<string | null>(null);

  useEffect(() => {
    const loadMessages = async () => {
      if (!id) return;
      const history = await getMessages(id);
      setMessages(history || []);
    };
    loadMessages();
  }, [id]);

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const trimmed = newMessage.trim();
    const updatedMessages = [...messages, { role: "user", content: trimmed }];

    setMessages(updatedMessages);
    setNewMessage("");
    setLoading(true);

    try {
      await saveMessage(id, "user", trimmed);

      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Claire", messages: updatedMessages }),
      });

      const data = await res.json();
      const assistantReply = data.response ?? "⚠️ Geen reactie van Claire.";

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: assistantReply },
      ]);

      await saveMessage(id, "assistant", assistantReply);

      const afsluitZin =
        "Ik denk dat we alles hebben. Ik maak een korte debrief.";

      if (assistantReply.includes(afsluitZin)) {
        setDennisLoading(true);

        try {
          const response = await fetch(`/api/project/${id}/debrief`, {
            method: "POST",
          });

          const result = await response.json();

          if (response.ok && result.debrief) {
            console.log("📄 Dennis heeft een debrief gegenereerd.");
            setDennisReply(result.debrief);
            setReadyForDebrief(true);
          } else {
            console.error("❌ Dennis kon geen debrief maken:", result.error);
            alert("Er ging iets mis bij het genereren van de debrief.");
          }
        } catch (err) {
          console.error("❌ Dennis API fout:", err);
        } finally {
          setDennisLoading(false);
        }
      }
    } catch (err) {
      console.error("❌ Chat fout:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Chat met Claire</h1>

        <div className="space-y-4 mb-6">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`p-4 rounded ${
                msg.role === "assistant"
                  ? "bg-gray-100 text-black"
                  : msg.role === "user"
                  ? "bg-black text-white"
                  : "bg-blue-50 text-blue-900"
              }`}
            >
              <strong>
                {msg.role === "assistant"
                  ? "Claire"
                  : msg.role === "user"
                  ? "Jij"
                  : "Systeem"}
                :
              </strong>{" "}
              {msg.content}
            </div>
          ))}
        </div>

        {readyForDebrief && (
          <button
            onClick={() => router.push(`/project/${id}/debrief`)}
            className="bg-green-600 text-white px-4 py-2 rounded mb-4"
            disabled={dennisLoading}
          >
            {dennisLoading ? "Dennis schrijft..." : "Lees debrief"}
          </button>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Typ je bericht..."
            className="flex-grow border border-gray-300 p-2 rounded"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="bg-black text-white px-4 rounded"
          >
            Verstuur
          </button>
        </div>
      </div>
    </>
  );
}
