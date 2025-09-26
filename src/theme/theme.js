import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    // Durga-inspired color palette
    primary: '#8B1538', // Deep red - Durga's power and protection
    secondary: '#D4AF37', // Golden yellow - Divine energy
    surface: '#FFFFFF',
    background: '#FDF6E3', // Warm cream background
    error: '#DC2626', // Strong red for emergencies
    text: '#2D1B1B', // Rich dark brown
    placeholder: '#8B7355', // Muted brown
    disabled: '#D4C4A8', // Light brown
    accent: '#E53E3E', // Bright red accent
    // Custom Durga colors
    durgaRed: '#8B1538',
    durgaGold: '#D4AF37',
    durgaOrange: '#FF6B35',
    durgaCream: '#FDF6E3',
    durgaBrown: '#2D1B1B',
    durgaLight: '#FFF8DC',
    emergency: '#DC2626',
    success: '#059669',
    warning: '#D97706',
  },
  fonts: {
    ...DefaultTheme.fonts,
    regular: {
      fontFamily: 'System',
      fontWeight: '400',
    },
    medium: {
      fontFamily: 'System',
      fontWeight: '600',
    },
    light: {
      fontFamily: 'System',
      fontWeight: '300',
    },
    thin: {
      fontFamily: 'System',
      fontWeight: '100',
    },
    bold: {
      fontFamily: 'System',
      fontWeight: '700',
    },
  },
  // Custom Durga styling
  durga: {
    gradient: ['#8B1538', '#D4AF37'],
    shadow: {
      shadowColor: '#8B1538',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    borderRadius: 16,
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
  },
};
