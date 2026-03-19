// src/lib/clients/supabaseServerClient.ts
import { createServerComponentClient } from "supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/supabase";

export function supabaseServerClient() {
  return createServerComponentClient<Database>({
    cookies,
  });
}
