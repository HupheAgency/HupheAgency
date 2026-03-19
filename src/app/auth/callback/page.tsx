"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/context/supabase-context";

export default function AuthCallbackPage() {
  const { session } = useSupabase();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/dashboard/briefing");
    }
  }, [session]);

  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Even laden…</p>;
}
