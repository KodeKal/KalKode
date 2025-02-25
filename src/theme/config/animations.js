// Save at: src/styles/animations.js

import { keyframes, css } from 'styled-components';

// Basic animations
export const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

export const glow = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 107, 74, 0.5); }
  50% { box-shadow: 0 0 20px rgba(255, 107, 74, 0.8); }
  100% { box-shadow: 0 0 5px rgba(255, 107, 74, 0.5); }
`;

export const grow = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

export const drift = keyframes`
  0% { transform: translateX(0); }
  50% { transform: translateX(10px); }
  100% { transform: translateX(0); }
`;

// Premium theme animations
export const shock = keyframes`
  0% { transform: translate(0, 0); }
  25% { transform: translate(2px, -2px); }
  50% { transform: translate(-2px, 2px); }
  75% { transform: translate(2px, -2px); }
  100% { transform: translate(0, 0); }
`;

export const warp = keyframes`
  0% { transform: perspective(500px) rotateY(0); }
  50% { transform: perspective(500px) rotateY(180deg); }
  100% { transform: perspective(500px) rotateY(360deg); }
`;

export const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 0, 0, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(139, 0, 0, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(139, 0, 0, 0); }
`;

export const glitch = keyframes`
  0% { clip-path: inset(50% 0 30% 0); }
  20% { clip-path: inset(20% 0 60% 0); }
  40% { clip-path: inset(40% 0 40% 0); transform: translate(-5px); }
  60% { clip-path: inset(60% 0 20% 0); transform: translate(5px); }
  80% { clip-path: inset(30% 0 50% 0); }
  100% { clip-path: inset(50% 0 30% 0); }
`;

// Transition animations
export const ripple = keyframes`
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(4); opacity: 0; }
`;

export const burn = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

export const sprout = keyframes`
  0% { transform: scale(0) rotate(0deg); }
  50% { transform: scale(1.2) rotate(180deg); }
  100% { transform: scale(1) rotate(360deg); }
`;

export const fade = keyframes`
  0% { opacity: 0; transform: translateY(20px); }
  100% { opacity: 1; transform: translateY(0); }
`;

// Animation mixins
export const getThemeAnimation = (theme, type) => {
  const animations = {
    water: css`
      animation: ${float} 3s ease-in-out infinite;
    `,
    fire: css`
      animation: ${burn} 3s ease-in-out infinite;
      background: linear-gradient(45deg, 
        ${theme.colors.primary}, 
        ${theme.colors.secondary}, 
        ${theme.colors.accent}
      );
      background-size: 200% 200%;
    `,
    earth: css`
      animation: ${grow} 2s ease-in-out infinite;
    `,
    air: css`
      animation: ${drift} 3s ease-in-out infinite;
    `,
    thunder: css`
      animation: ${shock} 0.5s ease-in-out infinite;
    `,
    void: css`
      animation: ${warp} 3s ease-in-out infinite;
    `,
    'blood-moon': css`
      animation: ${pulse} 2s ease-in-out infinite;
    `,
    'cyber-neon': css`
      animation: ${glitch} 2s steps(100) infinite;
    `
  };

  return animations[theme.id] || '';
};

// Hover effect mixins
export const getHoverAnimation = (theme) => css`
  transition: all 0.3s ease;
  
  &:hover {
    ${getThemeAnimation(theme, 'hover')}
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  }
`;

// Button animation mixins
export const getButtonAnimation = (theme) => css`
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;

  &:before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: ${theme.colors.accent};
    border-radius: 50%;
    transform: translate(-50%, -50%);
    opacity: 0;
  }

  &:hover:before {
    width: 300px;
    height: 300px;
    opacity: 0.1;
    animation: ${ripple} 0.8s ease-out;
  }

  ${getHoverAnimation(theme)}
`;
