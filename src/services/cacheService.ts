import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalEvent, SearchParams } from "../types/api";
import { ImageCacheService } from "./imageCacheService";

// Clés de stockage pour le cache
const EVENTS_CACHE_KEY = "@LocalEvents:events_cache";
const CACHE_METADATA_KEY = "@LocalEvents:cache_metadata";

// Configuration du cache
export const CACHE_CONFIG = {
  // Durée de vie du cache (24 heures par défaut)
  DEFAULT_TTL: 24 * 60 * 60 * 1000, // 24h en millisecondes
  // Durée de vie courte pour les recherches (1 heure)
  SEARCH_TTL: 60 * 60 * 1000, // 1h en millisecondes
  // Taille maximale du cache (nombre d'entrées)
  MAX_CACHE_ENTRIES: 10,
  // Version du cache (pour invalider lors des mises à jour)
  CACHE_VERSION: "1.0.0",
} as const;

// Structure des données en cache
export interface CacheEntry {
  key: string;
  data: LocalEvent[];
  searchParams: SearchParams;
  timestamp: number;
  ttl: number;
  version: string;
}

export interface CacheMetadata {
  entries: string[];
  lastCleanup: number;
  version: string;
}

export class CacheService {
  // Générer une clé unique pour les paramètres de recherche
  static generateCacheKey(searchParams: SearchParams): string {
    const normalized = {
      city: searchParams.city?.toLowerCase() || "default",
      keyword: searchParams.keyword?.toLowerCase() || "",
      page: searchParams.page || 0,
      size: searchParams.size || 20,
      startDateTime: searchParams.startDateTime || "",
      endDateTime: searchParams.endDateTime || "",
    };

    return `events_${normalized.city}_${normalized.keyword}_${normalized.page}_${normalized.size}_${normalized.startDateTime}_${normalized.endDateTime}`;
  }

  // Vérifier si une entrée de cache est valide
  static isCacheValid(entry: CacheEntry): boolean {
    const now = Date.now();
    const isExpired = now - entry.timestamp > entry.ttl;
    const isVersionValid = entry.version === CACHE_CONFIG.CACHE_VERSION;

    return !isExpired && isVersionValid;
  }

  // Sauvegarder des événements en cache
  static async cacheEvents(
    events: LocalEvent[],
    searchParams: SearchParams,
    ttl: number = CACHE_CONFIG.DEFAULT_TTL,
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(searchParams);
      const storageKey = `${EVENTS_CACHE_KEY}_${cacheKey}`;

      const cacheEntry: CacheEntry = {
        key: cacheKey,
        data: events,
        searchParams,
        timestamp: Date.now(),
        ttl,
        version: CACHE_CONFIG.CACHE_VERSION,
      };

      // Sauvegarder l'entrée de cache
      await AsyncStorage.setItem(storageKey, JSON.stringify(cacheEntry));

      // Mettre à jour les métadonnées
      await this.updateCacheMetadata(cacheKey);

      console.log(
        `✅ Cache sauvegardé: ${cacheKey} (${events.length} événements)`,
      );

      // Télécharger les images en arrière-plan (sans bloquer)
      ImageCacheService.cacheEventsImages(events).catch((error) => {
        console.log(
          `⚠️ Échec du cache d'images en arrière-plan: ${error.message}`,
        );
      });
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde du cache:", error);
    }
  }

  // Récupérer des événements depuis le cache
  static async getCachedEvents(
    searchParams: SearchParams,
  ): Promise<LocalEvent[] | null> {
    try {
      const cacheKey = this.generateCacheKey(searchParams);
      const storageKey = `${EVENTS_CACHE_KEY}_${cacheKey}`;

      const cachedData = await AsyncStorage.getItem(storageKey);
      if (!cachedData) {
        return null;
      }

      const cacheEntry: CacheEntry = JSON.parse(cachedData);

      if (this.isCacheValid(cacheEntry)) {
        console.log(
          `✅ Cache hit: ${cacheKey} (${cacheEntry.data.length} événements)`,
        );
        return cacheEntry.data;
      } else {
        // Cache expiré, le supprimer
        await this.removeCacheEntry(cacheKey);
        console.log(`🗑️ Cache expiré supprimé: ${cacheKey}`);
        return null;
      }
    } catch (error) {
      console.error("❌ Erreur lors de la lecture du cache:", error);
      return null;
    }
  }

  // Mettre à jour les métadonnées du cache
  static async updateCacheMetadata(cacheKey: string): Promise<void> {
    try {
      const metadataString = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      let metadata: CacheMetadata = metadataString
        ? JSON.parse(metadataString)
        : {
            entries: [],
            lastCleanup: Date.now(),
            version: CACHE_CONFIG.CACHE_VERSION,
          };

      // Ajouter la nouvelle entrée si elle n'existe pas
      if (!metadata.entries.includes(cacheKey)) {
        metadata.entries.push(cacheKey);
      }

      // Limiter le nombre d'entrées
      if (metadata.entries.length > CACHE_CONFIG.MAX_CACHE_ENTRIES) {
        const oldestKey = metadata.entries.shift();
        if (oldestKey) {
          await this.removeCacheEntry(oldestKey);
        }
      }

      metadata.version = CACHE_CONFIG.CACHE_VERSION;
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error("❌ Erreur lors de la mise à jour des métadonnées:", error);
    }
  }

  // Supprimer une entrée de cache
  static async removeCacheEntry(cacheKey: string): Promise<void> {
    try {
      const storageKey = `${EVENTS_CACHE_KEY}_${cacheKey}`;
      await AsyncStorage.removeItem(storageKey);

      // Mettre à jour les métadonnées
      const metadataString = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (metadataString) {
        const metadata: CacheMetadata = JSON.parse(metadataString);
        metadata.entries = metadata.entries.filter((key) => key !== cacheKey);
        await AsyncStorage.setItem(
          CACHE_METADATA_KEY,
          JSON.stringify(metadata),
        );
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression du cache:", error);
    }
  }

  // Nettoyer le cache (supprimer les entrées expirées)
  static async cleanupCache(): Promise<void> {
    try {
      const metadataString = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (!metadataString) return;

      const metadata: CacheMetadata = JSON.parse(metadataString);
      const validEntries: string[] = [];

      for (const cacheKey of metadata.entries) {
        const storageKey = `${EVENTS_CACHE_KEY}_${cacheKey}`;
        const cachedData = await AsyncStorage.getItem(storageKey);

        if (cachedData) {
          const cacheEntry: CacheEntry = JSON.parse(cachedData);

          if (this.isCacheValid(cacheEntry)) {
            validEntries.push(cacheKey);
          } else {
            await AsyncStorage.removeItem(storageKey);
            console.log(`🗑️ Cache expiré nettoyé: ${cacheKey}`);
          }
        }
      }

      // Mettre à jour les métadonnées avec les entrées valides
      metadata.entries = validEntries;
      metadata.lastCleanup = Date.now();
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));

      console.log(
        `✨ Nettoyage terminé: ${validEntries.length} entrées conservées`,
      );

      // Nettoyer aussi les images expirées
      ImageCacheService.cleanupExpiredImages().catch((error) => {
        console.log(`⚠️ Échec du nettoyage des images: ${error.message}`);
      });
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage du cache:", error);
    }
  }

  // Vider tout le cache
  static async clearAllCache(): Promise<void> {
    try {
      const metadataString = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (metadataString) {
        const metadata: CacheMetadata = JSON.parse(metadataString);

        // Supprimer toutes les entrées de cache
        for (const cacheKey of metadata.entries) {
          const storageKey = `${EVENTS_CACHE_KEY}_${cacheKey}`;
          await AsyncStorage.removeItem(storageKey);
        }
      }

      // Supprimer les métadonnées
      await AsyncStorage.removeItem(CACHE_METADATA_KEY);

      console.log("🗑️ Tout le cache a été vidé");

      // Vider aussi le cache d'images
      ImageCacheService.clearAllImages().catch((error) => {
        console.log(`⚠️ Échec du vidage du cache d'images: ${error.message}`);
      });
    } catch (error) {
      console.error("❌ Erreur lors du vidage du cache:", error);
    }
  }

  // Obtenir des statistiques sur le cache
  static async getCacheStats(): Promise<{
    totalEntries: number;
    totalSize: number;
    lastCleanup: Date | null;
  }> {
    try {
      const metadataString = await AsyncStorage.getItem(CACHE_METADATA_KEY);
      if (!metadataString) {
        return { totalEntries: 0, totalSize: 0, lastCleanup: null };
      }

      const metadata: CacheMetadata = JSON.parse(metadataString);
      let totalSize = 0;

      for (const cacheKey of metadata.entries) {
        const storageKey = `${EVENTS_CACHE_KEY}_${cacheKey}`;
        const cachedData = await AsyncStorage.getItem(storageKey);
        if (cachedData) {
          totalSize += cachedData.length;
        }
      }

      return {
        totalEntries: metadata.entries.length,
        totalSize,
        lastCleanup: new Date(metadata.lastCleanup),
      };
    } catch (error) {
      console.error("❌ Erreur lors de l'obtention des stats du cache:", error);
      return { totalEntries: 0, totalSize: 0, lastCleanup: null };
    }
  }
}
