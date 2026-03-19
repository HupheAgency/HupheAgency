"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/clients/supabaseClient";
import Navbar from "@/components/navbar";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Er ging iets mis bij het registreren.");
    } else {
      if (data.session) {
        router.push("/briefing");
      } else {
        setSuccess(true);
      }
    }
  };

  const handleOAuthSignup = async (provider: "google" | "discord") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/briefing`,
      },
    });

    if (error) {
      setError(`Probleem met ${provider} aanmelding`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">
            Account aanmaken
          </h1>

          <button
            onClick={() => handleOAuthSignup("google")}
            className="w-full mb-3 p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <span className="mr-2">🔍</span> Aanmelden met Google
          </button>

          <button
            onClick={() => handleOAuthSignup("discord")}
            className="w-full mb-3 p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <span className="mr-2">💬</span> Aanmelden met Discord
          </button>

          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="w-full mb-4 p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <span className="mr-2">✉️</span> Aanmelden met e-mail
          </button>

          {showEmailForm && (
            <form onSubmit={handleSubmit} className="mt-2">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                required
              />
              <input
                type="password"
                placeholder="Wachtwoord"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 p-2 border rounded"
                required
              />
              {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
              {success && (
                <p className="text-green-600 text-sm mb-2">
                  Check je e-mail om je account te activeren.
                </p>
              )}
              <button
                type="submit"
                className="bg-black text-white py-2 px-4 rounded w-full"
              >
                Registreren
              </button>
            </form>
          )}

          <p className="text-sm text-center mt-4">
            Al een account?{" "}
            <a href="/login" className="text-blue-600 underline">
              Log in
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
