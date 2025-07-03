import { Dimensions } from "react-native";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

export const SIZES = {
  // Dimensions d'écran
  screen: {
    width: screenWidth,
    height: screenHeight,
  },

  // Tailles de base
  base: 8,
  small: 12,
  medium: 16,
  large: 24,
  extraLarge: 32,

  // Border radius
  radius: {
    small: 4,
    medium: 8,
    large: 12,
    extraLarge: 16,
    round: 999,
  },

  // Icônes
  icon: {
    small: 16,
    medium: 24,
    large: 32,
    extraLarge: 48,
  },

  // Composants spécifiques
  header: {
    height: 60,
  },

  tabBar: {
    height: 50,
  },

  button: {
    height: 48,
    small: 36,
    large: 56,
  },

  input: {
    height: 48,
  },

  card: {
    minHeight: 120,
    imageSize: 80,
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,

  // Espacements sémantiques
  padding: {
    screen: 16,
    card: 16,
    section: 24,
  },

  margin: {
    section: 24,
    card: 12,
    item: 8,
  },
} as const;
