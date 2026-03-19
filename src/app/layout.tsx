console.log("🧱 Layout geladen");

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import dynamic from "next/dynamic";
import { SupabaseProvider } from "@/context/supabase-context"; // ✅ toegevoegde regel

// Dynamic import voorkomt hydration issues
const UserSessionProvider = dynamic(
  () => import("@/components/UserSessionProvider"),
  { ssr: false }
);

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Huphe Agency",
  description: "Strategisch AI-bureau dat ideeën bouwt met creatieve agents",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <SupabaseProvider>
            {" "}
            {/* ✅ FIX: voeg Supabase context toe */}
            <UserSessionProvider />
            {children}
          </SupabaseProvider>
        </Providers>
      </body>
    </html>
  );
}
