// src/lib/supabaseServerClient.ts
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export function createSupabaseServerClient() {
  return createServerComponentClient<Database>({ cookies: cookies() });
}
