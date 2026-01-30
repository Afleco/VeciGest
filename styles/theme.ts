
export const Colors = {
  // Colores principales del logo
  primary: {
    green: '#A2BB68',
    orange: '#E68D49',
    blue: '#6E9ECC',
  },
  
  // Colores base
  base: {
    white: '#FFFFFF',
    black: '#000000',
  },
  
  // Colores de fondo
  background: {
    main: '#F5F5F5',
    card: '#FFFFFF',
    drawer: '#6E9ECC',
    header: '#6E9ECC',
  },
  
  // Colores de texto
  text: {
    primary: '#333333',
    secondary: '#666666',
    light: '#999999',
    white: '#FFFFFF',
    black: '#000000',
  },
  
  // Colores de estado
  status: {
    success: '#A2BB68',
    warning: '#E68D49',
    error: '#E74C3C',
    info: '#6E9ECC',
  },
  
  // Colores de acento
  accent: {
    active: '#E68D49',
    inactive: '#FFFFFF',
    highlight: '#A2BB68',
  },
  
  // Sombras
  shadow: {
    color: '#000000',
    opacity: {
      light: 0.08,
      medium: 0.15,
      heavy: 0.25,
    },
  },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const BorderRadius = {
  sm: 10,
  md: 15,
  lg: 20,
  xl: 30,
  full: 9999,
};

export const FontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const FontWeights = {
  regular: '400' as '400',
  medium: '500' as '500',
  semibold: '600' as '600',
  bold: 'bold' as 'bold',
};

// Utilidades para sombras consistentes
export const Shadows = {
  small: {
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: Colors.shadow.opacity.light,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: Colors.shadow.opacity.medium,
    shadowRadius: 4,
    elevation: 3,
  },
  large: {
    shadowColor: Colors.shadow.color,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: Colors.shadow.opacity.heavy,
    shadowRadius: 8,
    elevation: 5,
  },
};

export default {
  Colors,
  Spacing,
  BorderRadius,
  FontSizes,
  FontWeights,
  Shadows,
};