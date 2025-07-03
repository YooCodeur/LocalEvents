import React, { useState, useEffect } from "react";
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
  ImageStyle,
  ViewStyle,
} from "react-native";
import { ImageCacheService } from "../services/imageCacheService";

interface CachedImageProps extends Omit<ImageProps, "source"> {
  source: { uri: string };
  eventId?: string;
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  showLoadingIndicator?: boolean;
  loadingIndicatorColor?: string;
  loadingIndicatorSize?: "small" | "large";
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: "cover" | "contain" | "stretch" | "repeat" | "center";
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  eventId = "unknown",
  placeholder: _placeholder,
  errorPlaceholder,
  showLoadingIndicator = true,
  loadingIndicatorColor = "#007AFF",
  loadingIndicatorSize = "large",
  style,
  containerStyle,
  resizeMode = "cover",
  onLoadStart,
  onLoadEnd,
  onError,
  ...imageProps
}) => {
  const [imageSource, setImageSource] = useState<{ uri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // D'abord, vérifier le cache pour les favoris en priorité
    const loadImageWithCachePriority = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        onLoadStart?.();

        // Vérifier d'abord le cache
        const cachedPath = await ImageCacheService.isImageCached(source.uri);

        if (isMounted && cachedPath) {
          // Image trouvée en cache - priorité absolue
          setImageSource({ uri: cachedPath });
          setIsLoading(false);
          onLoadEnd?.();
          console.log(`✅ Image chargée depuis le cache: ${eventId}`);
          return;
        }

        // Pas en cache - afficher l'image originale
        if (isMounted) {
          setImageSource(source);

          // Télécharger en arrière-plan pour la prochaine fois
          ImageCacheService.cacheImage(source.uri, eventId).catch((error) => {
            console.log(`⚠️ Échec du cache d'image: ${error.message}`);
          });
        }
      } catch (error) {
        console.error("❌ Erreur lors du chargement de l'image:", error);
        if (isMounted) {
          // En cas d'erreur, essayer l'image originale
          setImageSource(source);
        }
      }
    };

    // Lancer le chargement avec priorité cache
    loadImageWithCachePriority();

    return () => {
      isMounted = false;
    };
  }, [source.uri, eventId, onLoadStart, onLoadEnd]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Afficher le placeholder d'erreur si l'image a échoué
  if (hasError) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        {errorPlaceholder || (
          <View style={styles.errorContainer}>
            <View style={styles.errorPlaceholder} />
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, containerStyle]}>
      {imageSource && (
        <Image
          {...imageProps}
          source={imageSource}
          style={[styles.image, style]}
          resizeMode={resizeMode}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      )}

      {isLoading && showLoadingIndicator && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator
            size={loadingIndicatorSize}
            color={loadingIndicatorColor}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(240, 240, 240, 0.8)",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  errorPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: "#ccc",
    borderRadius: 25,
  },
});
