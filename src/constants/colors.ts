export const COLORS = {
  // Couleurs principales
  primary: "#5856D6",
  secondary: "#5856D6",
  success: "#28a745",
  warning: "#ffc107",
  error: "#dc3545",
  info: "#17a2b8",

  // Couleurs de texte
  text: {
    primary: "#333333",
    secondary: "#666666",
    tertiary: "#888888",
    disabled: "#cccccc",
    inverse: "#ffffff",
  },

  // Couleurs de background
  background: {
    primary: "#ffffff",
    secondary: "#f8f9fa",
    tertiary: "#e9ecef",
    card: "#ffffff",
    overlay: "rgba(0, 0, 0, 0.5)",
  },

  // Couleurs d'interaction
  interaction: {
    active: "#5856D6",
    inactive: "#666666",
    hover: "#4644B3",
    pressed: "#383592",
  },

  // Couleurs de statut
  status: {
    favorite: "#ff6b6b",
    online: "#28a745",
    offline: "#6c757d",
    pending: "#ffc107",
  },

  // Gradients
  gradients: {
    hero: ["#667eea", "#764ba2", "#f093fb"],
    card: ["#ffffff", "#f8f9fa"],
  },

  // Couleurs système
  system: {
    shadow: "#000000",
    border: "#e1e1e1",
    divider: "#eeeeee",
  },
} as const;
