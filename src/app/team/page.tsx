// app/team/page.tsx

import Image from "next/image";
import { supabase } from "@/lib/clients/supabaseBrowserClient";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  photo_url: string | null;
}

export default async function TeamPage() {
  const { data: members, error } = await supabase
    .from("team_members")
    .select("id, name, role, photo_url")
    .order("name");

  if (error) {
    console.error("Fout bij ophalen teamleden:", error.message);
    return <p>❌ Er ging iets mis bij het laden van het team.</p>;
  }

  return (
    <div className="p-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">👥 Ons Team</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {members?.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded shadow p-4 text-center hover:shadow-lg transition"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full overflow-hidden">
              <Image
                src={
                  member.photo_url
                    ? `/team/${member.photo_url}`
                    : "/team/placeholder.jpeg"
                }
                alt={member.name}
                width={96}
                height={96}
                className="object-cover w-full h-full"
              />
            </div>
            <h3 className="font-semibold text-lg">{member.name}</h3>
            <p className="text-sm text-gray-500">{member.role}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
