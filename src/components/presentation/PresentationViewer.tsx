"use client";

import { useEffect, useState } from "react";
import Preview from "@/components/Preview";

export interface Slide {
  template: string;
  title?: string;
  client?: string;
  bodycopy?: string;
  imageURL?: string;
  subheading?: string;
}

interface PresentationViewerProps {
  slides: Slide[];
  onClose: () => void;
}

export default function PresentationViewer({
  slides,
  onClose,
}: PresentationViewerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Keyboard-navigatie
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [currentSlide]);

  // UI automatisch verbergen
  useEffect(() => {
    let timeout = setTimeout(() => setShowUI(false), 3000);
    const handleMouse = () => {
      setShowUI(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setShowUI(false), 3000);
    };
    document.addEventListener("mousemove", handleMouse);
    return () => document.removeEventListener("mousemove", handleMouse);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide((i) => i + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide((i) => i - 1);
    }
  };

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col justify-center items-center relative">
      {showUI && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-gray-800 text-white p-3 rounded-full shadow-lg hover:bg-gray-900 transition z-50"
          title="Sluit presentatie"
        >
          ❌
        </button>
      )}

      {slides.length === 0 ? (
        <p className="text-xl">Geen slides gevonden</p>
      ) : (
        <div className="w-full h-full">
          <Preview
            slideData={slides[currentSlide]}
            companyName="ROORDA · TABULA RASA"
            currentYear={new Date().getFullYear()}
          />
        </div>
      )}

      {showUI && (
        <div className="absolute bottom-10 flex gap-5">
          <button
            onClick={prevSlide}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Vorige
          </button>
          <button
            onClick={toggleFullscreen}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            {isFullscreen ? "Verlaat fullscreen" : "Fullscreen"}
          </button>
          <button
            onClick={nextSlide}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
          >
            Volgende
          </button>
        </div>
      )}
    </div>
  );
}
