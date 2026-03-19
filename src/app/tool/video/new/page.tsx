import React from "react";

export default function VideoTool({ params }: { params: { videoId: string } }) {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🎬 Video Tool</h1>
      <p className="mb-2 text-gray-600">
        Video-ID: <strong>{params.videoId}</strong>
      </p>

      <div className="border border-gray-300 rounded p-6 bg-white shadow">
        <p>
          Hier komt een videospeler-omgeving, vergelijkbaar met Vimeo of
          YouTube.
        </p>
        <ul className="list-disc ml-5 mt-4 text-sm text-gray-500">
          <li>Embedded videospeler (bijv. via URL of file)</li>
          <li>Toelichtende tekst of caption onder de video</li>
          <li>Ruimte voor notities of opmerkingen</li>
        </ul>
      </div>
    </div>
  );
}
