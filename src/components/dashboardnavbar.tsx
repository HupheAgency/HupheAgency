"use client";

import { supabase } from "@/lib/clients/supabaseClient";
import { useSupabase } from "@/context/supabase-context";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  User,
  Eye,
  Settings,
  CreditCard,
  FileText,
  LogOut,
} from "lucide-react";

// ✅ buiten de component zodat hij niet gereset wordt bij re-render
let didJustLogout = false;

export default function DashboardNavbar() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { supabase, session } = useSupabase();

  useEffect(() => {
    if (session === undefined) return; // Wacht tot session geladen is

    const currentPath = window.location.pathname;

    if (session === null && currentPath.startsWith("/dashboard")) {
      if (didJustLogout) {
        didJustLogout = false;
        return;
      }
      router.push("/login");
    } else if (session) {
      setUserEmail(session.user?.email ?? "");
    }
  }, [session, router]);

  const handleLogout = async () => {
    didJustLogout = true;
    await supabase.auth.signOut();
    router.push("/"); // direct naar homepage
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowMenu(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowMenu(false), 150);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="text-lg font-bold text-black">📂 Huphe Dashboard</div>

      <div className="flex gap-6 text-gray-700 text-sm items-center">
        <Link href="/dashboard/briefing" className="hover:text-black">
          Nieuw project
        </Link>
        <Link href="/dashboard/projects" className="hover:text-black">
          Projecten
        </Link>

        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button className="hover:text-black">
            <User size={20} />
          </button>

          <div className="absolute top-full left-0 w-full h-2" />

          {showMenu && (
            <div className="absolute right-0 mt-2 bg-white border shadow-md rounded text-sm w-60 z-50">
              <Link
                href="/account"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <Eye size={16} /> View profile
              </Link>
              <Link
                href="/account/manage"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <Settings size={16} /> Manage account
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <CreditCard size={16} /> Plans & Pricing
              </Link>
              <Link
                href="/invoices"
                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <FileText size={16} /> Invoices
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500"
              >
                <LogOut size={16} /> Log out
              </button>

              <div className="px-4 py-2 border-t text-xs text-gray-500">
                <p className="mb-1">0% credits used</p>
                <div className="w-full h-1 bg-gray-200 rounded">
                  <div className="w-0 h-1 bg-gray-400 rounded" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
