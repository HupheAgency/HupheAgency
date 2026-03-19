import React from "react";

export default function ViewerTool({
  params,
}: {
  params: { viewerId: string };
}) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🖼️ Viewer Tool</h1>
      <p className="mb-2 text-gray-600">
        Viewer-ID: <strong>{params.viewerId}</strong>
      </p>
      <div className="border border-gray-300 rounded p-6 bg-white shadow">
        <p>
          Hier komt een beeldweergave-omgeving, geschikt voor visual assets.
        </p>
        <ul className="list-disc ml-5 mt-4 text-sm text-gray-500">
          <li>Support voor meerdere afbeeldingen</li>
          <li>Scrollbare carousel of fullscreen viewer</li>
          <li>Metadata of beschrijvingen tonen bij beeld</li>
        </ul>
      </div>
    </div>
  );
}
