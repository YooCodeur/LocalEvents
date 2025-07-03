import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Provider, useDispatch } from "react-redux";
import { Ionicons } from "@expo/vector-icons";
import { store, AppDispatch } from "./src/store";
import { loadFavorites } from "./src/store/slices/favoritesSlice";
import { initializeCache, schedulePeriodicCacheCleanup } from "./src/utils";
import { COLORS } from "./src/constants";

// Importation des écrans
import EventsScreen from "./src/screens/EventsScreen";
import FavoritesScreen from "./src/screens/FavoritesScreen";
import SearchScreen from "./src/screens/SearchScreen";
import CameraScreen from "./src/screens/CameraScreen";
import EventDetailScreen from "./src/screens/EventDetailScreen";

// Types
import { RootStackParamList, MainTabParamList } from "./src/types/navigation";

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation par onglets
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: "#666",
        headerTitleAlign: "center",
      }}
    >
      <Tab.Screen
        name="Events"
        component={EventsScreen}
        options={{
          title: "Événements",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          title: "Recherche",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{
          title: "Caméra",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="camera" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{
          title: "Favoris",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation principale
function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerTitleAlign: "center",
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="EventDetail"
          component={EventDetailScreen}
          options={{
            title: "Détails de l'événement",
            headerBackTitle: "Retour",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Composant interne qui charge les favoris et initialise le cache au démarrage
function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Initialisation au démarrage de l'app
    const initializeApp = async () => {
      try {
        // Initialiser le cache (nettoyage des entrées expirées)
        await initializeCache();

        // Charger les favoris sauvegardés
        dispatch(loadFavorites());

        console.log("✅ Application initialisée avec succès");
      } catch (error) {
        console.error("❌ Erreur lors de l'initialisation de l'app:", error);
      }
    };

    initializeApp();

    // Programmer le nettoyage périodique du cache
    const cleanupCache = schedulePeriodicCacheCleanup();

    // Fonction de nettoyage
    return () => {
      cleanupCache();
    };
  }, [dispatch]);

  return (
    <>
      <AppNavigator />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
