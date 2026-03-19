"use client";

import React from "react";
import { Slide } from "@/types/slide";

interface PreviewProps {
  slideData: Slide;
  companyName: string;
  currentYear: number;
  isThumbnail?: boolean;
}

export default function Preview({
  slideData,
  companyName,
  currentYear,
  isThumbnail = false,
}: PreviewProps) {
  const isDarkBackground = [
    "Intro Slide",
    "Intro kleur",
    "Video",
    "Pagina afbeelding",
    "Tussenslide zwart",
  ].includes(slideData.template);

  const logoSrc = isDarkBackground
    ? "/logo_RTR_Light.png"
    : "/logo_RTR_Dark.png";

  const formattedDate = new Date().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="w-full h-full relative overflow-hidden">
      {!isThumbnail && (
        <img
          src={logoSrc}
          alt="Logo"
          className="absolute top-5 left-5 w-28 z-10"
        />
      )}

      {/* Template rendering */}
      {slideData.template === "Intro Slide" && (
        <div className="h-full flex flex-col justify-center items-center bg-black text-white text-center">
          <h2
            className={`text-[#E46F50] ${isThumbnail ? "text-xs" : "text-3xl"}`}
          >
            Amsterdam {formattedDate}
          </h2>
          <h1
            className={`font-bold leading-none ${
              isThumbnail ? "text-4xl" : "text-[230px]"
            }`}
          >
            {slideData.title || "Grote titel"}
          </h1>
          <h3 className={`${isThumbnail ? "text-xs" : "text-3xl"}`}>
            {slideData.client || "Klantnaam"}
          </h3>
        </div>
      )}

      {slideData.template === "Full Image" && (
        <div
          className="h-full w-full bg-center bg-cover"
          style={{
            backgroundImage: `url(${
              slideData.imageURL || "/default-image.jpg"
            })`,
          }}
        />
      )}

      {slideData.template === "Lege pagina" && (
        <div className="h-full flex flex-col items-center justify-center bg-white text-black px-10 text-center">
          <h1 className="text-5xl font-bold mb-6">
            {slideData.title || "Titel"}
          </h1>
          <p className="text-xl max-w-4xl">
            {slideData.bodycopy || "Voeg hier je tekst toe."}
          </p>
        </div>
      )}

      {slideData.template === "Titel + Tekst" && (
        <div className="h-full grid grid-cols-2 bg-white text-black p-10">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold">{slideData.title}</h1>
            <p className="mt-4">{slideData.bodycopy}</p>
          </div>
          <div className="flex items-center justify-center bg-gray-200">
            {slideData.imageURL && (
              <img
                src={slideData.imageURL}
                alt="Slide afbeelding"
                className="max-w-full max-h-full object-contain"
              />
            )}
          </div>
        </div>
      )}

      {slideData.template === "Video Embed" && (
        <div className="flex items-center justify-center h-full bg-black">
          <iframe
            src={slideData.videoURL}
            title="Video"
            className="w-3/4 h-3/4"
            allowFullScreen
          />
        </div>
      )}

      {slideData.template === "Moodboard" && (
        <div className="h-full w-full bg-white text-black flex items-center justify-center">
          <p>Moodboard placeholders nog in te vullen</p>
        </div>
      )}

      {slideData.template === "Afsluiter" && (
        <div className="h-full flex items-center justify-center bg-black text-white">
          <h1
            className="text-[180px] font-bebas uppercase"
            style={{
              textShadow:
                "-2px 2px 0px #FF6F50, -4px 4px 0px #FF6F50, -6px 6px 0px #FF6F50",
              lineHeight: "0.75",
              letterSpacing: "-0.02em",
            }}
          >
            {slideData.title || "Bedankt!"}
          </h1>
        </div>
      )}

      {!isThumbnail && (
        <p className="absolute bottom-5 left-7 text-[8px] text-gray-400 rotate-[-90deg] origin-bottom-left">
          {companyName} {currentYear}
        </p>
      )}
    </div>
  );
}
