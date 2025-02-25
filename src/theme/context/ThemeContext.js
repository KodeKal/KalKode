import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_THEME } from '../config/themes';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(DEFAULT_THEME);
  const [fonts, setFonts] = useState(DEFAULT_THEME.fonts);

  const updateTheme = (newTheme) => {
    setCurrentTheme(prev => ({
      ...prev,
      ...newTheme
    }));
  };

  return (
    <ThemeContext.Provider value={{
      theme: currentTheme,
      fonts,
      updateTheme,
      setFonts
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
