import { NavigatorScreenParams } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { CompositeScreenProps } from "@react-navigation/native";
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

// Types pour les écrans individuels avec navigation typée

export type EventsScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Events"
>;

export type EventDetailScreenProps = StackScreenProps<
  RootStackParamList,
  "EventDetail"
>;

export type FavoritesScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Favorites"
>;

export type SearchScreenProps = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, "Search">,
  StackScreenProps<RootStackParamList>
>;

export type CameraScreenProps = BottomTabScreenProps<
  MainTabParamList,
  "Camera"
>;

// Déclaration pour le typage global de React Navigation
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
