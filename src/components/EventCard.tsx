import React, { memo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CachedImage } from "./CachedImage";
import type { LocalEvent } from "../types/api";

interface EventCardProps {
  event: LocalEvent;
  onPress: (event: LocalEvent) => void;
  onToggleFavorite?: (event: LocalEvent) => void;
  showFavoriteButton?: boolean;
  style?: ViewStyle;
}

export const EventCard = memo<EventCardProps>(
  ({ event, onPress, onToggleFavorite, showFavoriteButton = true, style }) => {
    const handlePress = () => {
      onPress(event);
    };

    const handleFavoritePress = () => {
      onToggleFavorite?.(event);
    };

    return (
      <TouchableOpacity
        style={[styles.card, style]}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <CachedImage 
          source={{ uri: event.imageUrl }} 
          style={styles.image}
          eventId={event.id}
          loadingIndicatorSize="small"
          resizeMode="cover"
        />

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {event.name}
          </Text>

          <Text style={styles.date}>{event.date}</Text>

          <View style={styles.location}>
            <Ionicons name="location-outline" size={14} color="#666" />
            <Text style={styles.venue} numberOfLines={1}>
              {event.venue}
            </Text>
          </View>

          <Text style={styles.city}>{event.city}</Text>

          {event.priceRange && (
            <Text style={styles.price}>{event.priceRange}</Text>
          )}
        </View>

        {showFavoriteButton && onToggleFavorite && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name={event.isFavorite ? "heart" : "heart-outline"}
              size={24}
              color={event.isFavorite ? "#ff6b6b" : "#666"}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  },
);

EventCard.displayName = "EventCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
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
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#f0f0f0",
  },
  content: {
    flex: 1,
    marginLeft: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 4,
  },
  location: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  venue: {
    fontSize: 13,
    color: "#666",
    marginLeft: 4,
    flex: 1,
  },
  city: {
    fontSize: 13,
    color: "#888",
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: "600",
    color: "#28a745",
  },
  favoriteButton: {
    padding: 8,
  },
});
