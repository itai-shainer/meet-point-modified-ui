import React from "react";

export default function MeetPointLogo({ size = "md" }) {
  const dimensions = {
    sm: { container: "w-10 h-10", svg: 40 },
    md: { container: "w-14 h-14", svg: 56 },
    lg: { container: "w-16 h-16", svg: 64 },
  };
  const { container, svg } = dimensions[size] || dimensions.md;

  return (
    <div className={`${container} rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg flex items-center justify-center flex-shrink-0`}>
      <svg width={svg * 0.72} height={svg * 0.72} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Map body */}
        <path
          d="M5 14 L20 10 L35 14 L35 32 L20 28 L5 32 Z"
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="rgba(255,255,255,0.15)"
        />
        {/* Dashed route on map */}
        <path
          d="M10 26 Q14 22 18 24 Q22 26 26 20"
          stroke="rgba(255,255,255,0.7)"
          strokeWidth="1.5"
          strokeDasharray="2.5 2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Pin stem */}
        <line x1="20" y1="10" x2="20" y2="18" stroke="white" strokeWidth="2" strokeLinecap="round" />
        {/* Pin head circle outer */}
        <circle cx="20" cy="7" r="5" fill="white" opacity="0.95" />
        {/* Pin head circle inner */}
        <circle cx="20" cy="7" r="2.2" fill="url(#pinInner)" />
        <defs>
          <linearGradient id="pinInner" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}