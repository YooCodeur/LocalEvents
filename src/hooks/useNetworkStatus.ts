import { useState, useEffect } from "react";
import { Platform } from "react-native";

// Type pour le statut de connexion
export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  type: string | null;
}

// Hook simple pour détecter le statut réseau
// Note: Pour une implémentation complète, il faudrait installer @react-native-netinfo
export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true, // Par défaut on assume qu'on est connecté
    isInternetReachable: true,
    type: "wifi",
  });

  useEffect(() => {
    // Pour l'instant, nous simulons une détection de réseau basique
    // Dans une implémentation complète, vous devriez utiliser @react-native-netinfo

    if (Platform.OS === "web") {
      // Sur le web, on peut utiliser navigator.onLine
      const updateOnlineStatus = () => {
        setNetworkStatus((prev) => ({
          ...prev,
          isConnected: navigator.onLine,
          isInternetReachable: navigator.onLine,
        }));
      };

      window.addEventListener("online", updateOnlineStatus);
      window.addEventListener("offline", updateOnlineStatus);

      // Initialiser avec le statut actuel
      updateOnlineStatus();

      return () => {
        window.removeEventListener("online", updateOnlineStatus);
        window.removeEventListener("offline", updateOnlineStatus);
      };
    } else {
      // Sur mobile, pour l'instant on assume qu'on est connecté
      // TODO: Implémenter avec @react-native-netinfo
      console.log(
        "📱 Détection réseau mobile: utilisez @react-native-netinfo pour une implémentation complète",
      );
    }
  }, []);

  return networkStatus;
};

// Hook utilitaire pour vérifier si on est offline
export const useIsOffline = (): boolean => {
  const { isConnected } = useNetworkStatus();
  return !isConnected;
};

// Hook utilitaire pour vérifier si on a accès à Internet
export const useHasInternetAccess = (): boolean => {
  const { isConnected, isInternetReachable } = useNetworkStatus();
  return isConnected && isInternetReachable !== false;
};
