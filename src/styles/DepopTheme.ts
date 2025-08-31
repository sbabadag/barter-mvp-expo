// Depop-inspired Design System
export const DepopTheme = {
  colors: {
    // Primary Colors (Depop-inspired)
    primary: '#000000',      // Black (Depop's signature)
    secondary: '#FFFFFF',    // White
    accent: '#FF6B35',       // Orange/Red accent
    background: '#FAFAFA',   // Light gray background
    surface: '#FFFFFF',      // Card surfaces
    
    // Text Colors
    text: {
      primary: '#000000',
      secondary: '#666666',
      tertiary: '#999999',
      inverse: '#FFFFFF',
    },
    
    // Interactive Colors
    heart: '#FF6B35',        // Like button
    border: '#E5E5E5',       // Subtle borders
    shadow: 'rgba(0,0,0,0.08)',
    
    // Status Colors
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  
  typography: {
    // Depop uses clean, minimal typography
    fonts: {
      primary: 'System',      // iOS/Android system fonts
      heading: 'System',
      mono: 'Menlo',
    },
    
    sizes: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 28,
      '4xl': 32,
    },
    
    weights: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 999,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 4,
    },
  },
};

// Layout constants for Depop-style grid
export const DepopLayout = {
  // Grid system for item cards
  itemsPerRow: 2,
  cardAspectRatio: 1.3, // Slightly taller than square
  
  // Screen padding
  screenPadding: 16,
  cardSpacing: 12,
  
  // Header heights
  headerHeight: 50,
  tabBarHeight: 80,
};
