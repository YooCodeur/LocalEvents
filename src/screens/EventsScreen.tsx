import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, AppDispatch } from '../store';
import { fetchEvents, clearError } from '../store/slices/eventsSlice';
import { LocalEvent } from '../types/api';

export default function EventsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  
  const { events, loading, error, searchParams, hasMore } = useSelector((state: RootState) => state.events);

  // Charger les événements au démarrage
  useEffect(() => {
    dispatch(fetchEvents(searchParams));
  }, [dispatch]);

  // Pull to refresh
  const onRefresh = useCallback(() => {
    dispatch(clearError());
    dispatch(fetchEvents({ ...searchParams, page: 0 }));
  }, [dispatch, searchParams]);

  // Naviguer vers le détail d'un événement
  const handleEventPress = useCallback((event: LocalEvent) => {
    navigation.navigate('EventDetail', { event });
  }, [navigation]);

  // Rendu d'un événement
  const renderEvent = useCallback(({ item }: { item: LocalEvent }) => (
    <TouchableOpacity style={styles.eventCard} onPress={() => handleEventPress(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
      <View style={styles.eventInfo}>
        <Text style={styles.eventTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.eventDate}>{item.date}</Text>
        <View style={styles.eventLocation}>
          <Text style={styles.eventVenue} numberOfLines={1}>{item.venue}</Text>
          <Text style={styles.eventCity}>{item.city}</Text>
        </View>
        {item.priceRange && (
          <Text style={styles.eventPrice}>{item.priceRange}</Text>
        )}
      </View>
      <View style={styles.favoriteIcon}>
        <Text>{item.isFavorite ? '❤️' : '🤍'}</Text>
      </View>
    </TouchableOpacity>
  ), [handleEventPress]);

  // Séparateur entre les événements
  const ItemSeparator = useCallback(() => <View style={styles.separator} />, []);

  // Écran de chargement initial
  if (loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des événements...</Text>
      </View>
    );
  }

  // Écran d'erreur
  if (error && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>❌ {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Liste vide
  if (!loading && events.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>🎪 Aucun événement trouvé</Text>
        <Text style={styles.emptySubtext}>
          Tirez vers le bas pour actualiser ou changez vos critères de recherche
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Actualiser</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={ItemSeparator}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            title="Actualisation..."
          />
        }
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
  listContainer: {
    padding: 16,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#e9ecef',
  },
  eventInfo: {
    flex: 1,
    marginLeft: 12,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  eventDate: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginBottom: 6,
  },
  eventLocation: {
    marginBottom: 4,
  },
  eventVenue: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  eventCity: {
    fontSize: 12,
    color: '#6c757d',
  },
  eventPrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '600',
    marginTop: 4,
  },
  favoriteIcon: {
    padding: 8,
  },
  separator: {
    height: 12,
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
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 