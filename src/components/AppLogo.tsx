import React from "react";

interface AppLogoProps {
  className?: string;
  size?: number;
  glow?: boolean;
}

export function AppLogo({ className = "", size = 48, glow = true }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} ${glow ? "drop-shadow-[0_0_15px_rgba(139,92,246,0.65)]" : ""}`}
    >
      <defs>
        {/* Core Flame/Spark Gradient */}
        <linearGradient id="sparkGrad" x1="15%" y1="10%" x2="85%" y2="90%">
          <stop offset="0%" stopColor="#EC4899" /> {/* Pink */}
          <stop offset="50%" stopColor="#8B5CF6" /> {/* Violet */}
          <stop offset="100%" stopColor="#6366F1" /> {/* Indigo */}
        </linearGradient>

        {/* Ambient Outer Glow Gradient */}
        <linearGradient id="glowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
        </linearGradient>

        {/* Background Circular Ring Gradient */}
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Decorative Outer Aura */}
      <circle cx="50" cy="50" r="46" fill="url(#glowGrad)" />

      {/* Elegant Glassy Circular border */}
      <circle
        cx="50"
        cy="50"
        r="44"
        stroke="url(#ringGrad)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Inner spark/flame vector shape */}
      <path
        d="M50 8C50 8, 59 31, 59 44C59 55, 49 61, 49 61C49 61, 57 58, 62 50C67 42, 69 33, 69 33C69 33, 76 49, 70 65C64 81, 47 88, 38 80C29 72, 31 56, 38 45C45 34, 50 8, 50 8Z"
        fill="url(#sparkGrad)"
        fillRule="evenodd"
        clipRule="evenodd"
      />

      {/* Inner secondary glowing spark core */}
      <path
        d="M50 25C50 25, 55 40, 55 49C55 56, 49 60, 49 60C49 60, 54 58, 57 53C60 48, 61 42, 61 42C61 42, 65 52, 61 62C57 72, 47 76, 41 71C35 66, 36 56, 41 49C46 42, 50 25, 50 25Z"
        fill="#FFFFFF"
        opacity="0.35"
        fillRule="evenodd"
        clipRule="evenodd"
      />

      {/* Floating Spark dots around */}
      <circle cx="28" cy="35" r="2" fill="#EC4899" className="animate-pulse" />
      <circle cx="72" cy="45" r="2.5" fill="#8B5CF6" />
      <circle cx="68" cy="22" r="1.5" fill="#6366F1" className="animate-pulse" />
    </svg>
  );
}
