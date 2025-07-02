import { NavigatorScreenParams } from "@react-navigation/native";
import { LocalEvent } from "./api";

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
  Camera: undefined;
};

// Types pour les écrans individuels
export type EventsScreenProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any;
};

export type EventDetailScreenProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  route: {
    params: {
      event: LocalEvent;
    };
  };
};

export type FavoritesScreenProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any;
};

export type SearchScreenProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any;
};

export type CameraScreenProps = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  navigation: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  route: any;
};

// Déclaration pour le typage global de React Navigation
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
