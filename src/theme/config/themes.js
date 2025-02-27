import { WELCOME_STYLES } from '../welcomeStyles';

export const DEFAULT_THEME = WELCOME_STYLES.STYLE_1;

export const THEME_VARIANTS = WELCOME_STYLES;

export const createTheme = (variant, customizations = {}) => ({
  ...DEFAULT_THEME,
  ...(typeof variant === 'string' ? WELCOME_STYLES[variant] : variant),
  ...customizations
});

