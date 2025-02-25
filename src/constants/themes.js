// Save at: src/constants/themes.js
// Add this at the top of your themes.js
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

// src/constants/themes.js
export const THEMES = {
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

export const COLOR_ADJUSTMENT_PRESETS = {
  LIGHTER: {
    background: 0.1,
    text: -0.1,
    accent: 0.1
  },
  DARKER: {
    background: -0.1,
    text: 0.1,
    accent: -0.1
  },
  HIGHER_CONTRAST: {
    background: -0.2,
    text: 0.2,
    accent: 0.3
  },
  SOFTER: {
    background: 0.05,
    text: -0.05,
    accent: -0.1
  }
};

export const TAB_POSITIONS = {
  TOP: 'top',
  LEFT: 'left',
  BOTTOM: 'bottom'
};

export const SHOP_NAME_POSITIONS = {
  LEFT: 'left',
  CENTER: 'center'
};
