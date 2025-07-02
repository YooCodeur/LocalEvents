import { NavigatorScreenParams } from '@react-navigation/native';
import { LocalEvent } from './api';

// Types pour les paramètres des écrans

// Stack Navigator principal
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  EventDetail: {
    event: LocalEvent;
  };
};

// Bottom Tab Navigator
export type MainTabParamList = {
  Events: undefined;
  Favorites: undefined;
  Search: undefined;
};

// Types pour les écrans individuels
export type EventsScreenProps = {
  navigation: any; // On typera plus précisément plus tard
  route: any;
};

export type EventDetailScreenProps = {
  navigation: any;
  route: {
    params: {
      event: LocalEvent;
    };
  };
};

export type FavoritesScreenProps = {
  navigation: any;
  route: any;
};

export type SearchScreenProps = {
  navigation: any;
  route: any;
};

// Déclaration pour le typage global de React Navigation
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
} 