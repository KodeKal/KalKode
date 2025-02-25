// src/styles/GlobalStyles.js
import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  body {
    background: #0B0B3B;
    margin: 0;
    padding: 0;
    min-height: 100vh;
  }

  /* Hide scrollbars but keep functionality */
  * {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;  /* Firefox */
  }

  *::-webkit-scrollbar {
    display: none;  /* Chrome, Safari and Opera */
  }
`;