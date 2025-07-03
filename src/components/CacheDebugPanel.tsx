import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CacheService } from "../services/cacheService";

interface CacheStats {
  totalEntries: number;
  totalSize: number;
  lastCleanup: Date | null;
}

export const CacheDebugPanel: React.FC = () => {
  const [stats, setStats] = useState<CacheStats>({
    totalEntries: 0,
    totalSize: 0,
    lastCleanup: null,
  });
  const [loading, setLoading] = useState(false);

  // Charger les statistiques du cache
  const loadStats = async () => {
    try {
      setLoading(true);
      const cacheStats = await CacheService.getCacheStats();
      setStats(cacheStats);
    } catch (error) {
      console.error("Erreur lors du chargement des stats:", error);
    } finally {
      setLoading(false);
    }
  };

  // Nettoyer le cache
  const handleCleanup = async () => {
    try {
      setLoading(true);
      await CacheService.cleanupCache();
      await loadStats();
      Alert.alert("✅ Succès", "Cache nettoyé avec succès");
    } catch (error) {
      Alert.alert("❌ Erreur", "Erreur lors du nettoyage du cache");
      console.error("Erreur cleanup:", error);
    } finally {
      setLoading(false);
    }
  };

  // Vider tout le cache
  const handleClearAll = () => {
    Alert.alert(
      "⚠️ Confirmation",
      "Êtes-vous sûr de vouloir vider tout le cache ?",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Vider",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await CacheService.clearAllCache();
              await loadStats();
              Alert.alert("✅ Succès", "Cache vidé avec succès");
            } catch (error) {
              Alert.alert("❌ Erreur", "Erreur lors du vidage du cache");
              console.error("Erreur clear:", error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Formater la taille en KB/MB
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / (1024 * 1024))} MB`;
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="analytics-outline" size={20} color="#3498db" />
        <Text style={styles.title}>Cache Debug Panel</Text>
        <TouchableOpacity onPress={loadStats} disabled={loading}>
          <Ionicons 
            name="refresh" 
            size={20} 
            color={loading ? "#bdc3c7" : "#3498db"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Statistiques */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Statistiques</Text>
          
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Entrées en cache:</Text>
            <Text style={styles.statValue}>{stats.totalEntries}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Taille totale:</Text>
            <Text style={styles.statValue}>{formatSize(stats.totalSize)}</Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>Dernier nettoyage:</Text>
            <Text style={styles.statValue}>
              {stats.lastCleanup 
                ? stats.lastCleanup.toLocaleString("fr-FR")
                : "Jamais"
              }
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔧 Actions</Text>
          
          <TouchableOpacity
            style={[styles.button, styles.cleanupButton]}
            onPress={handleCleanup}
            disabled={loading}
          >
            <Ionicons name="broom-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Nettoyer le cache</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.clearButton]}
            onPress={handleClearAll}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={18} color="#fff" />
            <Text style={styles.buttonText}>Vider tout le cache</Text>
          </TouchableOpacity>
        </View>

        {/* Informations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informations</Text>
          <Text style={styles.infoText}>
            • Le cache expire automatiquement après 24h
          </Text>
          <Text style={styles.infoText}>
            • Les recherches expirent après 1h
          </Text>
          <Text style={styles.infoText}>
            • Maximum 10 entrées en cache
          </Text>
          <Text style={styles.infoText}>
            • Nettoyage automatique toutes les 6h
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    margin: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    flex: 1,
    marginLeft: 8,
  },
  content: {
    maxHeight: 300,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e1e8ed",
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#34495e",
    marginBottom: 12,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  statValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2c3e50",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  cleanupButton: {
    backgroundColor: "#3498db",
  },
  clearButton: {
    backgroundColor: "#e74c3c",
  },
  buttonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoText: {
    fontSize: 11,
    color: "#7f8c8d",
    marginVertical: 2,
  },
}); 