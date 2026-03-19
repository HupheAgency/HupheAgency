"use client";

import { useUser } from "@/lib/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UserSessionProvider() {
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // wacht tot useUser klaar is

    if (!user) {
      // Redirect alleen als er écht geen sessie is
      router.replace("/login"); // 'replace' voorkomt back naar protected page
    }
  }, [user, loading, router]);

  return null; // geen visuele output
}
