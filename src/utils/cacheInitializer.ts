import { CacheService } from "../services/cacheService";
import { ImageCacheService } from "../services/imageCacheService";

/**
 * Initialise le cache au démarrage de l'application
 * - Nettoie les entrées expirées
 * - Log les statistiques du cache
 */
export const initializeCache = async (): Promise<void> => {
  try {
    console.log("🚀 Initialisation du cache...");

    // Initialiser le répertoire de cache d'images
    await ImageCacheService.initializeCacheDirectory();

    // Nettoyer les entrées expirées
    await CacheService.cleanupCache();

    // Obtenir et afficher les statistiques
    const stats = await CacheService.getCacheStats();
    const imageStats = await ImageCacheService.getCacheStats();

    console.log("📊 Statistiques du cache:", {
      totalEntries: stats.totalEntries,
      totalSize: `${Math.round(stats.totalSize / 1024)} KB`,
      lastCleanup: stats.lastCleanup?.toLocaleString() || "Jamais",
    });

    console.log("🖼️ Statistiques du cache d'images:", {
      totalImages: imageStats.totalImages,
      totalSize: `${imageStats.totalSizeMB} MB`,
      lastCleanup: imageStats.lastCleanup?.toLocaleString() || "Jamais",
    });

    console.log("✅ Cache initialisé avec succès");
  } catch (error) {
    console.error("❌ Erreur lors de l'initialisation du cache:", error);
  }
};

/**
 * Nettoie le cache périodiquement (à appeler dans un useEffect)
 */
export const schedulePeriodicCacheCleanup = (): (() => void) => {
  console.log("⏰ Programmation du nettoyage périodique du cache");

  const cleanupInterval = setInterval(
    async () => {
      try {
        console.log("🧹 Nettoyage périodique du cache...");
        await CacheService.cleanupCache();
      } catch (error) {
        console.error("❌ Erreur lors du nettoyage périodique:", error);
      }
    },
    6 * 60 * 60 * 1000,
  ); // Toutes les 6 heures

  // Retourner une fonction de nettoyage
  return () => {
    console.log("🛑 Arrêt du nettoyage périodique du cache");
    clearInterval(cleanupInterval);
  };
};
