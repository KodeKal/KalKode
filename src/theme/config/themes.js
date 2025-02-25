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
