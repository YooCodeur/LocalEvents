import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Linking,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { EventDetailScreenProps } from "../types/navigation";
import { RootState, AppDispatch } from "../store";
import {
  toggleFavoriteAsync,
  type FavoritesState,
} from "../store/slices/favoritesSlice";
import { LocalEvent } from "../types/api";

export default function EventDetailScreen({
  route,
  navigation,
}: EventDetailScreenProps) {
  const { event } = route.params;
  const dispatch = useDispatch<AppDispatch>();

  const favoritesState = useSelector(
    (state: RootState) => state.favorites as FavoritesState,
  );
  const { favorites, loading, error } = favoritesState;
  const [imageLoading, setImageLoading] = useState(true);

  // État local pour mise à jour immédiate de l'interface
  const isInReduxFavorites = favorites.some(
    (fav: LocalEvent) => fav.id === event.id,
  );
  const [localIsFavorite, setLocalIsFavorite] = useState(isInReduxFavorites);

  // Synchroniser l'état local avec Redux
  useEffect(() => {
    setLocalIsFavorite(isInReduxFavorites);
  }, [isInReduxFavorites]);

  // Gestion d'erreur : remettre l'état local en cas d'échec
  useEffect(() => {
    if (error) {
      setLocalIsFavorite(isInReduxFavorites);
      Alert.alert(
        "Erreur",
        "Impossible de modifier le favori. Veuillez réessayer.",
      );
    }
  }, [error, isInReduxFavorites]);

  // Utiliser l'état local pour l'affichage
  const isFavorite = localIsFavorite;

  // Mise à jour du titre de navigation
  useEffect(() => {
    navigation.setOptions({
      title:
        event.name.length > 25
          ? event.name.substring(0, 25) + "..."
          : event.name,
    });
  }, [navigation, event.name]);

  // Gestion des favoris
  const handleToggleFavorite = () => {
    // Mise à jour immédiate de l'interface pour UX optimiste
    setLocalIsFavorite(!localIsFavorite);

    // Dispatch de l'action asynchrone pour persistance
    dispatch(toggleFavoriteAsync(event));
  };

  // Ouvrir le lien externe
  const handleOpenUrl = async () => {
    if (!event.url) {
      Alert.alert("Information", "Aucun lien disponible pour cet événement");
      return;
    }

    try {
      const supported = await Linking.canOpenURL(event.url);
      if (supported) {
        await Linking.openURL(event.url);
      } else {
        Alert.alert("Erreur", "Impossible d'ouvrir ce lien");
      }
    } catch {
      Alert.alert("Erreur", "Erreur lors de l'ouverture du lien");
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Image principale */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: event.imageUrl }}
          style={styles.eventImage}
          onLoadStart={() => setImageLoading(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={styles.imageLoader}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}

        {/* Bouton favori en overlay */}
        <TouchableOpacity
          style={[
            styles.favoriteButton,
            isFavorite && styles.favoriteButtonActive,
          ]}
          onPress={handleToggleFavorite}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.favoriteIcon}>{isFavorite ? "❤️" : "🤍"}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Contenu principal */}
      <View style={styles.content}>
        {/* Titre et statut favori */}
        <View style={styles.header}>
          <Text style={styles.title}>{event.name}</Text>
          {isFavorite && (
            <View style={styles.favoriteTag}>
              <Text style={styles.favoriteTagText}>❤️ Favori</Text>
            </View>
          )}
        </View>

        {/* Informations principales */}
        <View style={styles.infoSection}>
          <InfoRow icon="📅" label="Date" value={event.date} />
          <InfoRow icon="📍" label="Lieu" value={event.venue} />
          <InfoRow icon="🏙️" label="Ville" value={event.city} />
          {event.priceRange && (
            <InfoRow icon="💰" label="Prix" value={event.priceRange} />
          )}
        </View>

        {/* Description */}
        {event.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>📋 Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {/* Bouton favoris principal */}
          <TouchableOpacity
            style={[styles.actionButton, styles.favoriteActionButton]}
            onPress={handleToggleFavorite}
            disabled={loading}
          >
            <Text style={styles.actionButtonText}>
              {loading
                ? "Sauvegarde..."
                : isFavorite
                  ? "Retirer des favoris"
                  : "Ajouter aux favoris"}
            </Text>
          </TouchableOpacity>

          {/* Bouton lien externe */}
          {event.url && (
            <TouchableOpacity
              style={[styles.actionButton, styles.linkButton]}
              onPress={handleOpenUrl}
            >
              <Text style={styles.actionButtonText}>
                {" "}
                Voir sur Ticketmaster
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

// Composant pour les lignes d'info
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}:</Text>
    </View>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  imageContainer: {
    position: "relative",
    height: 250,
    backgroundColor: "#e9ecef",
  },
  eventImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imageLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(248, 249, 250, 0.8)",
  },
  favoriteButton: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  favoriteButtonActive: {
    backgroundColor: "rgba(220, 53, 69, 0.8)",
  },
  favoriteIcon: {
    fontSize: 24,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 8,
    lineHeight: 30,
  },
  favoriteTag: {
    alignSelf: "flex-start",
    backgroundColor: "#dc3545",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  favoriteTagText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f8f9fa",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#495057",
  },
  infoValue: {
    fontSize: 16,
    color: "#212529",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
  },
  descriptionSection: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#212529",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: "#495057",
    lineHeight: 24,
  },
  actionsSection: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  favoriteActionButton: {
    backgroundColor: "#dc3545",
  },
  linkButton: {
    backgroundColor: "#28a745",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
