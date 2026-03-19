"use client";

import { useState, useEffect } from "react";

const phases = {
  fase1: [
    "Homepage met login",
    "Briefing indienen via formulier",
    "Accountmanager verwerkt briefing (AI agent)",
    "Debrief wordt opgeslagen (projectmanager)",
    "Strategische check door strateeg met feedback",
    "Briefing document opstellen (met strategie)",
    "Creatief directeur keurt briefing goed",
    "Briefing naar creatieve team",
    "Copywriter verzint slogans",
    "Presentatie van slogans genereren",
    "Review met team (PM, CD, Strateeg)",
    "Keuze maken uit concepten",
  ],
  fase2: [
    "AI Designer maakt presentatie",
    "Review 2 voorbereiden",
    "Definitief concept selecteren",
    "Uitwerking door uitvoerend team",
    "Embeddings toevoegen",
  ],
  fase3: [
    "Klantprofiel opzetten",
    "Login voor klant",
    "Dashboard voor klant invullen",
    "Betaalplannen tonen en kiezen",
  ],
  fase4: [
    "Admin omgeving bouwen",
    "Overzicht projecten voor eigenaar",
    "Projectbijsturing toevoegen",
  ],
  fase5: [
    "Volledige design upgrade van platform",
    "Mobiele weergave optimaliseren",
    "UX & Animaties toevoegen",
  ],
  fase6: [
    "Tool: slogan-generator",
    "Tool: beeld-generator",
    "Tool: moodboard-builder",
    "Tool: pitchdeck-presentatie",
  ],
};

export default function WorkflowPage() {
  const [done, setDone] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<keyof typeof phases | "ideas">(
    "fase1"
  );

  // ✅ Bij laden: haal uit localStorage
  useEffect(() => {
    const saved = localStorage.getItem("workflow_done");
    if (saved) {
      try {
        setDone(JSON.parse(saved));
      } catch {
        setDone([]);
      }
    }
  }, []);

  // ✅ Bij update: sla op in localStorage
  useEffect(() => {
    localStorage.setItem("workflow_done", JSON.stringify(done));
  }, [done]);

  const toggleDone = (item: string) => {
    setDone((prev) =>
      prev.includes(item) ? prev.filter((d) => d !== item) : [...prev, item]
    );
  };

  const renderList = (items: string[]) => (
    <div className="space-y-2 mt-4">
      {items.map((item) => (
        <div
          key={item}
          onClick={() => toggleDone(item)}
          className={`cursor-pointer px-4 py-2 rounded transition duration-200 ${
            done.includes(item)
              ? "bg-gray-300 line-through text-gray-600 opacity-30"
              : "bg-green-200 hover:bg-green-300"
          }`}
        >
          {item}
        </div>
      ))}
    </div>
  );

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🎯 Workflow & Roadmap</h1>

      <div className="flex gap-4 mb-4 flex-wrap">
        {Object.keys(phases).map((fase) => (
          <button
            key={fase}
            onClick={() => setActiveTab(fase as keyof typeof phases)}
            className={`px-4 py-2 rounded font-medium ${
              activeTab === fase ? "bg-black text-white" : "bg-gray-200"
            }`}
          >
            {fase.toUpperCase()}
          </button>
        ))}
        <button
          onClick={() => setActiveTab("ideas")}
          className={`px-4 py-2 rounded font-medium ${
            activeTab === "ideas" ? "bg-black text-white" : "bg-gray-200"
          }`}
        >
          💡 IDEAS
        </button>
      </div>

      {activeTab !== "ideas" && renderList(phases[activeTab])}
      {activeTab === "ideas" &&
        renderList([
          "AI's trainen met dataset",
          "Projectexport naar PDF",
          "Slack integratie",
          "Realtime samenwerking",
          "Portfolio-generator",
        ])}
    </div>
  );
}
