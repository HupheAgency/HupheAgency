import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/supabase";

export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true, // ✅ Onthoud sessie tussen reloads
      autoRefreshToken: true, // ✅ Vernieuw tokens automatisch
      detectSessionInUrl: true, // ✅ Voor OAuth flows (veiligheidshalve aanlaten)
    },
  }
);
