"use client";

import React from "react";

interface CirclePieProps {
  percentage: number; // van 0 tot 100
  size?: number; // diameter in pixels (optioneel)
  strokeWidth?: number; // lijndikte (optioneel)
}

export function CirclePie({
  percentage,
  size = 80,
  strokeWidth = 8,
}: CirclePieProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e5e7eb" // lichtgrijs
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#111827" // zwart
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.4s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black">
        {percentage}%
      </div>
    </div>
  );
}
