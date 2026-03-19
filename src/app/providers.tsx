"use client";

import { SupabaseProvider } from "@/context/supabase-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SupabaseProvider>{children}</SupabaseProvider>;
}
