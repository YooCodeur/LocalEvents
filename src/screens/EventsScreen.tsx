import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { RootState, AppDispatch } from "../store";
import { fetchEvents, clearError } from "../store/slices/eventsSlice";
import { LocalEvent } from "../types/api";
import { EventsSkeletonList } from "../components/SkeletonLoader";
import type { RootStackParamList } from "../types/navigation";

type NavigationProp = StackNavigationProp<RootStackParamList, "EventDetail">;

const { height } = Dimensions.get("window");

export default function EventsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation<NavigationProp>();

  const { events, loading, error, searchParams } = useSelector(
    (state: RootState) => state.events,
  );

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
  const handleEventPress = useCallback(
    (event: LocalEvent) => {
      navigation.navigate("EventDetail", { event });
    },
    [navigation],
  );

  // Section Hero décorative
  const renderHeroSection = () => (
    <LinearGradient
      colors={["#667eea", "#764ba2", "#f093fb"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.heroSection, { height: height * 0.35 }]}
    >
      {/* Éléments décoratifs flottants */}
      <View style={styles.floatingElements}>
        <View style={[styles.floatingIcon, styles.icon1]}>
          <MaterialIcons name="event" size={30} color="rgba(255,255,255,0.3)" />
        </View>
        <View style={[styles.floatingIcon, styles.icon2]}>
          <Ionicons
            name="musical-notes"
            size={25}
            color="rgba(255,255,255,0.4)"
          />
        </View>
        <View style={[styles.floatingIcon, styles.icon3]}>
          <FontAwesome5
            name="theater-masks"
            size={28}
            color="rgba(255,255,255,0.3)"
          />
        </View>
        <View style={[styles.floatingIcon, styles.icon4]}>
          <MaterialIcons
            name="sports-basketball"
            size={32}
            color="rgba(255,255,255,0.3)"
          />
        </View>
        <View style={[styles.floatingIcon, styles.icon5]}>
          <Ionicons name="camera" size={26} color="rgba(255,255,255,0.4)" />
        </View>
      </View>

      {/* Contenu principal */}
      <View style={styles.heroContent}>
        <View style={styles.heroTextContainer}>
          <Text style={styles.heroTitle}>Découvrez</Text>
          <Text style={styles.heroSubtitle}>des événements</Text>
          <Text style={styles.heroSubtitle}>exceptionnels</Text>
        </View>
      </View>

      {/* Vague décorative en bas */}
      <View style={styles.wave} />
    </LinearGradient>
  );

  // Rendu d'un événement
  const renderEvent = useCallback(
    ({ item }: { item: LocalEvent }) => (
      <TouchableOpacity
        style={styles.eventCard}
        onPress={() => handleEventPress(item)}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.eventImage} />
        <View style={styles.eventInfo}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.eventDate}>{item.date}</Text>
          <View style={styles.eventLocation}>
            <Text style={styles.eventVenue} numberOfLines={1}>
              {item.venue}
            </Text>
            <Text style={styles.eventCity}>{item.city}</Text>
          </View>
          {item.priceRange && (
            <Text style={styles.eventPrice}>{item.priceRange}</Text>
          )}
        </View>
      </TouchableOpacity>
    ),
    [handleEventPress],
  );

  // Séparateur entre les événements
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // Header avec le titre des événements
  const renderEventsHeader = () => (
    <View style={styles.eventsHeaderContainer}>
      <Text style={styles.eventsTitle}>Événements disponibles</Text>
    </View>
  );

  // Écran de chargement initial avec skeleton
  if (loading && events.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeroSection()}
        <View style={styles.eventsContainer}>
          <EventsSkeletonList count={6} />
        </View>
      </View>
    );
  }

  // Écran d'erreur
  if (error && events.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeroSection()}
        <View style={styles.eventsContainer}>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#dc3545" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Liste vide
  if (!loading && events.length === 0) {
    return (
      <View style={styles.container}>
        {renderHeroSection()}
        <View style={styles.eventsContainer}>
          <View style={styles.errorContainer}>
            <MaterialIcons name="event-busy" size={48} color="#6c757d" />
            <Text style={styles.emptyText}>Aucun événement trouvé</Text>
            <Text style={styles.emptySubtext}>
              Tirez vers le bas pour actualiser ou changez vos critères de
              recherche
            </Text>
            <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
              <Text style={styles.retryButtonText}>Actualiser</Text>
            </TouchableOpacity>
          </View>
        </View>
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
        ListHeaderComponent={() => (
          <>
            {renderHeroSection()}
            {renderEventsHeader()}
          </>
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={onRefresh}
            colors={["#007AFF"]}
            title="Actualisation..."
          />
        }
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  listContainer: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 10,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    height: 140,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  eventImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: "#e9ecef",
  },
  eventInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "space-between",
    height: 100,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#212529",
    marginBottom: 6,
    height: 40,
  },
  eventDate: {
    fontSize: 13,
    color: "#007AFF",
    fontWeight: "500",
    marginBottom: 4,
  },
  eventLocation: {
    marginBottom: 2,
    flex: 1,
  },
  eventVenue: {
    fontSize: 13,
    color: "#495057",
    fontWeight: "500",
    marginBottom: 2,
  },
  eventCity: {
    fontSize: 11,
    color: "#6c757d",
  },
  eventPrice: {
    fontSize: 13,
    color: "#28a745",
    fontWeight: "600",
    marginTop: 2,
  },
  separator: {
    height: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6c757d",
  },
  errorText: {
    fontSize: 16,
    color: "#dc3545",
    textAlign: "center",
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#495057",
    textAlign: "center",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Styles pour la section Hero
  heroSection: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  floatingElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingIcon: {
    position: "absolute",
    borderRadius: 50,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  icon1: {
    top: "15%",
    left: "10%",
  },
  icon2: {
    top: "25%",
    right: "15%",
  },
  icon3: {
    top: "45%",
    left: "5%",
  },
  icon4: {
    top: "60%",
    right: "20%",
  },
  icon5: {
    top: "35%",
    right: "45%",
  },
  heroContent: {
    alignItems: "center",
    zIndex: 2,
  },
  heroTextContainer: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 42,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroSubtitle: {
    fontSize: 28,
    fontWeight: "600",
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },

  wave: {
    position: "absolute",
    bottom: -5,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
  // Styles pour la section événements
  eventsContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    paddingTop: 15,
  },
  eventsHeaderContainer: {
    backgroundColor: "#f8f9fa",
    paddingTop: 10,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  eventsTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#212529",
    textAlign: "center",
  },
  eventsList: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
