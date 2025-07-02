import React, { useState, useCallback } from "react";
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
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store";
import {
  searchEvents,
  setSearchParams,
  clearEvents,
} from "../store/slices/eventsSlice";
import { SearchParams } from "../types/api";

export default function SearchScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { searchParams, loading } = useSelector(
    (state: RootState) => state.events,
  );

  // États locaux pour les filtres
  const [keyword, setKeyword] = useState(searchParams.keyword || "");
  const [city, setCity] = useState(searchParams.city || "Paris");
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  // États pour contrôler la visibilité des DateTimePickers
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // États temporaires pour iOS (confirmation)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  // Suggestions de villes populaires
  const popularCities = [
    "Paris",
    "Lyon",
    "Marseille",
    "Toulouse",
    "Nice",
    "Nantes",
    "Montpellier",
    "Strasbourg",
    "Bordeaux",
    "Lille",
  ];

  // Suggestions de mots-clés populaires
  const popularKeywords = [
    "concert",
    "théâtre",
    "sport",
    "festival",
    "comédie",
    "rock",
    "jazz",
    "classique",
    "enfants",
    "famille",
  ];

  // Fonction pour formater une date en string pour l'API (ISO 8601 avec timezone)
  const formatDateForAPI = (date: Date, isEndDate: boolean = false): string => {
    // Format ISO 8601 attendu par l'API Ticketmaster: YYYY-MM-DDTHH:mm:ssZ
    const isoString = date.toISOString();
    const dateOnly = isoString.split("T")[0];

    // Pour la date de début : 00:00:00, pour la date de fin : 23:59:59
    const timeString = isEndDate ? "23:59:59Z" : "00:00:00Z";
    return dateOnly + "T" + timeString;
  };

  // Fonction pour formater une date pour l'affichage
  const formatDateForDisplay = (date: Date): string => {
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Gestionnaires pour les DateTimePickers
  const onStartDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date,
  ) => {
    if (Platform.OS === "android") {
      // Sur Android, sélection directe
      setShowStartPicker(false);
      if (selectedDate) {
        setStartDate(selectedDate);
      }
    } else {
      // Sur iOS, stockage temporaire pour confirmation
      if (selectedDate) {
        setTempStartDate(selectedDate);
      }
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      // Sur Android, sélection directe
      setShowEndPicker(false);
      if (selectedDate) {
        setEndDate(selectedDate);
      }
    } else {
      // Sur iOS, stockage temporaire pour confirmation
      if (selectedDate) {
        setTempEndDate(selectedDate);
      }
    }
  };

  // Confirmer la date de début (iOS uniquement)
  const confirmStartDate = () => {
    if (tempStartDate) {
      setStartDate(tempStartDate);
    }
    setShowStartPicker(false);
    setTempStartDate(null);
  };

  // Annuler la date de début (iOS uniquement)
  const cancelStartDate = () => {
    setShowStartPicker(false);
    setTempStartDate(null);
  };

  // Confirmer la date de fin (iOS uniquement)
  const confirmEndDate = () => {
    if (tempEndDate) {
      setEndDate(tempEndDate);
    }
    setShowEndPicker(false);
    setTempEndDate(null);
  };

  // Annuler la date de fin (iOS uniquement)
  const cancelEndDate = () => {
    setShowEndPicker(false);
    setTempEndDate(null);
  };

  // Ouvrir le sélecteur de date de début
  const openStartPicker = () => {
    if (Platform.OS === "ios") {
      setTempStartDate(startDate || new Date());
    }
    setShowStartPicker(true);
  };

  // Ouvrir le sélecteur de date de fin
  const openEndPicker = () => {
    if (Platform.OS === "ios") {
      setTempEndDate(endDate || startDate || new Date());
    }
    setShowEndPicker(true);
  };

  // Lancer la recherche
  const handleSearch = useCallback(() => {
    const params: SearchParams = {
      keyword: keyword.trim() || undefined,
      city: city.trim() || "Paris",
      startDateTime: startDate ? formatDateForAPI(startDate, false) : undefined,
      endDateTime: endDate ? formatDateForAPI(endDate, true) : undefined,
      size: 20,
      page: 0,
    };

    // Mettre à jour les paramètres dans Redux
    dispatch(setSearchParams(params));

    // Effacer les résultats précédents et lancer la nouvelle recherche
    dispatch(clearEvents());
    dispatch(searchEvents(params));

    Alert.alert(
      "Recherche lancée",
      `Recherche ${keyword ? `"${keyword}"` : "tous événements"} à ${city}`,
      [{ text: "OK" }],
    );
  }, [dispatch, keyword, city, startDate, endDate]);

  // Réinitialiser les filtres
  const handleReset = useCallback(() => {
    setKeyword("");
    setCity("Paris");
    setStartDate(null);
    setEndDate(null);

    const defaultParams: SearchParams = {
      city: "Paris",
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* En-tête */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Ionicons
              name="search"
              size={32}
              color="#007AFF"
              style={styles.titleIcon}
            />
            <Text style={styles.title}>Recherche d'événements</Text>
          </View>
          <Text style={styles.subtitle}>
            Trouvez des événements par ville, dates ou mots-clés
          </Text>
        </View>

        {/* Mot-clé de recherche */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mot-clé (optionnel)</Text>
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
                style={[
                  styles.suggestionChip,
                  keyword === item && styles.suggestionChipSelected,
                ]}
                onPress={() => selectKeyword(item)}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    keyword === item && styles.suggestionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Ville */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ville</Text>
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
                style={[
                  styles.suggestionChip,
                  city === item && styles.suggestionChipSelected,
                ]}
                onPress={() => selectCity(item)}
              >
                <Text
                  style={[
                    styles.suggestionText,
                    city === item && styles.suggestionTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Filtres de dates */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Période (optionnel)</Text>

          <View style={styles.dateContainer}>
            {/* Date de début */}
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Date de début :</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={openStartPicker}
              >
                <View style={styles.dateButtonContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#007AFF"
                    style={styles.dateButtonIcon}
                  />
                  <Text style={styles.dateButtonText}>
                    {startDate
                      ? formatDateForDisplay(startDate)
                      : "Sélectionner une date"}
                  </Text>
                </View>
              </TouchableOpacity>

              {showStartPicker && (
                <View>
                  <DateTimePicker
                    value={
                      Platform.OS === "ios"
                        ? tempStartDate || startDate || new Date()
                        : startDate || new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onStartDateChange}
                    minimumDate={new Date()}
                  />

                  {/* Boutons de confirmation pour iOS */}
                  {Platform.OS === "ios" && (
                    <View style={styles.confirmButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelStartDate}
                      >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={confirmStartDate}
                      >
                        <Text style={styles.confirmButtonText}>Confirmer</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Date de fin */}
            <View style={styles.dateInput}>
              <Text style={styles.dateLabel}>Date de fin :</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={openEndPicker}
              >
                <View style={styles.dateButtonContent}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#007AFF"
                    style={styles.dateButtonIcon}
                  />
                  <Text style={styles.dateButtonText}>
                    {endDate
                      ? formatDateForDisplay(endDate)
                      : "Sélectionner une date"}
                  </Text>
                </View>
              </TouchableOpacity>

              {showEndPicker && (
                <View>
                  <DateTimePicker
                    value={
                      Platform.OS === "ios"
                        ? tempEndDate || endDate || startDate || new Date()
                        : endDate || startDate || new Date()
                    }
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={onEndDateChange}
                    minimumDate={startDate || new Date()}
                  />

                  {/* Boutons de confirmation pour iOS */}
                  {Platform.OS === "ios" && (
                    <View style={styles.confirmButtonsContainer}>
                      <TouchableOpacity
                        style={styles.cancelButton}
                        onPress={cancelEndDate}
                      >
                        <Text style={styles.cancelButtonText}>Annuler</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.confirmButton}
                        onPress={confirmEndDate}
                      >
                        <Text style={styles.confirmButtonText}>Confirmer</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* Boutons pour effacer les dates */}
            {(startDate || endDate) && (
              <View style={styles.dateActionsContainer}>
                {startDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={() => setStartDate(null)}
                  >
                    <View style={styles.clearButtonContent}>
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#dc3545"
                      />
                      <Text style={styles.clearDateText}>Effacer début</Text>
                    </View>
                  </TouchableOpacity>
                )}
                {endDate && (
                  <TouchableOpacity
                    style={styles.clearDateButton}
                    onPress={() => setEndDate(null)}
                  >
                    <View style={styles.clearButtonContent}>
                      <Ionicons
                        name="trash-outline"
                        size={16}
                        color="#dc3545"
                      />
                      <Text style={styles.clearDateText}>Effacer fin</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>

          <View style={styles.helperContainer}>
            <Ionicons
              name="information-circle-outline"
              size={16}
              color="#6c757d"
            />
            <Text style={styles.dateHelper}>
              Sélectionnez des dates pour filtrer les événements dans une
              période précise
            </Text>
          </View>
        </View>

        {/* Boutons d'action */}
        <View style={styles.actionsSection}>
          <TouchableOpacity
            style={[styles.actionButton, styles.searchButton]}
            onPress={handleSearch}
            disabled={loading}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons
                name={loading ? "hourglass-outline" : "search"}
                size={20}
                color="#fff"
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText}>
                {loading ? "Recherche..." : "Rechercher"}
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.resetButton]}
            onPress={handleReset}
            disabled={loading}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons
                name="refresh-outline"
                size={20}
                color="#6c757d"
                style={styles.actionButtonIcon}
              />
              <Text style={styles.resetButtonText}>Réinitialiser</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
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
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#6c757d",
    textAlign: "center",
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
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
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 16,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: "#f8f9fa",
    color: "#212529",
  },
  suggestionsTitle: {
    fontSize: 14,
    color: "#6c757d",
    marginTop: 16,
    marginBottom: 12,
    fontWeight: "500",
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 8,
  },
  suggestionChipSelected: {
    backgroundColor: "#007AFF",
  },
  suggestionText: {
    fontSize: 14,
    color: "#495057",
    fontWeight: "500",
  },
  suggestionTextSelected: {
    color: "#fff",
  },
  dateContainer: {
    gap: 16,
  },
  dateInput: {
    gap: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
  },
  dateHelper: {
    fontSize: 13,
    color: "#6c757d",
    marginTop: 12,
    fontStyle: "italic",
  },
  actionsSection: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  searchButton: {
    backgroundColor: "#007AFF",
  },
  resetButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resetButtonText: {
    color: "#6c757d",
    fontSize: 16,
    fontWeight: "600",
  },
  instructionsSection: {
    backgroundColor: "#e3f2fd",
    borderRadius: 12,
    padding: 16,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: "#1976d2",
    lineHeight: 20,
  },
  bold: {
    fontWeight: "bold",
  },
  dateButton: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    alignItems: "center",
  },
  dateButtonText: {
    fontSize: 16,
    color: "#212529",
    fontWeight: "500",
  },
  dateActionsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  clearDateButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: "#dee2e6",
    borderRadius: 12,
    alignItems: "center",
  },
  clearDateText: {
    fontSize: 14,
    color: "#6c757d",
    fontWeight: "500",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  titleIcon: {
    marginRight: 12,
  },
  dateButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dateButtonIcon: {
    marginRight: 8,
  },
  clearButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helperContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginTop: 12,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonIcon: {
    marginRight: 8,
  },
  // Styles pour la confirmation iOS
  confirmButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f8f9fa",
    borderTopWidth: 1,
    borderTopColor: "#dee2e6",
  },
  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dc3545",
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#dc3545",
    fontSize: 16,
    fontWeight: "600",
  },
  confirmButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
