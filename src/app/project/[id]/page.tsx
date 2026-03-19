"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import DashboardNavbar from "@/components/dashboardnavbar";
import { supabase } from "@/lib/clients/supabaseBrowserClient";
import { marked } from "marked";

// Types
import type { Message } from "openai/resources";

interface Project {
  id: string;
  title: string;
  created_at: string;
  status: "Actief" | "Afgerond";
}

interface Briefing {
  id: string;
  project_id: string;
  content: string;
  is_approved: boolean;
  created_at: string;
}

interface ProjectFile {
  id: string;
  title: string;
  type: "text" | "presentation" | "viewer" | "video";
  phase: "concept" | "review_1" | "review_2" | "final";
  content: string;
}

interface Phase {
  id: string;
  label: string;
  status: "done" | "active" | "todo";
}

export default function ProjectHubPage() {
  const rawId = useParams()?.id;
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  console.log("🧪 Project ID als string:", id);
  console.log("🔍 useParams ID:", id);
  const [project, setProject] = useState<Project | null>(null);
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(true);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [feedback, setFeedback] = useState("");
  const [sending, setSending] = useState(false);
  const [approving, setApproving] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "database" | "tools">(
    "chat"
  );
  const [files, setFiles] = useState<ProjectFile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id || typeof id !== "string") return;

      const { data: projectData } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      const { data: briefingData } = await supabase
        .from("project_briefings")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { data: fileData } = await supabase
        .from("project_files")
        .select("*")
        .eq("project_id", id)
        .order("created_at", { ascending: true });

      console.log("📦 project_files data:", fileData);

      const basePhases: Phase[] = [
        { id: "debrief", label: "Debrief", status: "done" },
        { id: "concept", label: "Concept", status: "todo" },
        { id: "review_1", label: "Review 1", status: "todo" },
        { id: "review_2", label: "Review 2", status: "todo" },
        { id: "final", label: "Final", status: "todo" },
      ];

      let activeSet = false;
      const updatedPhases = basePhases.map((phase) => {
        const hasFile = fileData?.some((f) => f.phase === phase.id);
        return {
          ...phase,
          status: hasFile
            ? "done"
            : !activeSet
            ? ((activeSet = true), "active")
            : "todo",
        };
      });

      console.log("🧩 Gebouwde fasen:", updatedPhases);

      setProject(projectData);
      setBriefing(briefingData);
      setFiles(fileData || []);
      setPhases(updatedPhases);
      setMessages([
        {
          role: "assistant",
          content:
            "Welkom bij je projecthub! Hier volg je elke stap van je project. Laat me weten als je ergens hulp bij nodig hebt.",
        },
      ]);
      setLoading(false);
    };

    fetchData();
  }, [id]);

  const handleApprove = async () => {
    if (!briefing) return;
    setApproving(true);
    const { error } = await supabase
      .from("project_briefings")
      .update({ is_approved: true })
      .eq("id", briefing.id);
    if (!error) setBriefing({ ...briefing, is_approved: true });
    else console.error("❌ Goedkeuren mislukt:", error.message);
    setApproving(false);
  };

  const handleFeedbackSend = async () => {
    if (!feedback.trim()) return;
    const updated = [...messages, { role: "user", content: feedback.trim() }];
    setMessages(updated);
    setFeedback("");
    setSending(true);

    try {
      const res = await fetch("/api/gpt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "Claire", messages: updated }),
      });
      const data = await res.json();
      if (data.response)
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response },
        ]);
    } catch (err) {
      console.error("❌ Feedbackchat fout:", err);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <DashboardNavbar />
      <div className="px-6 py-12">
        {loading ? (
          <p>📦 Gegevens aan het laden…</p>
        ) : project ? (
          <>
            <h1 className="text-3xl font-bold mb-1">{project.title}</h1>
            <p className="text-gray-600 mb-6">
              Status: <strong>{project.status}</strong>
            </p>

            <div className="flex items-center mb-8">
              {phases.map((phase, i) => {
                const isDone = phase.status === "done";
                const isActive = phase.status === "active";
                const isNextDone =
                  i < phases.length - 1 &&
                  (phases[i + 1].status === "done" ||
                    phases[i + 1].status === "active");
                return (
                  <div key={phase.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 mb-1 ${
                          isDone || isActive
                            ? isActive
                              ? "bg-black border-black"
                              : "bg-green-600 border-green-600"
                            : "border-gray-300 bg-white"
                        }`}
                      />
                      <span className="text-xs text-center w-16">
                        {phase.label}
                      </span>
                    </div>
                    {i < phases.length - 1 && (
                      <div
                        className={`h-0.5 w-8 mx-1 ${
                          isNextDone ? "bg-green-600" : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setActiveTab("chat")}
                className={`px-4 py-2 rounded ${
                  activeTab === "chat" ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab("database")}
                className={`px-4 py-2 rounded ${
                  activeTab === "database"
                    ? "bg-black text-white"
                    : "bg-gray-200"
                }`}
              >
                Database
              </button>
              <button
                onClick={() => setActiveTab("tools")}
                className={`px-4 py-2 rounded ${
                  activeTab === "tools" ? "bg-black text-white" : "bg-gray-200"
                }`}
              >
                Tools
              </button>
            </div>

            {activeTab === "chat" && (
              <div className="bg-white p-4 border rounded-lg">
                <h2 className="text-xl font-semibold mb-4">
                  Gesprek met Claire
                </h2>
                <div className="space-y-3 mb-4">
                  {messages.map((msg, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded ${
                        msg.role === "assistant"
                          ? "bg-gray-100"
                          : "bg-black text-white"
                      }`}
                    >
                      <strong>
                        {msg.role === "assistant" ? "Claire" : "Jij"}:
                      </strong>{" "}
                      {msg.content}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Typ een bericht..."
                    className="flex-grow border border-gray-300 p-2 rounded"
                  />
                  <button
                    onClick={handleFeedbackSend}
                    disabled={sending}
                    className="bg-black text-white px-4 rounded"
                  >
                    Verstuur
                  </button>
                </div>
              </div>
            )}

            {activeTab === "database" && (
              <div className="bg-white p-6 border rounded">
                <h2 className="text-lg font-semibold mb-4">
                  📂 Bestandsoverzicht
                </h2>

                {files.length === 0 ? (
                  <p className="text-gray-500 italic">
                    Er zijn nog geen bestanden gegenereerd voor dit project.
                  </p>
                ) : (
                  <ul className="space-y-4">
                    {files.map((file) => (
                      <li
                        key={file.id}
                        className="border p-4 rounded shadow hover:bg-gray-50"
                      >
                        <Link
                          href={
                            file.type === "image"
                              ? `/tool/viewer/${file.id}` // 👈 route naar de beeldviewer
                              : `/tool/${file.type}/${file.id}`
                          }
                          className="flex items-center gap-2 text-lg font-medium"
                        >
                          {file.type === "text" && "📄"}
                          {file.type === "presentation" && "📊"}
                          {file.type === "video" && "🎬"}
                          {file.type === "viewer" && "🖼️"}
                          {file.type === "image" && "🖼️"}
                          {file.title || "(geen titel)"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "tools" && (
              <div className="bg-white p-6 border rounded space-y-4">
                <h2 className="text-lg font-semibold mb-4">
                  🧰 Tools & add-ons
                </h2>
                <p className="text-gray-600 mb-4">
                  Kies een tool om te openen:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <a
                    href={`/tool/text/new`}
                    className="border p-4 rounded hover:bg-gray-100 block transition"
                  >
                    📝 <strong>Tekstverwerker</strong>
                    <p className="text-sm text-gray-500">
                      Open een Word-achtige editor
                    </p>
                  </a>
                  <a
                    href={`/tool/presentation/new`}
                    className="border p-4 rounded hover:bg-gray-100 block transition"
                  >
                    📊 <strong>Presentatie-tool</strong>
                    <p className="text-sm text-gray-500">
                      Open een slides-omgeving zoals Keynote
                    </p>
                  </a>
                  <a
                    href={`/tool/viewer/new`}
                    className="border p-4 rounded hover:bg-gray-100 block transition"
                  >
                    🖼️ <strong>Beeldviewer</strong>
                    <p className="text-sm text-gray-500">
                      Bekijk afbeeldingen of visuals
                    </p>
                  </a>
                  <a
                    href={`/tool/video/new`}
                    className="border p-4 rounded hover:bg-gray-100 block transition"
                  >
                    🎬 <strong>Video Tool</strong>
                    <p className="text-sm text-gray-500">
                      Bekijk of bewerk een video
                    </p>
                  </a>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="text-red-500">❌ Project niet gevonden.</p>
        )}
      </div>
    </>
  );
}
