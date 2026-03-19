"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboardnavbar";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/context/supabase-context";
import ProjectCard from "@/components/project/ProjectCard";

type Project = {
  id: string;
  title: string;
  status: string;
  created_at: string;
  updated_at?: string;
  color?: string;
  tags?: string[];
  team?: string[];
  archived?: boolean;
};

export default function ProjectsPage() {
  const { session, supabase, loading } = useSupabase();
  const user = session?.user;
  const router = useRouter();

  const [projects, setProjects] = useState<Project[] | null>(null);
  const [fetching, setFetching] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;

    const fetchProjects = async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Project ophalen fout:", error);
        setProjects([]);
      } else {
        setProjects(data);
      }

      setFetching(false);
    };

    fetchProjects();
  }, [user, supabase]);

  const filteredProjects = projects?.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNewProject = async () => {
    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: "Nieuw project",
        status: "Actief",
        archived: false,
        color: "#4F46E5",
        tags: [],
        team: [],
      })
      .select()
      .single();

    if (error || !data) {
      console.error("❌ Kan nieuw project niet aanmaken:", error);
      return;
    }

    router.push(`/project/${data.id}`);
  };

  if (loading || (!user && typeof window !== "undefined")) return null;

  return (
    <>
      <DashboardNavbar />
      <div className="px-6 py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Jouw projecten</h1>
          <button
            onClick={handleNewProject}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            + Nieuw project
          </button>
        </div>

        <input
          type="text"
          placeholder="Zoek projecten..."
          className="w-full p-3 border rounded mb-6"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {fetching ? (
          <p className="text-gray-500">📦 Projecten worden geladen...</p>
        ) : !filteredProjects || filteredProjects.length === 0 ? (
          <p className="text-gray-600">Geen projecten gevonden.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                id={project.id}
                title={project.title}
                status={project.status}
                created_at={project.created_at}
                updated_at={project.updated_at}
                tags={project.tags}
                teamMembers={project.team}
                slideCount={undefined}
                onDeleted={() => {
                  setProjects(
                    (prev) => prev?.filter((p) => p.id !== project.id) || null
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
