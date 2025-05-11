"use client";

import AuthProvider from "@/context/AuthProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  console.log("✅ Providers component is gerenderd");
  return <AuthProvider>{children}</AuthProvider>;
}
