// Save at: src/components/ThemePatterns/index.js

import React from 'react';

export const OceanPattern = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="oceanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1E3D59" stopOpacity="1"/>
        <stop offset="100%" stopColor="#2D6187" stopOpacity="1"/>
      </linearGradient>
      <pattern id="oceanWaves" width="100" height="20" patternUnits="userSpaceOnUse">
        <path
          d="M0 20c5-8 15-8 20 0s15 8 20 0 15-8 20 0 15 8 20 0 15-8 20 0"
          fill="none"
          stroke="rgba(65, 179, 211, 0.2)"
          strokeWidth="2"
        >
          <animate
            attributeName="d"
            dur="5s"
            repeatCount="indefinite"
            values="
              M0 20c5-8 15-8 20 0s15 8 20 0 15-8 20 0 15 8 20 0 15-8 20 0;
              M0 20c5 8 15-8 20 0s15-8 20 0 15 8 20 0 15-8 20 0 15 8 20 0;
              M0 20c5-8 15-8 20 0s15 8 20 0 15-8 20 0 15 8 20 0 15-8 20 0"
          />
        </path>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#oceanGradient)"/>
    <rect width="100%" height="100%" fill="url(#oceanWaves)"/>
  </svg>
);

export const FlamePattern = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="flameGradient" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#CD2B2B" stopOpacity="1"/>
        <stop offset="100%" stopColor="#FF6B4A" stopOpacity="1"/>
      </linearGradient>
      <filter id="flameDisplacement">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01"
          numOctaves="3"
          seed="1"
        >
          <animate
            attributeName="baseFrequency"
            dur="20s"
            values="0.01;0.015;0.01"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="30"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#flameGradient)"/>
    <rect
      width="100%"
      height="100%"
      fill="rgba(255, 107, 74, 0.2)"
      filter="url(#flameDisplacement)"
    />
  </svg>
);

export const ForestPattern = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="forestGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2D4A22" stopOpacity="1"/>
        <stop offset="100%" stopColor="#5C832F" stopOpacity="1"/>
      </linearGradient>
      <pattern id="leaves" width="50" height="50" patternUnits="userSpaceOnUse">
        <path
          d="M25 0c-5 10-10 15-25 15 15 0 20 5 25 15 5-10 10-15 25-15-15 0-20-5-25-15z"
          fill="rgba(152, 195, 121, 0.1)"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 25 15"
            to="360 25 15"
            dur="60s"
            repeatCount="indefinite"
          />
        </path>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#forestGradient)"/>
    <rect width="100%" height="100%" fill="url(#leaves)"/>
  </svg>
);

export const CloudPattern = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="cloudGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#6E85B7" stopOpacity="1"/>
        <stop offset="100%" stopColor="#C4D7E0" stopOpacity="1"/>
      </linearGradient>
      <pattern id="clouds" width="100" height="50" patternUnits="userSpaceOnUse">
        <path
          d="M0 25q25-25 50 0t50 0"
          fill="none"
          stroke="rgba(248, 249, 250, 0.2)"
          strokeWidth="2"
        >
          <animate
            attributeName="d"
            dur="10s"
            repeatCount="indefinite"
            values="
              M0 25q25-25 50 0t50 0;
              M0 25q25 25 50 0t50 0;
              M0 25q25-25 50 0t50 0"
          />
        </path>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#cloudGradient)"/>
    <rect width="100%" height="100%" fill="url(#clouds)"/>
  </svg>
);

export const ElectricPattern = () => (
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
    <defs>
      <linearGradient id="electricGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4A0E5C" stopOpacity="1"/>
        <stop offset="100%" stopColor="#7B1FA2" stopOpacity="1"/>
      </linearGradient>
      <filter id="lightning">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01"
          numOctaves="3"
          seed="2"
        >
          <animate
            attributeName="seed"
            dur="1s"
            values="2;4;2"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap in="SourceGraphic" scale="10"/>
      </filter>
    </defs>
    <rect width="100%" height="100%" fill="url(#electricGradient)"/>
    <path
      d="M50 0L45 40L60 45L40 100L55 60L40 55L50 0Z"
      fill="#FFC107"
      opacity="0.3"
      filter="url(#lightning)"
    >
      <animate
        attributeName="opacity"
        dur="2s"
        values="0.3;0.5;0.3"
        repeatCount="indefinite"
      />
    </path>
  </svg>
);
