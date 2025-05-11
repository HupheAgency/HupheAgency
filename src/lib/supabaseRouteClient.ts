// src/lib/supabaseRouteClient.ts
import { cookies } from "next/headers";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";

export function createSupabaseRouteClient() {
  return createRouteHandlerClient<Database>({ cookies: cookies() });
}
