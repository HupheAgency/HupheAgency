"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth
      .getSessionFromUrl()
      .then(() => {
        router.replace("/briefing"); // Of waar je naartoe wilt
      })
      .catch((error) => {
        console.error("❌ Fout bij sessie ophalen van URL:", error);
      });
  }, [router]);

  return <p className="p-6">🔄 Authenticatie wordt afgerond...</p>;
}
