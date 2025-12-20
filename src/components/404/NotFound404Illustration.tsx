/**
 * Ilustração SVG customizada para página 404
 * Conceito: Casa/prédio "perdido" com bússola/mapa ao fundo
 * Paleta: Pharos Navy 900, Blue 500, Gold 500
 */

import React from 'react';

export default function NotFound404Illustration() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <svg
        viewBox="0 0 400 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full animate-float"
        aria-hidden="true"
      >
        {/* Background Circle - Subtle gradient */}
        <circle
          cx="200"
          cy="200"
          r="180"
          fill="url(#bgGradient)"
          opacity="0.1"
        />

        {/* Compass Background */}
        <g opacity="0.3">
          <circle
            cx="200"
            cy="200"
            r="150"
            stroke="#ADB4C0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
          <circle
            cx="200"
            cy="200"
            r="120"
            stroke="#ADB4C0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        </g>

        {/* Compass Needle */}
        <g className="animate-spin-slow" style={{ transformOrigin: '200px 200px' }}>
          <path
            d="M200 80 L210 190 L200 200 L190 190 Z"
            fill="#054ADA"
            opacity="0.6"
          />
          <path
            d="M200 320 L210 210 L200 200 L190 210 Z"
            fill="#C89C4D"
            opacity="0.6"
          />
          <circle cx="200" cy="200" r="8" fill="#192233" />
        </g>

        {/* Building - Lost in space */}
        <g className="animate-float-delayed">
          {/* Building base */}
          <rect
            x="140"
            y="180"
            width="120"
            height="140"
            rx="4"
            fill="#192233"
          />
          
          {/* Windows - Left side */}
          <rect x="155" y="200" width="15" height="18" rx="2" fill="#054ADA" opacity="0.7" />
          <rect x="155" y="230" width="15" height="18" rx="2" fill="#054ADA" opacity="0.5" />
          <rect x="155" y="260" width="15" height="18" rx="2" fill="#054ADA" opacity="0.7" />
          <rect x="155" y="290" width="15" height="18" rx="2" fill="#054ADA" opacity="0.5" />

          {/* Windows - Middle */}
          <rect x="185" y="200" width="15" height="18" rx="2" fill="#054ADA" opacity="0.5" />
          <rect x="185" y="230" width="15" height="18" rx="2" fill="#054ADA" opacity="0.7" />
          <rect x="185" y="260" width="15" height="18" rx="2" fill="#054ADA" opacity="0.5" />
          <rect x="185" y="290" width="15" height="18" rx="2" fill="#054ADA" opacity="0.7" />

          {/* Windows - Right side */}
          <rect x="215" y="200" width="15" height="18" rx="2" fill="#054ADA" opacity="0.7" />
          <rect x="215" y="230" width="15" height="18" rx="2" fill="#054ADA" opacity="0.5" />
          <rect x="215" y="260" width="15" height="18" rx="2" fill="#054ADA" opacity="0.7" />
          <rect x="215" y="290" width="15" height="18" rx="2" fill="#054ADA" opacity="0.5" />

          {/* Roof */}
          <path
            d="M130 180 L200 150 L270 180 L260 180 L200 160 L140 180 Z"
            fill="#C89C4D"
          />

          {/* Gold accent on top */}
          <rect x="195" y="145" width="10" height="35" fill="#C89C4D" />
          <circle cx="200" cy="142" r="6" fill="#C89C4D" />
        </g>

        {/* Question marks floating around */}
        <text
          x="100"
          y="120"
          fontSize="32"
          fill="#054ADA"
          opacity="0.3"
          className="animate-pulse-slow"
        >
          ?
        </text>
        <text
          x="290"
          y="160"
          fontSize="28"
          fill="#C89C4D"
          opacity="0.3"
          className="animate-pulse-slow"
          style={{ animationDelay: '0.5s' }}
        >
          ?
        </text>
        <text
          x="310"
          y="280"
          fontSize="24"
          fill="#054ADA"
          opacity="0.3"
          className="animate-pulse-slow"
          style={{ animationDelay: '1s' }}
        >
          ?
        </text>

        {/* Map lines in background */}
        <g opacity="0.15" stroke="#192233" strokeWidth="2" strokeLinecap="round">
          <line x1="60" y1="100" x2="120" y2="100" />
          <line x1="280" y1="100" x2="340" y2="100" />
          <line x1="60" y1="300" x2="120" y2="300" />
          <line x1="280" y1="300" x2="340" y2="300" />
          <line x1="100" y1="60" x2="100" y2="120" />
          <line x1="300" y1="60" x2="300" y2="120" />
          <line x1="100" y1="280" x2="100" y2="340" />
          <line x1="300" y1="280" x2="300" y2="340" />
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#054ADA" />
            <stop offset="100%" stopColor="#192233" />
          </linearGradient>
        </defs>
      </svg>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-15px) rotate(2deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 4s ease-in-out infinite;
          transform-origin: center;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-float,
          .animate-float-delayed,
          .animate-spin-slow,
          .animate-pulse-slow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}




