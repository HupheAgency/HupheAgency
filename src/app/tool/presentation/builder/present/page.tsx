"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Preview from "@/components/Preview";

interface Slide {
  template: string;
  title?: string;
  client?: string;
  bodycopy?: string;
  imageURL?: string;
  subheading?: string;
}

export default function PresentationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const presentationId = searchParams.get("id");
  const slidesParam = searchParams.get("slides");

  const [slides, setSlides] = useState<Slide[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showUI, setShowUI] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (slidesParam) {
      try {
        const parsed = JSON.parse(decodeURIComponent(slidesParam));
        setSlides(parsed);
      } catch (e) {
        console.error("❌ Kon slides niet parsen", e);
      }
    }
  }, [slidesParam]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [currentSlide]);

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

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

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

  return (
    <div className="w-full h-screen bg-black text-white flex flex-col justify-center items-center relative">
      {/* Sluitknop */}
      {showUI && (
        <button
          onClick={() => {
            const from = searchParams.get("from");
            if (from === "dashboard") {
              router.push("/dashboard");
            } else {
              router.push(`/build?id=${presentationId}`);
            }
          }}
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

      {/* Navigatie onderin */}
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