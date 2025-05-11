"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewProjectRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/briefing");
  }, [router]);

  return null;
}
