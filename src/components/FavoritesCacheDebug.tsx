import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImageCacheService } from "../services/imageCacheService";

interface CacheStats {
  totalFavoriteImages: number;
  favoriteCacheSize: number;
  favoriteCacheSizeMB: number;
}

export const FavoritesCacheDebug: React.FC = () => {
  const [stats, setStats] = useState<CacheStats>({
    totalFavoriteImages: 0,
    favoriteCacheSize: 0,
    favoriteCacheSizeMB: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const favoriteStats = await ImageCacheService.getFavoritesCacheStats();
      setStats(favoriteStats);
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎯 Cache des Favoris</Text>
      </View>

      {loading ? (
        <Text style={styles.loadingText}>Chargement...</Text>
      ) : (
        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Images en cache :</Text>
            <Text style={styles.statValue}>{stats.totalFavoriteImages}</Text>
          </View>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Taille totale :</Text>
            <Text style={styles.statValue}>{stats.favoriteCacheSizeMB} MB</Text>
          </View>

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle" size={16} color="#007AFF" />
            <Text style={styles.infoText}>
              Les images de vos favoris sont disponibles hors ligne !
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity onPress={loadStats} style={styles.refreshButton}>
        <Ionicons name="refresh" size={16} color="#007AFF" />
        <Text style={styles.refreshText}>Actualiser</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  header: {
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
  },
  loadingText: {
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
  },
  statsContainer: {
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: "#1976d2",
    lineHeight: 16,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 8,
    gap: 6,
  },
  refreshText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "500",
  },
}); 