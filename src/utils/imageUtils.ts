/**
 * Utilitaires pour la gestion des images
 */

/**
 * URL d'image par défaut en cas d'erreur
 */
const DEFAULT_IMAGE_URL =
  "https://via.placeholder.com/300x200?text=Pas+d%27image";

/**
 * Retourne une URL d'image avec fallback
 */
export const getImageWithFallback = (imageUrl?: string): string => {
  if (!imageUrl || imageUrl.trim() === "") {
    return DEFAULT_IMAGE_URL;
  }

  try {
    new URL(imageUrl);
    return imageUrl;
  } catch {
    return DEFAULT_IMAGE_URL;
  }
};

/**
 * Optimise une URL d'image en fonction de la taille demandée
 */
export const optimizeImageUrl = (
  imageUrl: string,
  width?: number,
  height?: number,
  quality: number = 80,
): string => {
  // Si l'URL contient déjà des paramètres de redimensionnement, on les garde
  if (imageUrl.includes("?w=") || imageUrl.includes("&w=")) {
    return imageUrl;
  }

  // Pour les URLs Ticketmaster, on peut ajouter des paramètres de redimensionnement
  if (imageUrl.includes("ticketmaster.com")) {
    const url = new URL(imageUrl);

    if (width) {
      url.searchParams.set("w", width.toString());
    }
    if (height) {
      url.searchParams.set("h", height.toString());
    }
    url.searchParams.set("q", quality.toString());

    return url.toString();
  }

  // Pour les autres services, on retourne l'URL originale
  return imageUrl;
};

/**
 * Précharge une image
 */
export const preloadImage = (imageUrl: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });
};

/**
 * Obtient les dimensions d'une image
 */
export const getImageDimensions = (
  imageUrl: string,
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = () => reject(new Error(`Failed to load image: ${imageUrl}`));
    img.src = imageUrl;
  });
};

/**
 * Génère un placeholder d'image avec du texte
 */
export const generatePlaceholderUrl = (
  width: number = 300,
  height: number = 200,
  text: string = "Image",
  bgColor: string = "e9ecef",
  textColor: string = "6c757d",
): string => {
  const encodedText = encodeURIComponent(text);
  return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodedText}`;
};

/**
 * Vérifie si une URL d'image est valide
 */
export const isValidImageUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(urlObj.pathname);
  } catch {
    return false;
  }
};
