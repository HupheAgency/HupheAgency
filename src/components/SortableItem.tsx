"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Slide } from "@/types/slide";

interface SortableItemProps {
  id: string;
  slide: Slide;
  onDelete: () => void;
  onSelect: () => void;
  isSelected: boolean;
}

export default function SortableItem({
  id,
  slide,
  onDelete,
  onSelect,
  isSelected,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-3 border rounded mb-2 flex justify-between items-center ${
        isSelected ? "bg-blue-100 border-blue-500" : "bg-white"
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab mr-3 text-gray-400"
        title="Sleep om te verplaatsen"
      >
        ☰
      </div>

      <div className="flex-1 cursor-pointer" onClick={onSelect}>
        <div className="font-semibold">{slide.title || "Geen titel"}</div>
        <div className="text-sm text-gray-500">{slide.template}</div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="text-red-500 font-bold text-lg"
        title="Verwijderen"
      >
        ❌
      </button>
    </div>
  );
}
