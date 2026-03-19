"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/clients/supabaseBrowserClient";

type FileEntry = {
  title: string;
  content: string; // image URL
  created_at: string;
  type: string;
};

export default function ViewerTool() {
  const { viewerId } = useParams();
  const [imageData, setImageData] = useState<FileEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImage = async () => {
      if (!viewerId || typeof viewerId !== "string") return;

      const { data, error } = await supabase
        .from("project_files")
        .select("title, content, created_at, type")
        .eq("id", viewerId)
        .eq("type", "image")
        .single();

      if (!error && data) {
        setImageData(data);
      }

      setLoading(false);
    };

    fetchImage();
  }, [viewerId]);

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-gray-600">
        Beeld wordt geladen...
      </div>
    );
  }

  if (!imageData) {
    return (
      <div className="w-full h-screen flex items-center justify-center text-red-600">
        Geen beeld gevonden.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-8 bg-white">
      <h1 className="text-3xl font-bold mb-2">{imageData.title}</h1>
      <p className="text-sm text-gray-500 mb-6">
        Toegevoegd op {new Date(imageData.created_at).toLocaleString()}
      </p>

      <div className="rounded overflow-hidden shadow-md max-w-5xl mx-auto">
        <img
          src={imageData.content}
          alt={imageData.title}
          className="w-full object-contain rounded"
        />
      </div>
    </div>
  );
}
