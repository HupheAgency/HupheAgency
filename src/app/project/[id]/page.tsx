"use client";

import { useEffect, useState } from "react";
import DashboardNavbar from "@/components/dashboardnavbar";
import Link from "next/link";
import { fetchProjects } from "@/lib/queries"; // dit is jouw Supabase call

type Project = {
  id: string;
  title: string;
  created_at: string;
  status: "Actief" | "Afgerond";
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;

    const { email } = JSON.parse(user);

    fetchProjects(email).then((data) => {
      setProjects(data);
    });
  }, []);

  return (
    <>
      <DashboardNavbar />
      <div className="px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Jouw projecten</h1>

        {projects.length === 0 ? (
          <p className="text-gray-600">
            Je hebt nog geen projecten aangemaakt.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="border rounded-xl p-4 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold">{project.title}</h2>
                <p className="text-sm text-gray-500 mb-2">
                  Aangemaakt op:{" "}
                  {new Date(project.created_at).toLocaleDateString()}
                </p>
                <span
                  className={`inline-block px-3 py-1 text-xs rounded-full ${
                    project.status === "Actief"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {project.status}
                </span>
                <div className="mt-4">
                  <Link
                    href={`/project/${project.id}`}
                    className="text-blue-600 text-sm hover:underline"
                  >
                    Bekijk project →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
