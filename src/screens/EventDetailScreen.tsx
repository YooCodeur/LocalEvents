import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { EventDetailScreenProps } from '../types/navigation';

export default function EventDetailScreen({ route, navigation }: EventDetailScreenProps) {
  const { event } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{event.name}</Text>
      <Text style={styles.subtitle}>Détails de l'événement</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>{event.date}</Text>
        
        <Text style={styles.label}>Lieu:</Text>
        <Text style={styles.value}>{event.venue}</Text>
        
        <Text style={styles.label}>Ville:</Text>
        <Text style={styles.value}>{event.city}</Text>
      </View>

      <TouchableOpacity 
        style={styles.favoriteButton}
        onPress={() => {
          // TODO: Implémenter l'ajout/suppression des favoris
          console.log('Toggle favorite for event:', event.id);
        }}
      >
        <Text style={styles.favoriteButtonText}>
          {event.isFavorite ? '❤️ Retirer des favoris' : '🤍 Ajouter aux favoris'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  infoContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
  },
  value: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  favoriteButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  favoriteButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 