import React, { memo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface CacheStatusIndicatorProps {
  isFromCache: boolean;
  isOfflineMode: boolean;
  lastCacheUpdate: number | null;
  onRefresh?: () => void;
  style?: object;
}

export const CacheStatusIndicator = memo<CacheStatusIndicatorProps>(
  ({
    isFromCache,
    isOfflineMode,
    lastCacheUpdate: _lastCacheUpdate,
    onRefresh,
    style,
  }) => {
    // Ne rien afficher si on n'est pas en mode cache/offline
    if (!isFromCache && !isOfflineMode) {
      return null;
    }

    const renderOfflineIndicator = () => (
      <View style={[styles.container, styles.offlineContainer, style]}>
        <View style={styles.iconContainer}>
          <Ionicons name="cloud-offline-outline" size={16} color="#f39c12" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Mode hors ligne</Text>
          <Text style={styles.subtitle}>Données disponibles localement</Text>
        </View>
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.refreshButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh-outline" size={16} color="#f39c12" />
          </TouchableOpacity>
        )}
      </View>
    );

    const renderCacheIndicator = () => (
      <View style={[styles.container, styles.cacheContainer, style]}>
        <View style={styles.iconContainer}>
          <Ionicons name="archive-outline" size={16} color="#3498db" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Données en cache</Text>
          <Text style={styles.subtitle}>Tirez pour actualiser</Text>
        </View>
        {onRefresh && (
          <TouchableOpacity
            onPress={onRefresh}
            style={styles.refreshButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="refresh-outline" size={16} color="#3498db" />
          </TouchableOpacity>
        )}
      </View>
    );

    return isOfflineMode ? renderOfflineIndicator() : renderCacheIndicator();
  },
);

CacheStatusIndicator.displayName = "CacheStatusIndicator";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  offlineContainer: {
    backgroundColor: "#fff8dc", // Light yellow background
  },
  cacheContainer: {
    backgroundColor: "#f0f8ff", // Light blue background
  },
  iconContainer: {
    marginRight: 8,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 10,
    color: "#7f8c8d",
  },
  refreshButton: {
    padding: 4,
    marginLeft: 8,
  },
});

export default CacheStatusIndicator;
