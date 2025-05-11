"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Navbar from "@/components/navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Ongeldige inloggegevens");
    } else {
      router.push("/briefing");
    }
  };

  const handleOAuthLogin = async (provider: "google" | "discord") => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/briefing`, // belangrijk!
      },
    });

    if (error) {
      setError(`Probleem met ${provider} login`);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Inloggen</h1>

          <button
            onClick={() => handleOAuthLogin("google")}
            className="w-full mb-3 p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <span className="mr-2">🔍</span> Inloggen met Google
          </button>

          <button
            onClick={() => handleOAuthLogin("discord")}
            className="w-full mb-3 p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <span className="mr-2">💬</span> Inloggen met Discord
          </button>

          <button
            onClick={() => setShowEmailForm(!showEmailForm)}
            className="w-full mb-4 p-2 border border-gray-300 rounded hover:bg-gray-100 flex items-center justify-center"
          >
            <span className="mr-2">✉️</span> Inloggen met e-mail
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
              <button
                type="submit"
                className="bg-black text-white py-2 px-4 rounded w-full"
              >
                Login
              </button>
            </form>
          )}

          <p className="text-sm text-center mt-4">
            Nog geen account?{" "}
            <a href="/signup" className="text-blue-600 underline">
              Maak er een aan
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
