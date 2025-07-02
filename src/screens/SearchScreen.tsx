import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { searchEvents, setSearchParams, clearEvents } from '../store/slices/eventsSlice';
import { SearchParams } from '../types/api';

export default function SearchScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { searchParams, loading } = useSelector((state: RootState) => state.events);

  // États locaux pour les filtres
  const [keyword, setKeyword] = useState(searchParams.keyword || '');
  const [city, setCity] = useState(searchParams.city || 'Paris');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Suggestions de villes populaires
  const popularCities = [
    'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 
    'Nantes', 'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille'
  ];

  // Suggestions de mots-clés populaires
  const popularKeywords = [
    'concert', 'théâtre', 'sport', 'festival', 'comédie',
    'rock', 'jazz', 'classique', 'enfants', 'famille'
  ];

  // Lancer la recherche
  const handleSearch = useCallback(() => {
    const params: SearchParams = {
      keyword: keyword.trim() || undefined,
      city: city.trim() || 'Paris',
      startDateTime: startDate || undefined,
      endDateTime: endDate || undefined,
      size: 20,
      page: 0,
    };

    // Mettre à jour les paramètres dans Redux
    dispatch(setSearchParams(params));
    
    // Effacer les résultats précédents et lancer la nouvelle recherche
    dispatch(clearEvents());
    dispatch(searchEvents(params));

    Alert.alert(
      'Recherche lancée',
      `Recherche ${keyword ? `"${keyword}"` : 'tous événements'} à ${city}`,
      [{ text: 'OK' }]
    );
  }, [dispatch, keyword, city, startDate, endDate]);

  // Réinitialiser les filtres
  const handleReset = useCallback(() => {
    setKeyword('');
    setCity('Paris');
    setStartDate('');
    setEndDate('');
    
    const defaultParams: SearchParams = {
      city: 'Paris',
      size: 20,
      page: 0,
    };
    
    dispatch(setSearchParams(defaultParams));
    dispatch(clearEvents());
  }, [dispatch]);

  // Sélectionner une ville suggérée
  const selectCity = useCallback((selectedCity: string) => {
    setCity(selectedCity);
  }, []);

  // Sélectionner un mot-clé suggéré
  const selectKeyword = useCallback((selectedKeyword: string) => {
    setKeyword(selectedKeyword);
  }, []);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête */}
        <View style={styles.header}>
          <Text style={styles.title}>🔍 Recherche d'événements</Text>
          <Text style={styles.subtitle}>
            Trouvez des événements par ville, dates ou mots-clés
          </Text>
        </View>

        {/* Mot-clé de recherche */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎪 Mot-clé (optionnel)</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: concert, théâtre, rock..."
            value={keyword}
            onChangeText={setKeyword}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          
          {/* Suggestions de mots-clés */}
          <Text style={styles.suggestionsTitle}>Suggestions populaires :</Text>
          <View style={styles.suggestionsContainer}>
            {popularKeywords.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.suggestionChip, keyword === item && styles.suggestionChipSelected]}
                onPress={() => selectKeyword(item)}
              >
                <Text style={[styles.suggestionText, keyword === item && styles.suggestionTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ville */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏙️ Ville</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ex: Paris, Lyon, Marseille..."
            value={city}
            onChangeText={setCity}
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          
          {/* Suggestions de villes */}
          <Text style={styles.suggestionsTitle}>Villes populaires :</Text>
          <View style={styles.suggestionsContainer}>
            {popularCities.map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.suggestionChip, city === item && styles.suggestionChipSelected]}
                onPress={() => selectCity(item)}
              >
                <Text style={[styles.suggestionText, city === item && styles.suggestionTextSelected]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtres de dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 Période (optionnel)</Text>
          
          <View style={styles.dateContainer}>
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Date de début :</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={startDate}
                onChangeText={setStartDate}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Date de fin :</Text>
              <TextInput
                style={styles.textInput}
                placeholder="YYYY-MM-DD"
                value={endDate}
                onChangeText={setEndDate}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="numeric"
              />
            </View>
          </View>
          
          <Text style={styles.dateHelper}>
            💡 Format : YYYY-MM-DD (ex: 2024-12-25)
          </Text>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.searchButton]}
            onPress={handleSearch}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading ? '🔍 Recherche...' : '🔍 Rechercher'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleReset}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>🔄 Réinitialiser</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.instructionsTitle}>ℹ️ Comment utiliser</Text>
          <Text style={styles.instructionsText}>
            • <Text style={styles.bold}>Mot-clé</Text> : Tapez "rock", "concert", "enfants"...{'\n'}
            • <Text style={styles.bold}>Ville</Text> : Choisissez ou tapez une ville française{'\n'}
            • <Text style={styles.bold}>Dates</Text> : Filtrez par période spécifique{'\n'}
            • <Text style={styles.bold}>Résultats</Text> : Consultez l'onglet "Événements" après recherche
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#dee2e6',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    color: '#212529',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 12,
    fontWeight: '500',
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  suggestionChipSelected: {
    backgroundColor: '#007AFF',
  },
  suggestionText: {
    fontSize: 14,
    color: '#495057',
    fontWeight: '500',
  },
  suggestionTextSelected: {
    color: '#fff',
  },
  dateContainer: {
    gap: 16,
  },
  dateInput: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
  },
  dateHelper: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 12,
    fontStyle: 'italic',
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  searchButton: {
    backgroundColor: '#007AFF',
  },
  resetButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButtonText: {
    color: '#6c757d',
    fontSize: 16,
    fontWeight: '600',
  },
  instructionsSection: {
    backgroundColor: '#e3f2fd',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
}); 