import React from "react";

export default function PresentationTool({
  params,
}: {
  params: { presId: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🎞️ Presentatie Tool</h1>
      <p className="mb-2 text-gray-600">
        Presentatie-ID: <strong>{params.presId}</strong>
      </p>
      <div className="border border-gray-300 rounded p-6 bg-white shadow">
        <p>Dit is een placeholder voor de presentatieomgeving.</p>
        <ul className="list-disc ml-5 mt-4 text-sm text-gray-500">
          <li>Toon slides als aparte componenten</li>
          <li>Voeg een AI gegenereerde presentatie flow toe</li>
          <li>Integreer export of bewerkingsmogelijkheden</li>
        </ul>
      </div>
    </div>
  );
}
