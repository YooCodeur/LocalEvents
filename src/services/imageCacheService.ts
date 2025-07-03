import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LocalEvent } from "../types/api";

// Configuration du cache d'images
export const IMAGE_CACHE_CONFIG = {
  // Répertoire de cache des images
  CACHE_DIR: `${FileSystem.documentDirectory}imageCache/`,
  // Durée de vie des images en cache (7 jours)
  IMAGE_TTL: 7 * 24 * 60 * 60 * 1000, // 7 jours en millisecondes
  // Taille maximale du cache d'images (50MB)
  MAX_CACHE_SIZE: 50 * 1024 * 1024, // 50MB
  // Nombre maximum d'images en cache
  MAX_IMAGES: 200,
  // Clé pour les métadonnées d'images
  METADATA_KEY: "@LocalEvents:image_cache_metadata",
  // Version du cache d'images
  CACHE_VERSION: "1.0.0",
} as const;

// Métadonnées d'une image en cache
export interface CachedImageMetadata {
  originalUrl: string;
  localPath: string;
  timestamp: number;
  fileSize: number;
  eventId: string;
  version: string;
}

// Métadonnées globales du cache d'images
export interface ImageCacheMetadata {
  images: { [key: string]: CachedImageMetadata };
  totalSize: number;
  lastCleanup: number;
  version: string;
}

export class ImageCacheService {
  // Initialiser le répertoire de cache
  static async initializeCacheDirectory(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(
        IMAGE_CACHE_CONFIG.CACHE_DIR,
      );
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(IMAGE_CACHE_CONFIG.CACHE_DIR, {
          intermediates: true,
        });
        console.log("✅ Répertoire de cache d'images créé");
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de la création du répertoire de cache:",
        error,
      );
    }
  }

  // Générer une clé unique pour une image
  static generateImageKey(imageUrl: string): string {
    // Utiliser un hash simple basé sur l'URL
    const hash = imageUrl.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    return Math.abs(hash).toString(36);
  }

  // Obtenir le chemin local d'une image
  static getLocalImagePath(imageKey: string): string {
    return `${IMAGE_CACHE_CONFIG.CACHE_DIR}${imageKey}.jpg`;
  }

  // Vérifier si une image est en cache et valide
  static async isImageCached(imageUrl: string): Promise<string | null> {
    try {
      const imageKey = this.generateImageKey(imageUrl);
      const localPath = this.getLocalImagePath(imageKey);

      // Vérifier si le fichier existe
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      if (!fileInfo.exists) {
        return null;
      }

      // Vérifier les métadonnées
      const metadata = await this.getImageMetadata();
      const imageMetadata = metadata.images[imageKey];

      if (!imageMetadata) {
        // Fichier orphelin, le supprimer
        await FileSystem.deleteAsync(localPath, { idempotent: true });
        return null;
      }

      // Vérifier si l'image n'est pas expirée
      const now = Date.now();
      const isExpired =
        now - imageMetadata.timestamp > IMAGE_CACHE_CONFIG.IMAGE_TTL;

      if (isExpired) {
        await this.removeImageFromCache(imageKey);
        return null;
      }

      console.log(`✅ Image trouvée en cache: ${imageKey}`);
      return localPath;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la vérification du cache d'image:",
        error,
      );
      return null;
    }
  }

  // Télécharger et mettre en cache une image
  static async cacheImage(
    imageUrl: string,
    eventId: string,
  ): Promise<string | null> {
    try {
      const imageKey = this.generateImageKey(imageUrl);
      const localPath = this.getLocalImagePath(imageKey);

      // Vérifier si l'image est déjà en cache
      const cachedPath = await this.isImageCached(imageUrl);
      if (cachedPath) {
        return cachedPath;
      }

      console.log(`📥 Téléchargement de l'image: ${imageUrl}`);

      // Télécharger l'image
      const downloadResult = await FileSystem.downloadAsync(
        imageUrl,
        localPath,
      );

      if (downloadResult.status !== 200) {
        console.error(`❌ Échec du téléchargement: ${downloadResult.status}`);
        return null;
      }

      // Obtenir la taille du fichier
      const fileInfo = await FileSystem.getInfoAsync(localPath);
      const fileSize = fileInfo.exists ? fileInfo.size || 0 : 0;

      // Mettre à jour les métadonnées
      await this.updateImageMetadata(imageKey, {
        originalUrl: imageUrl,
        localPath,
        timestamp: Date.now(),
        fileSize,
        eventId,
        version: IMAGE_CACHE_CONFIG.CACHE_VERSION,
      });

      console.log(
        `✅ Image mise en cache: ${imageKey} (${Math.round(fileSize / 1024)}KB)`,
      );
      return localPath;
    } catch (error) {
      console.error("❌ Erreur lors de la mise en cache de l'image:", error);
      return null;
    }
  }

  // Mettre en cache toutes les images d'un ensemble d'événements
  static async cacheEventsImages(events: LocalEvent[]): Promise<void> {
    try {
      await this.initializeCacheDirectory();

      const cachePromises = events.map((event) =>
        this.cacheImage(event.imageUrl, event.id),
      );

      const results = await Promise.allSettled(cachePromises);
      const successful = results.filter(
        (result) => result.status === "fulfilled",
      ).length;

      console.log(`✅ Images mises en cache: ${successful}/${events.length}`);
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise en cache des images d'événements:",
        error,
      );
    }
  }

  // Obtenir les métadonnées du cache d'images
  static async getImageMetadata(): Promise<ImageCacheMetadata> {
    try {
      const metadataString = await AsyncStorage.getItem(
        IMAGE_CACHE_CONFIG.METADATA_KEY,
      );
      if (!metadataString) {
        return {
          images: {},
          totalSize: 0,
          lastCleanup: Date.now(),
          version: IMAGE_CACHE_CONFIG.CACHE_VERSION,
        };
      }

      const metadata: ImageCacheMetadata = JSON.parse(metadataString);

      // Vérifier la version
      if (metadata.version !== IMAGE_CACHE_CONFIG.CACHE_VERSION) {
        console.log("🔄 Version de cache d'images obsolète, réinitialisation");
        await this.clearAllImages();
        return this.getImageMetadata();
      }

      return metadata;
    } catch (error) {
      console.error(
        "❌ Erreur lors de la lecture des métadonnées d'images:",
        error,
      );
      return {
        images: {},
        totalSize: 0,
        lastCleanup: Date.now(),
        version: IMAGE_CACHE_CONFIG.CACHE_VERSION,
      };
    }
  }

  // Mettre à jour les métadonnées d'une image
  static async updateImageMetadata(
    imageKey: string,
    imageMetadata: CachedImageMetadata,
  ): Promise<void> {
    try {
      const metadata = await this.getImageMetadata();

      // Ajouter ou mettre à jour l'image
      const oldImageData = metadata.images[imageKey];
      metadata.images[imageKey] = imageMetadata;

      // Mettre à jour la taille totale
      if (oldImageData) {
        metadata.totalSize =
          metadata.totalSize - oldImageData.fileSize + imageMetadata.fileSize;
      } else {
        metadata.totalSize += imageMetadata.fileSize;
      }

      // Vérifier les limites de cache
      await this.enforceCacheLimits(metadata);

      // Sauvegarder les métadonnées
      await AsyncStorage.setItem(
        IMAGE_CACHE_CONFIG.METADATA_KEY,
        JSON.stringify(metadata),
      );
    } catch (error) {
      console.error(
        "❌ Erreur lors de la mise à jour des métadonnées d'image:",
        error,
      );
    }
  }

  // Supprimer une image du cache
  static async removeImageFromCache(imageKey: string): Promise<void> {
    try {
      const metadata = await this.getImageMetadata();
      const imageMetadata = metadata.images[imageKey];

      if (imageMetadata) {
        // Supprimer le fichier
        await FileSystem.deleteAsync(imageMetadata.localPath, {
          idempotent: true,
        });

        // Mettre à jour les métadonnées
        metadata.totalSize -= imageMetadata.fileSize;
        delete metadata.images[imageKey];

        await AsyncStorage.setItem(
          IMAGE_CACHE_CONFIG.METADATA_KEY,
          JSON.stringify(metadata),
        );

        console.log(`🗑️ Image supprimée du cache: ${imageKey}`);
      }
    } catch (error) {
      console.error("❌ Erreur lors de la suppression de l'image:", error);
    }
  }

  // Appliquer les limites de cache (taille et nombre)
  static async enforceCacheLimits(metadata: ImageCacheMetadata): Promise<void> {
    try {
      const imageKeys = Object.keys(metadata.images);

      // Vérifier le nombre maximum d'images
      if (imageKeys.length > IMAGE_CACHE_CONFIG.MAX_IMAGES) {
        // Trier par timestamp (plus ancien en premier)
        const sortedKeys = imageKeys.sort(
          (a, b) => metadata.images[a].timestamp - metadata.images[b].timestamp,
        );

        const toRemove = sortedKeys.slice(
          0,
          imageKeys.length - IMAGE_CACHE_CONFIG.MAX_IMAGES,
        );

        for (const key of toRemove) {
          await this.removeImageFromCache(key);
        }
      }

      // Vérifier la taille maximale
      if (metadata.totalSize > IMAGE_CACHE_CONFIG.MAX_CACHE_SIZE) {
        const sortedKeys = Object.keys(metadata.images).sort(
          (a, b) => metadata.images[a].timestamp - metadata.images[b].timestamp,
        );

        for (const key of sortedKeys) {
          if (metadata.totalSize <= IMAGE_CACHE_CONFIG.MAX_CACHE_SIZE * 0.8) {
            break; // Réduire à 80% de la limite pour éviter les suppressions fréquentes
          }
          await this.removeImageFromCache(key);
          metadata = await this.getImageMetadata(); // Recharger les métadonnées
        }
      }
    } catch (error) {
      console.error(
        "❌ Erreur lors de l'application des limites de cache:",
        error,
      );
    }
  }

  // Nettoyer les images expirées
  static async cleanupExpiredImages(): Promise<void> {
    try {
      const metadata = await this.getImageMetadata();
      const now = Date.now();
      const expiredKeys: string[] = [];

      // Identifier les images expirées
      for (const [key, imageData] of Object.entries(metadata.images)) {
        const isExpired =
          now - imageData.timestamp > IMAGE_CACHE_CONFIG.IMAGE_TTL;
        if (isExpired) {
          expiredKeys.push(key);
        }
      }

      // Supprimer les images expirées
      for (const key of expiredKeys) {
        await this.removeImageFromCache(key);
      }

      // Mettre à jour le timestamp de nettoyage
      const updatedMetadata = await this.getImageMetadata();
      updatedMetadata.lastCleanup = now;
      await AsyncStorage.setItem(
        IMAGE_CACHE_CONFIG.METADATA_KEY,
        JSON.stringify(updatedMetadata),
      );

      console.log(
        `✨ Nettoyage des images terminé: ${expiredKeys.length} images supprimées`,
      );
    } catch (error) {
      console.error("❌ Erreur lors du nettoyage des images:", error);
    }
  }

  // Vider tout le cache d'images
  static async clearAllImages(): Promise<void> {
    try {
      // Supprimer le répertoire de cache
      const dirInfo = await FileSystem.getInfoAsync(
        IMAGE_CACHE_CONFIG.CACHE_DIR,
      );
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(IMAGE_CACHE_CONFIG.CACHE_DIR, {
          idempotent: true,
        });
      }

      // Réinitialiser les métadonnées
      const emptyMetadata: ImageCacheMetadata = {
        images: {},
        totalSize: 0,
        lastCleanup: Date.now(),
        version: IMAGE_CACHE_CONFIG.CACHE_VERSION,
      };

      await AsyncStorage.setItem(
        IMAGE_CACHE_CONFIG.METADATA_KEY,
        JSON.stringify(emptyMetadata),
      );

      console.log("🗑️ Cache d'images entièrement vidé");
    } catch (error) {
      console.error("❌ Erreur lors du vidage du cache d'images:", error);
    }
  }

  // Obtenir les statistiques du cache d'images
  static async getCacheStats(): Promise<{
    totalImages: number;
    totalSize: number;
    totalSizeMB: number;
    lastCleanup: Date | null;
  }> {
    try {
      const metadata = await this.getImageMetadata();

      return {
        totalImages: Object.keys(metadata.images).length,
        totalSize: metadata.totalSize,
        totalSizeMB:
          Math.round((metadata.totalSize / (1024 * 1024)) * 100) / 100,
        lastCleanup: metadata.lastCleanup
          ? new Date(metadata.lastCleanup)
          : null,
      };
    } catch (error) {
      console.error(
        "❌ Erreur lors de la récupération des statistiques:",
        error,
      );
      return {
        totalImages: 0,
        totalSize: 0,
        totalSizeMB: 0,
        lastCleanup: null,
      };
    }
  }
}
