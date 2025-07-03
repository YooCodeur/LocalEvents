/**
 * Utilitaires pour la gestion des dates
 */

/**
 * Formate une date pour l'affichage utilisateur
 */
export const formatDateForDisplay = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Date invalide";
  }

  return dateObj.toLocaleDateString("fr-FR", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

/**
 * Formate une date pour l'API (ISO 8601)
 */
export const formatDateForAPI = (
  date: Date,
  isEndDate: boolean = false,
): string => {
  if (isNaN(date.getTime())) {
    throw new Error("Date invalide fournie à formatDateForAPI");
  }

  const isoString = date.toISOString();
  const dateOnly = isoString.split("T")[0];
  const timeString = isEndDate ? "23:59:59Z" : "00:00:00Z";

  return `${dateOnly}T${timeString}`;
};

/**
 * Formate une date en format court
 */
export const formatDate = (
  date: Date | string,
  format: "short" | "medium" | "long" = "medium",
): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return "Date invalide";
  }

  const options: Intl.DateTimeFormatOptions = {
    short: { day: "numeric", month: "short" },
    medium: { day: "numeric", month: "short", year: "numeric" },
    long: { weekday: "long", day: "numeric", month: "long", year: "numeric" },
  }[format] as Intl.DateTimeFormatOptions;

  return dateObj.toLocaleDateString("fr-FR", options);
};

/**
 * Vérifie si une date est dans le futur
 */
export const isFutureDate = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.getTime() > Date.now();
};

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date: Date | string): boolean => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Obtient la différence en jours entre deux dates
 */
export const getDaysDifference = (
  date1: Date | string,
  date2: Date | string,
): number => {
  const d1 = typeof date1 === "string" ? new Date(date1) : date1;
  const d2 = typeof date2 === "string" ? new Date(date2) : date2;

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
