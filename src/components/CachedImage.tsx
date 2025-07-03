import React, { useState, useEffect } from 'react';
import {
  Image,
  View,
  ActivityIndicator,
  StyleSheet,
  ImageProps,
  ImageStyle,
  ViewStyle,
} from 'react-native';
import { ImageCacheService } from '../services/imageCacheService';

interface CachedImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  eventId?: string;
  placeholder?: React.ReactNode;
  errorPlaceholder?: React.ReactNode;
  showLoadingIndicator?: boolean;
  loadingIndicatorColor?: string;
  loadingIndicatorSize?: 'small' | 'large';
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  onLoadStart?: () => void;
  onLoadEnd?: () => void;
  onError?: () => void;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  source,
  eventId = 'unknown',
  placeholder,
  errorPlaceholder,
  showLoadingIndicator = true,
  loadingIndicatorColor = '#007AFF',
  loadingIndicatorSize = 'large',
  style,
  containerStyle,
  resizeMode = 'cover',
  onLoadStart,
  onLoadEnd,
  onError,
  ...imageProps
}) => {
  const [imageSource, setImageSource] = useState<{ uri: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [cacheChecked, setCacheChecked] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async () => {
      try {
        setIsLoading(true);
        setHasError(false);
        onLoadStart?.();

        // Vérifier si l'image est en cache
        const cachedPath = await ImageCacheService.isImageCached(source.uri);
        
        if (!isMounted) return;

        if (cachedPath) {
          // Utiliser l'image en cache
          setImageSource({ uri: cachedPath });
          console.log(`📱 Image chargée depuis le cache: ${eventId}`);
        } else {
          // Utiliser l'image originale et démarrer le téléchargement en arrière-plan
          setImageSource(source);
          
          // Télécharger en arrière-plan pour la prochaine fois (sans attendre)
          ImageCacheService.cacheImage(source.uri, eventId).catch(error => {
            console.log(`⚠️ Échec du cache d'image en arrière-plan: ${error.message}`);
          });
        }
        
        setCacheChecked(true);
      } catch (error) {
        console.error('❌ Erreur lors du chargement de l\'image:', error);
        if (isMounted) {
          setImageSource(source); // Fallback vers l'URL originale
          setCacheChecked(true);
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [source.uri, eventId, onLoadStart]);

  const handleImageLoad = () => {
    setIsLoading(false);
    onLoadEnd?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  // Afficher le placeholder pendant que le cache est vérifié
  if (!cacheChecked) {
    return (
      <View style={[styles.container, containerStyle, style]}>
        {placeholder || (
          showLoadingIndicator && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator 
                size={loadingIndicatorSize} 
                color={loadingIndicatorColor} 
              />
            </View>
          )
        )}
      </View>
    );
  }

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
    position: 'relative',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(240, 240, 240, 0.8)',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  errorPlaceholder: {
    width: 50,
    height: 50,
    backgroundColor: '#ccc',
    borderRadius: 25,
  },
}); 