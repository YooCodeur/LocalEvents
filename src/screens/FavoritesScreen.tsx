import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { loadFavorites, removeFavorite, clearError } from '../store/slices/favoritesSlice';
import { LocalEvent } from '../types/api';

export default function FavoritesScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  
  const { favorites, loading, error } = useSelector((state: RootState) => state.favorites);

  // Charger les favoris au démarrage et quand l'écran redevient actif
  useEffect(() => {
    dispatch(loadFavorites());
  }, [dispatch]);

  // Recharger quand l'écran est focalisé (au retour du détail)
  useFocusEffect(
    useCallback(() => {
      dispatch(loadFavorites());
    }, [dispatch])
  );

  // Naviguer vers le détail d'un événement
  const handleEventPress = useCallback((event: LocalEvent) => {
    navigation.navigate('EventDetail', { event });
  }, [navigation]);

  // Supprimer un favori avec confirmation
  const handleRemoveFavorite = useCallback((event: LocalEvent) => {
    Alert.alert(
      'Retirer des favoris',
      `Voulez-vous retirer "${event.name}" de vos favoris ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: () => dispatch(removeFavorite(event.id)),
        },
      ],
      { cancelable: true }
    );
  }, [dispatch]);

  // Rendu d'un événement favori
  const renderFavorite = useCallback(({ item }: { item: LocalEvent }) => (
    <TouchableOpacity 
      style={styles.favoriteCard} 
      onPress={() => handleEventPress(item)}
      activeOpacity={0.7}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.favoriteImage} />
      <View style={styles.favoriteInfo}>
        <View style={styles.favoriteHeader}>
          <Text style={styles.favoriteTitle} numberOfLines={2}>{item.name}</Text>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => handleRemoveFavorite(item)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.removeButtonText}>❌</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.favoriteDate}>{item.date}</Text>
        
        <View style={styles.favoriteLocation}>
          <Text style={styles.favoriteVenue} numberOfLines={1}>{item.venue}</Text>
          <Text style={styles.favoriteCity}>{item.city}</Text>
        </View>
        
        {item.priceRange && (
          <Text style={styles.favoritePrice}>{item.priceRange}</Text>
        )}
        
        <View style={styles.favoriteTag}>
          <Text style={styles.favoriteTagText}>❤️ Favori</Text>
        </View>
      </View>
    </TouchableOpacity>
  ), [handleEventPress, handleRemoveFavorite]);

  // Séparateur entre les favoris
  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  // Écran de chargement
  if (loading && favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#dc3545" />
        <Text style={styles.loadingText}>Chargement des favoris...</Text>
      </View>
    );
  }

  // Écran d'erreur
  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            dispatch(clearError());
            dispatch(loadFavorites());
          }}
        >
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Liste vide
  if (favorites.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyIcon}>💔</Text>
        <Text style={styles.emptyText}>Aucun favori sauvegardé</Text>
        <Text style={styles.emptySubtext}>
          Découvrez des événements et ajoutez-les à vos favoris depuis l'onglet Événements
        </Text>
        <TouchableOpacity 
          style={styles.discoverButton}
          onPress={() => navigation.navigate('MainTabs', { screen: 'Events' })}
        >
          <Text style={styles.discoverButtonText}>🎪 Découvrir des événements</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* En-tête */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Favoris</Text>
        <Text style={styles.headerSubtitle}>
          {favorites.length} événement{favorites.length > 1 ? 's' : ''} sauvegardé{favorites.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* Liste des favoris */}
      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    paddingBottom: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  listContainer: {
    padding: 16,
  },
  favoriteCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  favoriteImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#e9ecef',
  },
  favoriteInfo: {
    flex: 1,
    marginLeft: 16,
  },
  favoriteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  favoriteTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212529',
    flex: 1,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  removeButtonText: {
    fontSize: 16,
  },
  favoriteDate: {
    fontSize: 15,
    color: '#dc3545',
    fontWeight: '600',
    marginBottom: 8,
  },
  favoriteLocation: {
    marginBottom: 8,
  },
  favoriteVenue: {
    fontSize: 15,
    color: '#495057',
    fontWeight: '500',
    marginBottom: 2,
  },
  favoriteCity: {
    fontSize: 13,
    color: '#6c757d',
  },
  favoritePrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginBottom: 8,
  },
  favoriteTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#dc3545',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  favoriteTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  separator: {
    height: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  discoverButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  discoverButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 