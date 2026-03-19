"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { createRoot } from "react-dom/client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

import SlideForm from "@/components/SlideForm";
import SortableItem from "@/components/SortableItem";
import Preview from "@/components/Preview";
import { Slide, SlideFormData } from "@/types/slide";

export default function BuildPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const presentationId = searchParams.get("id");

  const [slides, setSlides] = useState<Slide[]>([]);
  const [selectedSlideId, setSelectedSlideId] = useState<string | null>(null);
  const [presentationName, setPresentationName] = useState("");

  const [slideData, setSlideData] = useState<SlideFormData>({
    template: "Intro Slide",
    title: "",
    client: "",
    bodycopy: "",
    imageURL: "",
    videoURL: "",
    moodboardImages: [],
    subheading: "",
  });

  const companyName = "ROORDA · TABULA RASA";
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    if (!presentationId) return;

    const stored = JSON.parse(localStorage.getItem("presentations") || "[]");
    const current = stored.find((p: any) => p.id === presentationId);
    if (current) {
      setPresentationName(current.name);
      setSlides(current.slides || []);
    }
  }, [presentationId]);

  const handleSaveSlide = () => {
    const newSlide: Slide = {
      ...slideData,
      id: selectedSlideId || uuidv4(),
    };

    if (selectedSlideId) {
      setSlides(slides.map((s) => (s.id === selectedSlideId ? newSlide : s)));
    } else {
      setSlides([...slides, newSlide]);
    }

    resetFields();
  };

  const resetFields = () => {
    setSlideData({
      template: "Intro Slide",
      title: "",
      client: "",
      bodycopy: "",
      imageURL: "",
      videoURL: "",
      moodboardImages: [],
      subheading: "",
    });
    setSelectedSlideId(null);
  };

  const handleSelectSlide = (id: string) => {
    const slide = slides.find((s) => s.id === id);
    if (slide) {
      const { id: _, ...data } = slide;
      setSlideData(data);
      setSelectedSlideId(id);
    }
  };

  const handleDeleteSlide = (id: string) => {
    setSlides(slides.filter((s) => s.id !== id));
    if (selectedSlideId === id) resetFields();
  };

  const handleUploadImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSlideData({ ...slideData, imageURL: imageUrl });
    }
  };

  const handleSavePresentation = () => {
    if (!presentationId) {
      alert("Sla het project eerst op.");
      return;
    }

    const stored = JSON.parse(localStorage.getItem("presentations") || "[]");
    const updated = stored.map((p: any) =>
      p.id === presentationId ? { ...p, name: presentationName, slides } : p
    );
    localStorage.setItem("presentations", JSON.stringify(updated));
    alert("Presentatie opgeslagen!");
  };

  const handleExportPDF = async () => {
    if (slides.length === 0) return alert("Geen slides om te exporteren.");

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    for (let i = 0; i < slides.length; i++) {
      const container = document.createElement("div");
      container.className =
        "w-[842px] h-[595px] flex items-center justify-center bg-white p-10";
      document.body.appendChild(container);

      const root = createRoot(container);
      root.render(
        <Preview
          slideData={slides[i]}
          companyName={companyName}
          currentYear={currentYear}
        />
      );

      await new Promise((res) => setTimeout(res, 100));
      const canvas = await html2canvas(container, { scale: 2 });
      const img = canvas.toDataURL("image/png");

      if (i > 0) pdf.addPage();
      pdf.addImage(img, "PNG", 10, 10, 277, 190);
      document.body.removeChild(container);
    }

    pdf.save("presentatie.pdf");
  };

  const handleStartPresentation = () => {
    if (!presentationId) return;
    const slidesParam = encodeURIComponent(JSON.stringify(slides));
    router.push(
      `/present?id=${presentationId}&slides=${slidesParam}&from=build`
    );
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = slides.findIndex((s) => s.id === active.id);
    const newIndex = slides.findIndex((s) => s.id === over.id);

    setSlides(arrayMove(slides, oldIndex, newIndex));
  };

  return (
    <div className="flex">
      <div className="w-1/3 p-5 bg-gray-100 min-h-screen relative pt-16">
        <button
          onClick={() => router.push("/dashboard")}
          className="absolute top-0 left-0 w-full text-black px-4 py-2 text-left hover:underline"
        >
          ← Dashboard
        </button>

        <label className="block text-lg font-bold mb-2">Project</label>
        <div className="flex gap-2">
          <input
            type="text"
            className="w-2/3 p-2 mb-6 border rounded"
            placeholder="Naam van presentatie"
            value={presentationName}
            onChange={(e) => setPresentationName(e.target.value)}
          />
          <button
            onClick={handleSavePresentation}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>

        <SlideForm
          slideData={slideData}
          setSlideData={setSlideData}
          handleUploadImage={handleUploadImage}
          handleSaveSlide={handleSaveSlide}
          selectedSlideId={selectedSlideId}
          resetFields={resetFields}
        />

        <h2 className="font-bold mt-10">Slides</h2>
        <div className="mt-4 overflow-y-auto max-h-[40vh] pr-2">
          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={slides.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {slides.map((slide) => (
                <SortableItem
                  key={slide.id}
                  id={slide.id}
                  slide={slide}
                  isSelected={slide.id === selectedSlideId}
                  onDelete={() => handleDeleteSlide(slide.id)}
                  onSelect={() => handleSelectSlide(slide.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {slides.length > 5 && (
          <div className="flex justify-center mt-3">
            <ChevronDownIcon className="w-5 h-5 text-gray-500" />
          </div>
        )}

        <div className="absolute bottom-5 right-5 flex gap-3">
          <button
            onClick={handleStartPresentation}
            className="bg-blue-600 text-white px-4 py-2 rounded shadow-lg"
          >
            Preview
          </button>
          <button
            onClick={handleExportPDF}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow-lg"
          >
            PDF
          </button>
        </div>
      </div>

      <div className="w-2/3 bg-black text-white min-h-screen flex items-center justify-center">
        <Preview
          slideData={slideData}
          companyName={companyName}
          currentYear={currentYear}
        />
      </div>
    </div>
  );
}
