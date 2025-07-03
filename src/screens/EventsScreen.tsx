import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../types/navigation";
import type { LocalEvent } from "../types/api";

// Hooks personnalisés
import { useEvents, useFavorites } from "../hooks";

// Composants
import {
  EventCard,
  ErrorMessage,
  EmptyState,
  EventsSkeletonList,
  CacheStatusIndicator,
} from "../components";

type NavigationProp = StackNavigationProp<RootStackParamList, "EventDetail">;

const { height } = Dimensions.get("window");

export default function EventsScreen() {
  const navigation = useNavigation<NavigationProp>();

  // Hooks personnalisés
  const { 
    events, 
    loading, 
    error, 
    refreshEvents, 
    loadEvents, 
    isFromCache, 
    lastCacheUpdate, 
    isOfflineMode 
  } = useEvents();
  const { toggleFavorite, isFavorite } = useFavorites();

  // Charger les événements au démarrage
  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  // Naviguer vers le détail d'un événement
  const handleEventPress = useCallback(
    (event: LocalEvent) => {
      navigation.navigate("EventDetail", { event });
    },
    [navigation],
  );

  // Gérer le toggle favori
  const handleToggleFavorite = useCallback(
    (event: LocalEvent) => {
      const updatedEvent = { ...event, isFavorite: isFavorite(event.id) };
      toggleFavorite(updatedEvent);
    },
    [toggleFavorite, isFavorite],
  );

  // Section Hero décorative
  const renderHeroSection = useCallback(
    () => (
      <LinearGradient
        colors={["#667eea", "#764ba2", "#f093fb"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.heroSection, { height: height * 0.35 }]}
      >
        {/* Éléments décoratifs flottants */}
        <View style={styles.floatingElements}>
          <View style={[styles.floatingIcon, styles.icon1]}>
            <MaterialIcons
              name="event"
              size={30}
              color="rgba(255,255,255,0.3)"
            />
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
    ),
    [],
  );

  // Rendu d'un événement avec le composant EventCard
  const renderEvent = useCallback(
    ({ item }: { item: LocalEvent }) => (
      <EventCard
        event={{ ...item, isFavorite: isFavorite(item.id) }}
        onPress={handleEventPress}
        onToggleFavorite={handleToggleFavorite}
        style={styles.eventCardStyle}
      />
    ),
    [handleEventPress, handleToggleFavorite, isFavorite],
  );

  // Séparateur entre les événements
  const ItemSeparator = useCallback(
    () => <View style={styles.separator} />,
    [],
  );

  // Header avec le titre des événements
  const renderEventsHeader = useCallback(
    () => (
      <View style={styles.eventsHeaderContainer}>
        <Text style={styles.eventsTitle}>Événements disponibles</Text>
      </View>
    ),
    [],
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
          <ErrorMessage
            message={error}
            onRetry={refreshEvents}
            retryText="Réessayer"
          />
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
          <EmptyState
            icon="calendar-outline"
            title="Aucun événement trouvé"
            message="Tirez vers le bas pour actualiser ou changez vos critères de recherche"
            actionText="Actualiser"
            onAction={refreshEvents}
          />
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
        ListHeaderComponent={
          <>
            {renderHeroSection()}
            <CacheStatusIndicator
              isFromCache={isFromCache}
              isOfflineMode={isOfflineMode}
              lastCacheUpdate={lastCacheUpdate}
              onRefresh={refreshEvents}
            />
            {renderEventsHeader()}
          </>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refreshEvents} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  heroSection: {
    position: "relative",
    overflow: "hidden",
  },
  floatingElements: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  floatingIcon: {
    position: "absolute",
    borderRadius: 25,
    padding: 10,
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
    top: "55%",
    right: "10%",
  },
  icon5: {
    top: "35%",
    left: "50%",
  },
  heroContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  heroTextContainer: {
    alignItems: "center",
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 24,
    fontWeight: "300",
    color: "#fff",
    textAlign: "center",
    opacity: 0.9,
  },
  wave: {
    position: "absolute",
    bottom: -1,
    left: 0,
    right: 0,
    height: 30,
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  eventsContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  eventsHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
  },
  eventsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  flatListContent: {
    paddingBottom: 20,
  },
  eventCardStyle: {
    marginHorizontal: 16,
  },
  separator: {
    height: 12,
  },
});
