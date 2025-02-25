// src/components/ThemeSelection/index.js

import React from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { DEFAULT_THEME, THEMES } from '../../constants/themes';
import { OceanPattern, FlamePattern, ForestPattern, CloudPattern, ElectricPattern } from '../ThemePatterns';

// Replace your current ThemeSelectorContainer with this:
const ThemeSelectorContainer = styled.div`
  position: relative;
  min-height: 100vh;
  padding: 4rem 2rem;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 30%, rgba(160, 0, 0, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(160, 0, 0, 0.15) 0%, transparent 50%);
    opacity: 0.8;
    animation: galaxySwirl 30s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle 1px, #FFF 1px, transparent 1px),
      radial-gradient(circle 2px, #A00000 1px, transparent 2px);
    background-size: 200px 200px, 300px 300px;
    background-position: 0 0;
    opacity: 0.1;
    animation: twinkle 4s infinite alternate;
  }

  @keyframes galaxySwirl {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.05; }
    50% { opacity: 0.1; }
  }

  .content-wrapper {
    position: relative;
    z-index: 1;
    max-width: ${props => props.theme?.styles?.containerWidth || DEFAULT_THEME.styles.containerWidth};
    margin: 0 auto;
    padding-top: 10rem; // Reduced from previous value
    min-height: 100vh;
  }
`;

const Ping = styled.div`
  position: absolute;
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #800000;
  pointer-events: none;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100px;
    height: 100px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: radial-gradient(circle, rgba(128, 0, 0, 0.4) 0%, transparent 70%);
    animation: ping 2s ease-out forwards;
  }

  @keyframes ping {
    0% {
      width: 0px;
      height: 0px;
      opacity: 1;
    }
    100% {
      width: 200px;
      height: 200px;
      opacity: 0;
    }
  }
`;

const SelectionBanner = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 80px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  z-index: 100;
  border-bottom: 1px solid rgba(160, 0, 0, 0.3);
`;

const Logo = styled.div`
  font-family: 'Impact', sans-serif;
  color: #A00000;
  font-size: 2rem;
  letter-spacing: 2px;
  transform: skew(-5deg);
`;

const InspiringText = styled.div`
  width: 25%;
  color: #FFFFFF;
  font-size: 1.2rem;
  overflow: hidden;
  white-space: nowrap;

  .sliding-text {
    animation: slideText 20s linear infinite;
    display: inline-block;
  }

  @keyframes slideText {
    0% { transform: translateX(100%); }
    100% { transform: translateX(-100%); }
  }
`;

// Add this array for inspiring messages
const INSPIRING_MESSAGES = [
  "Build Your Empire",
  "Connect & Grow Together",
  "Create Without Limits",
  "Join the Community",
  "Share Your Vision"
];

React.useEffect(() => {
  const container = document.querySelector('.theme-selector-container');
  if (!container) return; 

  const createPing = () => {
    const ping = document.createElement('div');
    ping.className = 'ping';
    
    ping.style.left = `${Math.random() * 100}%`;
    ping.style.top = `${Math.random() * 100}%`;
    
    container.appendChild(ping);
    
    setTimeout(() => {
      if (ping && ping.parentNode) {
        ping.remove();
      }
    }, 2000);
  };

  const createPingGroup = (count) => {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        createPing();
      }, i * 200);
    }
  };

  const pingCounts = [10, 30, 20];
  let currentIndex = 0;

  const interval = setInterval(() => {
    const count = pingCounts[currentIndex];
    createPingGroup(count);
    currentIndex = (currentIndex + 1) % pingCounts.length;
  }, 3000);
  
  // Cleanup function
  return () => {
    clearInterval(interval);
    // Remove any remaining pings
    const pings = container.getElementsByClassName('ping');
    while (pings.length > 0) {
      pings[0].remove();
    }
  };
}, []);

// Add these styles for the ping animation
const globalStyles = createGlobalStyle`
  .ping {
    position: absolute;
    width: 2px;
    height: 2px;
    background: #A00000;
    border-radius: 50%;
    z-index: 1;
  }

  .ping-animation {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 1px;
    height: 1px;
    background: radial-gradient(circle, rgba(160, 0, 0, 0.4) 0%, transparent 70%);
    border-radius: 50%;
    animation: pingExpand 2s ease-out forwards;
  }

  @keyframes pingExpand {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
    }
    100% {
      width: 200px;
      height: 200px;
      opacity: 0;
    }
  }
`;

const ThemeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const ThemeCard = styled.div`
  position: relative;
  height: 300px;
  border-radius: ${DEFAULT_THEME.styles.borderRadius};
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: ${props => props.bgColor || DEFAULT_THEME.colors.background};

  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .content {
    position: relative;
    z-index: 2;
    padding: 2rem;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    background: linear-gradient(
      to top,
      rgba(0, 0, 0, 0.8) 0%,
      rgba(0, 0, 0, 0.4) 50%,
      transparent 100%
    );
  }

  h3 {
    font-size: 2rem;
    color: ${DEFAULT_THEME.colors.text};
    margin-bottom: 0.5rem;
  }

  p {
    color: ${DEFAULT_THEME.colors.text};
    opacity: 0.8;
  }
  .font-selection {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }  
`;

const renderThemeSelector = () => (
  <ThemeSelectorContainer className="theme-selector-container">
    <SelectionBanner>
      <Logo>KALKODE</Logo>
      <InspiringText>
        <div className="sliding-text">
          {INSPIRING_MESSAGES.join(" • ")}
        </div>
      </InspiringText>
    </SelectionBanner>
    <div className="content-wrapper">
      <ThemeHeader>
        <h1>Choose Your Theme</h1>
        <p>Select a theme that reflects your brand's personality.</p>
      </ThemeHeader>
  
      <ThemeGrid>
        {Object.entries(ELEMENTAL_THEMES).map(([id, theme]) => (
          <div
            key={id}
            onClick={() => handleThemeSelect(id)}
            style={{
              cursor: 'pointer',
              padding: '20px',
              border: `1px solid ${theme.colors.accent}`,
              borderRadius: '8px',
              background: theme.colors.background,
              transition: 'all 0.3s ease',
            }}
          >
            <h3 style={{ color: theme.colors.text }}>{theme.name}</h3>
            <p style={{ color: theme.colors.text }}>{theme.description}</p>
          </div>
        ))}
      </ThemeGrid>
    </div>
  </ThemeSelectorContainer>
);

export default ThemeSelection;