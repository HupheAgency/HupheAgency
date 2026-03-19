// src/lib/clients/supabaseRouteClient.ts
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export function createSupabaseRouteClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options) {
          // Alleen beschikbaar in middleware / edge context – veilig te checken
          cookieStore.set?.(name, value, options);
        },
        remove(name: string, options) {
          cookieStore.set?.(name, "", { ...options, maxAge: -1 });
        },
      },
    }
  );
}
