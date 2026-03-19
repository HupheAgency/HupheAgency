"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

export default function Dashboard() {
  const [presentations, setPresentations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const [presentationName, setPresentationName] =
    useState("Nieuwe Presentatie");
  const presentationId = new URLSearchParams(window.location.search).get("id");
  const handleDeletePresentation = (id) => {
    const confirmed = window.confirm(
      "Weet je zeker dat je deze presentatie wilt verwijderen?"
    );
    if (!confirmed) return;

    // ✅ Haal de presentaties opnieuw op uit localStorage
    const storedPresentations =
      JSON.parse(localStorage.getItem("presentations")) || [];

    // ✅ Filter de presentaties en update localStorage
    const updatedPresentations = storedPresentations.filter((p) => p.id !== id);
    localStorage.setItem("presentations", JSON.stringify(updatedPresentations));

    // ✅ Update de state
    setPresentations(updatedPresentations);
  };
  const handleDuplicatePresentation = (id) => {
    const storedPresentations =
      JSON.parse(localStorage.getItem("presentations")) || [];
    const presentationToCopy = storedPresentations.find((p) => p.id === id);

    if (!presentationToCopy) return;

    const newPresentation = {
      ...presentationToCopy,
      id: uuidv4(), // Geef een nieuwe unieke ID
      name: `${presentationToCopy.name} (Kopie)`,
    };

    const updatedPresentations = [...storedPresentations, newPresentation];
    localStorage.setItem("presentations", JSON.stringify(updatedPresentations));
    setPresentations(updatedPresentations);
  };

  // Haal opgeslagen presentaties op uit localStorage (voor nu, later database)
  useEffect(() => {
    const storedPresentations =
      JSON.parse(localStorage.getItem("presentations")) || [];
    setPresentations(storedPresentations);
  }, []);

  // Zoekfunctie om presentaties te filteren
  const filteredPresentations = presentations.filter((presentation) =>
    presentation.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Nieuwe presentatie aanmaken en doorsturen naar Build Mode
  const createNewPresentation = () => {
    const newPresentation = {
      id: Date.now().toString(),
      name: "Nieuwe Presentatie",
      slides: [],
    };
    const updatedPresentations = [...presentations, newPresentation];
    localStorage.setItem("presentations", JSON.stringify(updatedPresentations));
    setPresentations(updatedPresentations);
    router.push(`/build?id=${newPresentation.id}`);
  };

  return (
    <div className="w-full min-h-screen bg-gray-100 p-10">
      <h1 className="text-3xl font-bold mb-6">📂 Dashboard - Presentaties</h1>

      {/* Zoekbalk */}
      <input
        type="text"
        placeholder="Zoek presentaties..."
        className="w-full p-3 border rounded mb-6"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      {/* Knop om een nieuwe presentatie te starten */}
      <button
        onClick={createNewPresentation}
        className="mb-6 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        ➕ Nieuwe Presentatie
      </button>

      {/* Presentatie-overzicht */}
      <div className="grid grid-cols-3 gap-6">
        {filteredPresentations.map((presentation) => (
          <div key={presentation.id} className="bg-white p-4 shadow rounded-lg">
            {/* Thumbnail: eerste slide als preview */}
            <div className="w-full h-40 bg-gray-200 flex items-center justify-center">
              {presentation.slides.length > 0 ? (
                <img
                  src={presentation.slides[0].imageURL || "/placeholder.png"}
                  alt="Eerste slide"
                  className="w-full h-full object-cover rounded"
                />
              ) : (
                <span className="text-gray-500">Geen slides</span>
              )}
            </div>

            {/* Presentatienaam */}
            <h2 className="mt-3 text-lg font-bold">{presentation.name}</h2>

            {/* Actieknoppen */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  const slidesParam = encodeURIComponent(
                    JSON.stringify(presentation.slides || [])
                  );
                  router.push(
                    `/present?id=${presentation.id}&slides=${slidesParam}&from=dashboard`
                  );
                }}
                className="bg-gray-700 text-white px-3 py-2 rounded hover:bg-gray-600"
              >
                👀 Preview
              </button>
              <button
                onClick={() => router.push(`/build?id=${presentation.id}`)}
                className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDeletePresentation(presentation.id)}
                className="text-red-500 hover:text-red-700"
              >
                ❌
              </button>
              <button
                onClick={() => handleDuplicatePresentation(presentation.id)}
                className="text-blue-500 hover:text-blue-700"
              >
                📄
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
