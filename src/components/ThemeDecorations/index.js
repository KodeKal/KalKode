// src/components/ThemeDecorations/index.js - Simplified
import React from 'react';
import styled, { keyframes } from 'styled-components';

// Simple animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
`;

const drift = keyframes`
  0% { transform: translateX(-20px); }
  100% { transform: translateX(20px); }
`;

// Simple decoration container
const DecorationContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
`;

// Generic decorative elements
const FloatingElement = styled.div`
  position: absolute;
  font-size: ${props => props.size || '24px'};
  opacity: 0.2;
  animation: ${float} ${props => props.duration || '4s'} ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  top: ${props => props.top || '20%'};
  left: ${props => props.left || '20%'};
  color: ${props => props.theme?.colors?.accent || '#800000'};
`;

const PulsingDot = styled.div`
  position: absolute;
  width: ${props => props.size || '8px'};
  height: ${props => props.size || '8px'};
  background: ${props => props.theme?.colors?.accent || '#800000'};
  border-radius: 50%;
  opacity: 0.3;
  animation: ${pulse} 3s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  top: ${props => props.top || '30%'};
  left: ${props => props.left || '30%'};
`;

const SimplePattern = styled.div`
  position: absolute;
  width: 100%;
  height: ${props => props.height || '2px'};
  background: ${props => props.pattern || 'transparent'};
  opacity: 0.1;
  top: ${props => props.position || '0'};
  animation: ${drift} 8s ease-in-out infinite alternate;
`;

// Theme-specific decoration mappings
const getThemeDecorations = (themeId) => {
  const decorationMap = {
    // Styles 1-10 (existing)
    1: null, // Carbon Fiber - minimal
    2: null, // Cosmic Blue - minimal
    3: { elements: ['✦', '◆'], dots: 3 }, // Royal Gold
    4: { elements: ['●', '◉'], dots: 5, pattern: true }, // Neon Pulse
    5: null, // Sunset - minimal
    6: { elements: ['🌿'], dots: 4 }, // Emerald Forest
    7: { elements: ['✨', '◇'], dots: 6 }, // Amethyst Glow
    8: { elements: ['▲'], dots: 4 }, // Obsidian Volcanic
    9: null, // Arctic Frost - minimal
    10: { elements: ['✦', '◆', '◇'], dots: 8, pattern: true }, // Ethereal Nebula

    // Styles 11-30 (new simplified)
    11: { elements: ['⚽'], dots: 3, pattern: 'repeating-linear-gradient(90deg, transparent, transparent 50px, rgba(255,255,255,0.05) 50px, rgba(255,255,255,0.05) 52px)' }, // Soccer
    12: { elements: ['☕', '✦'], dots: 4, pattern: 'linear-gradient(90deg, #1A472A 33%, #FFD700 33%, #FFD700 66%, #DC143C 66%)' }, // Ethiopian
    13: { elements: ['🌅', '✦'], dots: 4 }, // Eritrean
    14: { elements: ['🌵', '🎉'], dots: 5, pattern: 'repeating-linear-gradient(90deg, #FF5722 0px, #FF5722 20px, #FFC107 20px, #FFC107 40px)' }, // Mexican
    15: { elements: ['⭐', '🦅'], dots: 6, pattern: 'repeating-linear-gradient(0deg, #D32F2F 0px, #D32F2F 3px, #FFFFFF 3px, #FFFFFF 6px)' }, // American
    16: { elements: ['👨‍🍳', '🍳'], dots: 3 }, // Gourmet
    17: { elements: ['◉', '●'], dots: 8, pattern: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(57,255,20,0.1) 2px, rgba(57,255,20,0.1) 4px)' }, // Code
    18: { elements: ['👑', '💎'], dots: 5 }, // Royal
    19: { elements: ['♪', '♫'], dots: 6 }, // Music
    20: { elements: ['🎬', '⭐'], dots: 4 }, // Cinema
    21: { elements: ['🐪', '🏜️'], dots: 4 }, // Sahara
    22: { elements: ['🦁', '🌅'], dots: 4 }, // Safari
    23: { elements: ['🏟️', '⚽'], dots: 5 }, // Sports
    24: { elements: ['🎮', '◉'], dots: 8, pattern: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,0,255,0.05) 20px, rgba(255,0,255,0.05) 22px)' }, // Gaming
    25: { elements: ['🌴', '🌊'], dots: 4 }, // Tropical
    26: { elements: ['◉', '▲'], dots: 10, pattern: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,0,0.05) 2px, rgba(255,255,0,0.05) 4px)' }, // Cyberpunk
    27: { elements: ['🌸', '🎋'], dots: 5 }, // Japanese
    28: { elements: ['◆', '▲'], dots: 6 }, // Synthwave
    29: { elements: ['❄️', '✦'], dots: 7 }, // Winter
    30: { elements: ['⭐', '🌌'], dots: 8 }, // Space
  };

  return decorationMap[themeId] || null;
};

// Main component
const ThemeDecorations = ({ theme }) => {
  if (!theme?.id) return null;

  const decorations = getThemeDecorations(theme.id);
  if (!decorations) return null;

  const { elements = [], dots = 0, pattern } = decorations;

  return (
    <DecorationContainer>
      {/* Floating elements */}
      {elements.map((element, index) => (
        <FloatingElement
          key={`element-${index}`}
          theme={theme}
          size={index % 2 === 0 ? '20px' : '16px'}
          duration={`${4 + index}s`}
          delay={`${index * 0.8}s`}
          top={`${10 + (index * 15)}%`}
          left={`${5 + (index * 20)}%`}
        >
          {element}
        </FloatingElement>
      ))}

      {/* Pattern overlay */}
      {pattern && (
        <SimplePattern
          pattern={pattern}
          height="20px"
          position="top"
        />
      )}
    </DecorationContainer>
  );
};

export default ThemeDecorations;