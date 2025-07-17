// src/styles/GlobalStyles.js - Simplified
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', sans-serif;
    overflow-x: hidden;
  }

  /* Simple ping animation for all themes */
  .ping {
    position: absolute;
    width: 2px;
    height: 2px;
    border-radius: 50%;
    background: #800000;
    pointer-events: none;
  }

  .ping::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: transparent;
    border: 2px solid currentColor;
    transform: translate(-50%, -50%) scale(0);
    opacity: 0.6;
    animation: ping 3s ease-out forwards;
  }

  @keyframes ping {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 0.6;
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
      opacity: 0;
    }
  }

  /* Standard spinner animation */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* Common utility classes */
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .no-scroll {
    overflow: hidden;
  }

  /* Smooth scrolling */
  html {
    scroll-behavior: smooth;
  }

  /* Focus styles */
  *:focus {
    outline: 2px solid currentColor;
    outline-offset: 2px;
  }

  /* Loading states */
  .loading {
    opacity: 0.6;
    pointer-events: none;
  }

  /* Transitions */
  .fade-in {
    animation: fadeIn 0.3s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;