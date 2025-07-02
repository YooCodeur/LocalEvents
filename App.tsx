import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider, useDispatch } from 'react-redux';
import { store, AppDispatch } from './src/store';
import { loadFavorites } from './src/store/slices/favoritesSlice';

// Importation des écrans
import EventsScreen from './src/screens/EventsScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SearchScreen from './src/screens/SearchScreen';
import EventDetailScreen from './src/screens/EventDetailScreen';

// Types
import { RootStackParamList, MainTabParamList } from './src/types/navigation';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Navigation par onglets
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen 
        name="Events" 
        component={EventsScreen}
        options={{
          title: 'Événements',
          tabBarIcon: () => '🎪',
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={SearchScreen}
        options={{
          title: 'Recherche',
          tabBarIcon: () => '🔍',
        }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={FavoritesScreen}
        options={{
          title: 'Favoris',
          tabBarIcon: () => '❤️',
        }}
      />
    </Tab.Navigator>
  );
}

// Navigation principale
function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="EventDetail" 
          component={EventDetailScreen}
          options={{
            title: 'Détails de l\'événement',
            headerBackTitle: 'Retour',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Composant interne qui charge les favoris au démarrage
function AppContent() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Charger les favoris sauvegardés au démarrage de l'app
    dispatch(loadFavorites());
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

