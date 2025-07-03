import type { LocalEvent, SearchParams } from "../types/api";

/**
 * Utilitaires de validation
 */

/**
 * Valide un objet événement
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateEvent = (event: any): event is LocalEvent => {
  return (
    event &&
    typeof event.id === "string" &&
    typeof event.name === "string" &&
    typeof event.date === "string" &&
    typeof event.venue === "string" &&
    typeof event.city === "string" &&
    typeof event.imageUrl === "string" &&
    typeof event.isFavorite === "boolean"
  );
};

/**
 * Valide les paramètres de recherche
 */
export const validateSearchParams = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  params: any,
): params is SearchParams => {
  if (!params || typeof params !== "object") {
    return false;
  }

  // Tous les champs sont optionnels, mais s'ils existent, ils doivent être du bon type
  if (params.city !== undefined && typeof params.city !== "string") {
    return false;
  }

  if (params.keyword !== undefined && typeof params.keyword !== "string") {
    return false;
  }

  if (
    params.startDateTime !== undefined &&
    typeof params.startDateTime !== "string"
  ) {
    return false;
  }

  if (
    params.endDateTime !== undefined &&
    typeof params.endDateTime !== "string"
  ) {
    return false;
  }

  if (params.size !== undefined && typeof params.size !== "number") {
    return false;
  }

  if (params.page !== undefined && typeof params.page !== "number") {
    return false;
  }

  return true;
};

/**
 * Valide une URL d'image
 */
export const validateImageUrl = (url: string): boolean => {
  try {
    new URL(url);
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  } catch {
    return false;
  }
};

/**
 * Valide un email
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Valide un numéro de téléphone français
 */
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+33|0)[1-9](?:[0-9]{8}))$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

/**
 * Nettoie et valide une chaîne de caractères
 */
export const sanitizeString = (
  str: string,
  maxLength: number = 255,
): string => {
  return str.trim().substring(0, maxLength);
};

/**
 * Valide une date
 */
export const validateDate = (date: string | Date): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return !isNaN(dateObj.getTime());
};
