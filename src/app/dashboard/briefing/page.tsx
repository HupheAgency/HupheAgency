"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/context/supabase-context";
import DashboardNavbar from "@/components/dashboardnavbar";
import { CirclePie } from "@/components/ui/CirclePie";
import { Paperclip, Mic, Send, Plus } from "lucide-react";
import { checkBriefingFields } from "@/lib/ai-helpers/checkBriefingFields";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function BriefingPage() {
  const { session, supabase } = useSupabase();
  const router = useRouter();
  const user = session?.user;

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [progress, setProgress] = useState(0);
  const [readyForDebrief, setReadyForDebrief] = useState(false);
  const [loading, setLoading] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // ✅ Project aanmaken
    if (!projectId) {
      if (!user?.id) {
        console.warn("⚠️ Geen gebruiker gevonden:", session);
        alert("Je moet ingelogd zijn om een project te starten.");
        return;
      }

      const payload = {
        user_id: user.id,
        status: "concept",
        title: "Nieuw project",
      };

      try {
        const { data, error } = await supabase
          .from("projects")
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.error("❌ Supabase fout:", error);
          alert(
            `Er ging iets mis bij het aanmaken van je project: ${error.message}`
          );
          return;
        }

        setProjectId(data.id);
        console.log("✅ Project aangemaakt:", data.id);
      } catch (err) {
        console.error("❌ Crash tijdens project insert:", err);
        alert("Er ging iets mis bij het aanmaken van je project.");
        return;
      }
    }

    const userMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // ✅ Message opslaan in database (user input)
    if (projectId) {
      await supabase.from("project_messages").insert({
        project_id: projectId,
        role: "user",
        content: input.trim(),
      });
    }

    try {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Claire",
          messages: newMessages,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("❌ GPT API error:", errText);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "⚠️ Er ging iets mis bij het ophalen van een reactie.",
          },
        ]);
        return;
      }

      const data = await res.json();
      const reply =
        typeof data.response === "string"
          ? data.response
          : JSON.stringify(data.response || "⚠️ Geen antwoord ontvangen.");

      const updatedMessages = [
        ...newMessages,
        { role: "assistant", content: reply },
      ];
      setMessages(updatedMessages);

      // ✅ Message opslaan in database (AI response)
      if (projectId) {
        await supabase.from("project_messages").insert({
          project_id: projectId,
          role: "assistant",
          content: reply,
        });
      }

      const { percentage, complete } = checkBriefingFields(updatedMessages);
      setProgress(percentage);
      setReadyForDebrief(complete);
    } catch (err) {
      console.error("❌ Fout bij GPT-oproep:", err);
      alert("Er ging iets mis met Claire. Probeer het opnieuw.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="p-8 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Wat wil je maken?</h1>
            <p className="text-gray-500">
              Waarmee kan ik helpen? Een campagne, een video, een merk, een
              naam… alles mag!
            </p>
          </div>
          <CirclePie percentage={progress} />
        </div>

        <div className="bg-gray-100 rounded-lg p-4 h-[400px] overflow-y-auto">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`mb-3 p-3 rounded max-w-[75%] whitespace-pre-wrap ${
                msg.role === "assistant"
                  ? "bg-white text-gray-900"
                  : "bg-black text-white ml-auto"
              }`}
            >
              <p>{msg.content}</p>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {readyForDebrief && projectId && (
          <button
            onClick={() => router.push(`/project/${projectId}/debrief`)}
            className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
          >
            Bekijk briefing ✨
          </button>
        )}

        <div className="mt-4 flex items-center gap-2">
          <button
            className="p-2 rounded hover:bg-gray-200"
            onClick={() => alert("Uploadopties binnenkort")}
          >
            <Plus size={18} />
          </button>
          <input
            type="text"
            placeholder="Typ een bericht..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-grow border border-gray-300 rounded p-2"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="p-2 rounded bg-black text-white hover:bg-gray-800"
          >
            <Send size={18} />
          </button>
          <button
            onClick={() => alert("Spraakinput komt eraan")}
            className="p-2 rounded hover:bg-gray-200"
          >
            <Mic size={18} />
          </button>
        </div>
      </div>
    </>
  );
}
