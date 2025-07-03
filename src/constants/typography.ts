export const TYPOGRAPHY = {
  // Tailles de police
  size: {
    h1: 32,
    h2: 28,
    h3: 24,
    h4: 20,
    h5: 18,
    h6: 16,
    body: 16,
    bodySmall: 14,
    caption: 13,
    small: 12,
    tiny: 11,
  },

  // Poids de police
  weight: {
    light: "300" as const,
    regular: "400" as const,
    medium: "500" as const,
    semiBold: "600" as const,
    bold: "700" as const,
  },

  // Hauteurs de ligne
  lineHeight: {
    tight: 1.1,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },

  // Styles de texte prédéfinis
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: "700" as const,
      lineHeight: 40,
    },
    h2: {
      fontSize: 28,
      fontWeight: "600" as const,
      lineHeight: 36,
    },
    h3: {
      fontSize: 24,
      fontWeight: "600" as const,
      lineHeight: 32,
    },
    h4: {
      fontSize: 20,
      fontWeight: "600" as const,
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: "400" as const,
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: "400" as const,
      lineHeight: 20,
    },
    caption: {
      fontSize: 13,
      fontWeight: "400" as const,
      lineHeight: 18,
    },
    button: {
      fontSize: 16,
      fontWeight: "600" as const,
      lineHeight: 24,
    },
  },
} as const;
