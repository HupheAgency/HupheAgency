"use client";

import { useSupabase } from "@/context/supabase-context";

export default function DebugPage() {
  const { user, loading } = useSupabase();

  if (loading) return <p>🔄 Bezig met laden...</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">🔍 Debug</h1>
      <p>{user ? `Ingelogd als: ${user.email}` : "Niet ingelogd"}</p>
    </div>
  );
}
