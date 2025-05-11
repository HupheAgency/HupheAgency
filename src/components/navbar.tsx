"use client";

import Link from "next/link";
import { useState, useRef } from "react";

export default function Navbar() {
  const [showSolutions, setShowSolutions] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowSolutions(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowSolutions(false), 150);
  };

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-4 flex justify-between items-center sticky top-0 z-50">
      {/* Logo */}
      <div className="text-xl font-bold tracking-tight text-black">
        Huphe Agency
      </div>

      {/* Menu */}
      <div className="hidden md:flex gap-6 text-gray-700">
        <div
          className="relative cursor-pointer"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <span>Solutions</span>

          {/* Onzichtbare hoverbuffer */}
          <div className="absolute top-full left-0 w-full h-2"></div>

          {showSolutions && (
            <div className="absolute top-full mt-2 bg-white border shadow rounded w-40 text-sm text-left z-10">
              <a className="block px-4 py-2 hover:bg-gray-100" href="#">
                Campagne
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="#">
                Strategie
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="#">
                Huisstijl
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="#">
                Fotografie
              </a>
              <a className="block px-4 py-2 hover:bg-gray-100" href="#">
                Gemaakt werk
              </a>
            </div>
          )}
        </div>

        <a href="#" className="hover:text-black">
          Resources
        </a>
        <a href="#" className="hover:text-black">
          Pricing
        </a>
      </div>

      {/* Auth */}
      <div className="flex gap-4 items-center">
        <Link href="/login" className="text-gray-700 hover:text-black">
          Login
        </Link>
        <Link
          href="/signup"
          className="bg-black text-white px-4 py-2 rounded-xl text-sm font-medium"
        >
          Sign Up
        </Link>
      </div>
    </nav>
  );
}
