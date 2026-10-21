import React from 'react';

/**
 * Reusable AuraForcz Brand Logo Component
 * Matches the exact index/landing page pinwheel emblem and typography
 */
export default function AuraLogo({
  className = "w-9 h-9",
  textClassName = "text-2xl font-black",
  theme = "light", // 'light' | 'dark'
  showText = true,
  subtitle = null
}) {
  const isDark = theme === 'dark' || (typeof textClassName === 'string' && textClassName.includes('text-white'));

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Exact auraForcz 4-vane pinwheel logo mark */}
      <div className={`relative ${className} flex items-center justify-center shrink-0`}>
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xs" fill="none">
          {/* Top Cyan Vane */}
          <path
            d="M50 10 C68 10 82 22 86 38 C87 44 82 48 76 45 C67 40 60 30 50 24 C40 18 30 17 22 22 C30 14 40 10 50 10 Z"
            fill="#00b4d8"
          />
          {/* Right Pink Vane */}
          <path
            d="M90 50 C90 68 78 82 62 86 C56 87 52 82 55 76 C60 67 70 60 76 50 C82 40 83 30 78 22 C86 30 90 40 90 50 Z"
            fill="#ec4899"
          />
          {/* Bottom Orange Vane */}
          <path
            d="M50 90 C32 90 18 78 14 62 C13 56 18 52 24 55 C33 60 40 70 50 76 C60 82 70 83 78 78 C70 86 60 90 50 90 Z"
            fill="#f97316"
          />
          {/* Left Purple Vane */}
          <path
            d="M10 50 C10 32 22 18 38 14 C44 13 48 18 45 24 C40 33 30 40 24 50 C18 60 17 70 22 78 C14 70 10 60 10 50 Z"
            fill="#8b5cf6"
          />
          {/* Inner rounded diamond */}
          <rect
            x="34"
            y="34"
            width="32"
            height="32"
            rx="7"
            transform="rotate(45 50 50)"
            fill="#ffffff"
          />
          {/* Center Blue/Indigo Dot */}
          <circle cx="50" cy="50" r="6" fill="#4f46e5" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center">
          <span className={`${textClassName} tracking-tight font-extrabold flex items-center leading-none`}>
            <span className={isDark ? "text-white" : "text-[#0d1527]"}>aura</span>
            <span className={isDark ? "bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent" : "bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] bg-clip-text text-transparent"}>
              Forcz
            </span>
          </span>
          {subtitle && (
            <span className={`text-[10px] font-semibold tracking-wider uppercase mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export { AuraLogo };
