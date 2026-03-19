"use client";

import React from "react";
import { Slide } from "@/types/slide";

interface SlideFormProps {
  slideData: Slide;
  setSlideData: React.Dispatch<React.SetStateAction<Slide>>;
  handleUploadImage: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSaveSlide: () => void;
  selectedSlideId: string | null;
  resetFields: () => void;
}

export default function SlideForm({
  slideData,
  setSlideData,
  handleUploadImage,
  handleSaveSlide,
  selectedSlideId,
  resetFields,
}: SlideFormProps) {
  const handleChange =
    (field: keyof Slide) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setSlideData({ ...slideData, [field]: e.target.value });
    };

  return (
    <div className="space-y-4">
      <select
        value={slideData.template}
        onChange={(e) =>
          setSlideData({ ...slideData, template: e.target.value })
        }
        className="w-full p-2 border rounded"
      >
        <option value="Intro Slide">Intro Slide</option>
        <option value="Moodboard">Moodboard</option>
        <option value="Video Embed">Video Embed</option>
        <option value="Full Image">Full Image</option>
        <option value="Titel + Tekst">Titel + Tekst</option>
        <option value="Afsluiter">Afsluiter</option>
      </select>

      {["Intro Slide", "Titel + Tekst", "Afsluiter"].includes(
        slideData.template
      ) && (
        <>
          <input
            type="text"
            placeholder="Titel"
            value={slideData.title}
            onChange={handleChange("title")}
            className="w-full p-2 border rounded"
          />

          <input
            type="text"
            placeholder="Opdrachtgever"
            value={slideData.client}
            onChange={handleChange("client")}
            className="w-full p-2 border rounded"
          />

          <textarea
            placeholder="Bodytekst"
            value={slideData.bodycopy}
            onChange={handleChange("bodycopy")}
            className="w-full p-2 border rounded"
          />
        </>
      )}

      {slideData.template === "Full Image" && (
        <div className="space-y-2">
          <label className="block">Afbeelding uploaden</label>
          <input type="file" onChange={handleUploadImage} />
        </div>
      )}

      {slideData.template === "Video Embed" && (
        <input
          type="text"
          placeholder="Video URL"
          value={slideData.videoURL}
          onChange={handleChange("videoURL")}
          className="w-full p-2 border rounded"
        />
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSaveSlide}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {selectedSlideId ? "Update Slide" : "Add Slide"}
        </button>
        {selectedSlideId && (
          <button
            onClick={resetFields}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
