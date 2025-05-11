"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  console.log("✅ AuthProvider component geladen");

  useEffect(() => {
    const initAuth = async () => {
      const url = new URL(window.location.href);
      const hasCode = url.searchParams.get("code");
      const codeVerifier = localStorage.getItem("supabase.auth.code_verifier");

      if (hasCode && codeVerifier) {
        console.log("🔁 OAuth redirect met geldige code & verifier");

        const { error } = await supabase.auth.exchangeCodeForSession();
        if (error) {
          console.error("❌ exchangeCodeForSession mislukt:", error.message);
        } else {
          console.log("✅ exchangeCodeForSession gelukt");
          window.history.replaceState({}, document.title, url.pathname);
        }
      } else if (hasCode && !codeVerifier) {
        console.warn(
          "⚠️ Code gevonden maar géén code_verifier. Skipping exchange."
        );
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("❌ Fout bij ophalen sessie:", sessionError.message);
      }

      if (session?.user) {
        setUser(session.user);
        console.log("🔐 Sessiegebruiker actief:", session.user.email);
        router.push("/briefing");
      } else {
        setUser(null);
      }

      setLoading(false);
    };

    initAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("📣 Auth event:", event, session?.user);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === "SIGNED_IN") {
          console.log("➡️ Redirect naar /briefing na login");
          router.push("/briefing");
        }

        if (event === "SIGNED_OUT") {
          console.log("🚪 Uitgelogd, terug naar login");
          router.push("/login");
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthProvider;
