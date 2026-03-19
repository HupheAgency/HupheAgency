"use client";

import Link from "next/link";
import { useSupabase } from "@/context/supabase-context";
import { useState } from "react";

interface ProjectCardProps {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string;
  tags?: string[];
  teamMembers?: string[];
  slideCount?: number;
  onDeleted?: () => void;
}

export default function ProjectCard({
  id,
  title,
  status,
  created_at,
  updated_at,
  tags = [],
  teamMembers = [],
  slideCount,
  onDeleted,
}: ProjectCardProps) {
  const { supabase } = useSupabase();
  const [archived, setArchived] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    const confirmed = confirm(
      "Weet je zeker dat je dit project wilt verwijderen?"
    );
    if (!confirmed) return;

    setLoading(true);
    await supabase.from("projects").delete().eq("id", id);
    setLoading(false);
    onDeleted?.();
  };

  const handleArchiveToggle = async () => {
    const newStatus = status === "Gearchiveerd" ? "Actief" : "Gearchiveerd";
    await supabase.from("projects").update({ status: newStatus }).eq("id", id);
    setArchived(newStatus === "Gearchiveerd");
  };

  const statusColor =
    status === "Actief"
      ? "bg-green-100 text-green-700"
      : status === "Afgerond"
      ? "bg-gray-200 text-gray-600"
      : "bg-yellow-100 text-yellow-700";

  return (
    <div className="border rounded-xl p-4 shadow-sm hover:shadow-md transition relative">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-gray-400"></span>
            {title}
          </h2>
          <p className="text-sm text-gray-500">
            Aangemaakt op: {new Date(created_at).toLocaleDateString("nl-NL")}
          </p>
          {updated_at && (
            <p className="text-xs text-gray-400">
              Laatst bewerkt: {new Date(updated_at).toLocaleDateString("nl-NL")}
            </p>
          )}
          {slideCount !== undefined && (
            <p className="text-xs text-gray-500 mt-1">Slides: {slideCount}</p>
          )}
          {tags.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColor}`}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <Link
          href={`/project/${id}`}
          className="text-blue-600 text-sm hover:underline"
        >
          Bekijk project →
        </Link>
        <button
          onClick={handleArchiveToggle}
          className="text-sm text-yellow-600 hover:underline"
        >
          {status === "Gearchiveerd" ? "Activeer" : "Archiveer"}
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-sm text-red-500 hover:underline"
        >
          Verwijder
        </button>
      </div>

      {teamMembers.length > 0 && (
        <div className="mt-4 flex -space-x-2">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="w-8 h-8 rounded-full bg-gray-300 text-xs font-bold flex items-center justify-center border-2 border-white"
              title={member}
            >
              {member[0]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
