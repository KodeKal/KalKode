#!/bin/bash

# Make sure we're in the theme directory
cd "$(dirname "$0")" || exit

# Create directory structure
mkdir -p context hooks components/patterns config

# Create theme context
cat > context/ThemeContext.js << 'EOL'
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
EOL

# Create useTheme hook
cat > hooks/useTheme.js << 'EOL'
import { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
EOL

# Create ThemeProvider component
cat > components/ThemeProvider.js << 'EOL'
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
EOL

# Create themes config
cat > config/themes.js << 'EOL'
export const DEFAULT_THEME = {
  colors: {
    background: '#000000',
    text: '#FFFFFF',
    primary: '#800000',
    secondary: '#4A0404',
    accent: '#800000',
    surface: 'rgba(255, 255, 255, 0.05)',
    gradient: 'linear-gradient(135deg, #800000 0%, #4A0404 100%)'
  },
  fonts: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif"
  },
  styles: {
    borderRadius: '12px',
    containerWidth: '1400px'
  }
};

export const THEME_VARIANTS = {
  OCEAN: {
    id: 'ocean',
    name: 'Ocean',
    description: 'Flowing and calm',
    colors: {
      background: '#1E3D59',
      text: '#FFFFFF',
      primary: '#2D6187',
      secondary: '#41B3D3',
      accent: '#41B3D3'
    }
  },
  FLAME: {
    id: 'flame',
    name: 'Flame',
    description: 'Bold and warm',
    colors: {
      background: '#1A0F0F',
      text: '#FFFFFF',
      primary: '#CD2B2B',
      secondary: '#FF6B4A',
      accent: '#FFA07A'
    }
  },
  EARTH: {
    id: 'earth',
    name: 'Forest',
    description: 'Natural and peaceful',
    colors: {
      background: '#1A2213',
      text: '#E8F3E8',
      primary: '#2D4A22',
      secondary: '#5C832F',
      accent: '#98C379'
    }
  },
  SKY: {
    id: 'sky',
    name: 'Cloud',
    description: 'Light and airy',
    colors: {
      background: '#2B4865',
      text: '#FFFFFF',
      primary: '#6E85B7',
      secondary: '#C4D7E0',
      accent: '#F8F9FA'
    }
  }
};

export const createTheme = (variant, customizations = {}) => ({
  ...DEFAULT_THEME,
  ...THEME_VARIANTS[variant],
  ...customizations
});
EOL

# Create fonts config
cat > config/fonts.js << 'EOL'
export const FONT_OPTIONS = {
  MODERN: {
    name: 'Modern',
    heading: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif"
  },
  CLASSIC: {
    name: 'Classic',
    heading: "'Playfair Display', serif",
    body: "'Source Sans Pro', sans-serif"
  },
  BOLD: {
    name: 'Bold',
    heading: "'Bebas Neue', cursive",
    body: "'Open Sans', sans-serif"
  }
};

export const FONT_PRESETS = {
  MODERN: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif"
  },
  CLASSIC: {
    heading: "'Playfair Display', serif",
    body: "'Lora', serif"
  },
  MINIMAL: {
    heading: "'Roboto', sans-serif",
    body: "'Open Sans', sans-serif"
  },
  CREATIVE: {
    heading: "'Audiowide', cursive",
    body: "'Exo 2', sans-serif"
  },
  ELEGANT: {
    heading: "'Cormorant Garamond', serif",
    body: "'Montserrat', sans-serif"
  }
};
EOL

# Move and rename animations file
mv ../styles/animations.js config/animations.js

# Move Theme patterns
mv ../components/ThemePatterns/index.js components/patterns/index.js

# Make the script executable
chmod +x setup-theme.sh

echo "Theme directory structure and files created successfully!"
