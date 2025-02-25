import React from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';

export const ThemeProvider = ({ children }) => {
  return (
    <CustomThemeProvider>
      <StyledThemeProvider>
        {children}
      </StyledThemeProvider>
    </CustomThemeProvider>
  );
};

export default ThemeProvider;
