// src/components/ThemeDecorations/index.js
import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
`;

const slideIn = keyframes`
  0% { transform: translateX(-100px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
`;

const sparkle = keyframes`
  0%, 100% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1); opacity: 1; }
`;

// Decoration Container
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

// Soccer decorations
const SoccerBall = styled.div`
  position: absolute;
  top: 20%;
  right: 10%;
  width: 50px;
  height: 50px;
  background: white;
  border-radius: 50%;
  animation: ${float} 3s ease-in-out infinite;
  opacity: 0.3;
  
  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60%;
    height: 60%;
    background: radial-gradient(circle, black 20%, transparent 20%);
  }
`;

const FieldLines = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: repeating-linear-gradient(
    90deg,
    transparent,
    transparent 50px,
    rgba(255, 255, 255, 0.3) 50px,
    rgba(255, 255, 255, 0.3) 52px
  );
`;

// Music decorations
const MusicNote = styled.div`
  position: absolute;
  color: ${props => props.theme?.colors?.accent || '#E91E63'};
  font-size: 24px;
  animation: ${float} 4s ease-in-out infinite;
  opacity: 0.4;
  
  &:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
  &:nth-child(2) { top: 40%; right: 15%; animation-delay: 1s; }
  &:nth-child(3) { bottom: 30%; left: 20%; animation-delay: 2s; }
`;

// Food decorations
const SteamWave = styled.div`
  position: absolute;
  top: 15%;
  right: 20%;
  width: 30px;
  height: 60px;
  opacity: 0.3;
  
  &::before, &::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 2px;
    height: 100%;
    background: ${props => props.theme?.colors?.accent || '#FF8F00'};
    animation: ${pulse} 2s ease-in-out infinite;
  }
  
  &::before { transform: translateX(-5px); }
  &::after { transform: translateX(5px); animation-delay: 0.5s; }
`;

// Programming decorations
const BinaryCode = styled.div`
  position: absolute;
  top: 0;
  left: ${props => props.left || '10%'};
  width: 2px;
  height: 100%;
  background: linear-gradient(
    to bottom,
    transparent,
    ${props => props.theme?.colors?.accent || '#39FF14'} 20%,
    ${props => props.theme?.colors?.accent || '#39FF14'} 80%,
    transparent
  );
  animation: ${slideIn} 3s ease-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  opacity: 0.2;
  
  &::before {
    content: '01010101';
    position: absolute;
    top: 20%;
    left: -10px;
    font-family: 'Courier New', monospace;
    font-size: 8px;
    color: ${props => props.theme?.colors?.accent || '#39FF14'};
    writing-mode: vertical-rl;
    opacity: 0.5;
  }
`;

// Continuing src/components/ThemeDecorations/index.js

// Space decorations
const Star = styled.div`
 position: absolute;
 top: ${props => props.top || '20%'};
 left: ${props => props.left || '20%'};
 width: 3px;
 height: 3px;
 background: white;
 border-radius: 50%;
 animation: ${sparkle} ${props => props.duration || '3s'} ease-in-out infinite;
 animation-delay: ${props => props.delay || '0s'};
 
 &::before, &::after {
   content: '';
   position: absolute;
   top: 50%;
   left: 50%;
   width: 1px;
   height: 10px;
   background: white;
   transform: translate(-50%, -50%);
 }
 
 &::before { transform: translate(-50%, -50%) rotate(0deg); }
 &::after { transform: translate(-50%, -50%) rotate(90deg); }
`;

// Japanese decorations
const SakuraPetal = styled.div`
 position: absolute;
 top: ${props => props.top || '-10px'};
 left: ${props => props.left || '20%'};
 width: 12px;
 height: 12px;
 background: ${props => props.theme?.colors?.accent || '#E74C3C'};
 border-radius: 50% 10% 50% 10%;
 animation: ${float} 6s ease-in-out infinite, 
            ${slideIn} 8s linear infinite;
 animation-delay: ${props => props.delay || '0s'};
 opacity: 0.6;
 transform: rotate(45deg);
`;

// Desert decorations
const SandDune = styled.div`
 position: absolute;
 bottom: 0;
 left: ${props => props.left || '0%'};
 width: ${props => props.width || '200px'};
 height: 80px;
 background: linear-gradient(
   to top,
   ${props => props.theme?.colors?.accent || '#DAA520'} 0%,
   transparent 100%
 );
 border-radius: 50% 50% 0 0;
 opacity: 0.2;
 animation: ${pulse} 8s ease-in-out infinite;
 animation-delay: ${props => props.delay || '0s'};
`;

// Mexican decorations
const PapelBanner = styled.div`
 position: absolute;
 top: 10px;
 left: 0;
 width: 100%;
 height: 30px;
 background: repeating-linear-gradient(
   90deg,
   #FF5722 0px,
   #FF5722 20px,
   #FFC107 20px,
   #FFC107 40px,
   #4CAF50 40px,
   #4CAF50 60px
 );
 opacity: 0.3;
 animation: ${slideIn} 4s ease-out infinite;
`;

// Gaming decorations
const PixelGrid = styled.div`
 position: absolute;
 top: 0;
 left: 0;
 width: 100%;
 height: 100%;
 background-image: 
   linear-gradient(${props => props.theme?.colors?.accent || '#FF00FF'}40 1px, transparent 1px),
   linear-gradient(90deg, ${props => props.theme?.colors?.accent || '#FF00FF'}40 1px, transparent 1px);
 background-size: 20px 20px;
 opacity: 0.1;
 animation: ${pulse} 4s ease-in-out infinite;
`;

// Winter decorations
const Snowflake = styled.div`
 position: absolute;
 top: ${props => props.top || '-10px'};
 left: ${props => props.left || '20%'};
 color: white;
 font-size: ${props => props.size || '16px'};
 animation: ${float} 6s ease-in-out infinite,
            ${slideIn} 10s linear infinite;
 animation-delay: ${props => props.delay || '0s'};
 opacity: 0.7;
 
 &::before {
   content: '❄';
 }
`;

// Tropical decorations
const PalmTree = styled.div`
 position: absolute;
 bottom: 0;
 right: ${props => props.right || '10%'};
 width: 40px;
 height: 120px;
 
 &::before {
   content: '';
   position: absolute;
   bottom: 0;
   left: 50%;
   transform: translateX(-50%);
   width: 8px;
   height: 80px;
   background: #8B4513;
   border-radius: 4px;
 }
 
 &::after {
   content: '🌴';
   position: absolute;
   top: 0;
   left: 50%;
   transform: translateX(-50%);
   font-size: 24px;
   animation: ${float} 4s ease-in-out infinite;
 }
 
 opacity: 0.4;
`;

// Main ThemeDecorations component
const ThemeDecorations = ({ theme }) => {
 if (!theme?.decorations) return null;

 const { decorations } = theme;

 return (
   <DecorationContainer>
     {/* Soccer decorations */}
     {decorations.soccerBall && <SoccerBall theme={theme} />}
     {decorations.fieldLines && <FieldLines />}
     
     {/* Music decorations */}
     {decorations.musicNotes && (
       <>
         <MusicNote theme={theme}>♪</MusicNote>
         <MusicNote theme={theme}>♫</MusicNote>
         <MusicNote theme={theme}>♪</MusicNote>
       </>
     )}
     
     {/* Food decorations */}
     {decorations.steamWaves && <SteamWave theme={theme} />}
     
     {/* Programming decorations */}
     {decorations.binaryRain && (
       <>
         <BinaryCode theme={theme} left="5%" delay="0s" />
         <BinaryCode theme={theme} left="15%" delay="1s" />
         <BinaryCode theme={theme} left="85%" delay="2s" />
         <BinaryCode theme={theme} left="95%" delay="3s" />
       </>
     )}
     
     {/* Space decorations */}
     {decorations.stars && (
       <>
         <Star top="10%" left="10%" delay="0s" duration="3s" />
         <Star top="20%" left="80%" delay="1s" duration="4s" />
         <Star top="60%" left="20%" delay="2s" duration="2s" />
         <Star top="80%" left="70%" delay="1.5s" duration="5s" />
         <Star top="30%" left="50%" delay="0.5s" duration="3.5s" />
       </>
     )}
     
     {/* Japanese decorations */}
     {decorations.sakura && (
       <>
         <SakuraPetal theme={theme} top="-10px" left="10%" delay="0s" />
         <SakuraPetal theme={theme} top="-10px" left="30%" delay="2s" />
         <SakuraPetal theme={theme} top="-10px" left="60%" delay="4s" />
         <SakuraPetal theme={theme} top="-10px" left="80%" delay="6s" />
       </>
     )}
     
     {/* Desert decorations */}
     {decorations.dunes && (
       <>
         <SandDune theme={theme} left="0%" width="300px" delay="0s" />
         <SandDune theme={theme} left="60%" width="250px" delay="2s" />
       </>
     )}
     
     {/* Mexican decorations */}
     {decorations.papel && <PapelBanner />}
     
     {/* Gaming decorations */}
     {decorations.pixelGrid && <PixelGrid theme={theme} />}
     
     {/* Winter decorations */}
     {decorations.snowflakes && (
       <>
         <Snowflake top="-10px" left="10%" delay="0s" size="12px" />
         <Snowflake top="-10px" left="25%" delay="1s" size="16px" />
         <Snowflake top="-10px" left="50%" delay="2s" size="14px" />
         <Snowflake top="-10px" left="75%" delay="3s" size="18px" />
         <Snowflake top="-10px" left="90%" delay="4s" size="12px" />
       </>
     )}
     
     {/* Tropical decorations */}
     {decorations.palmTrees && (
       <>
         <PalmTree right="5%" />
         <PalmTree right="85%" />
       </>
     )}
   </DecorationContainer>
 );
};

export default ThemeDecorations;