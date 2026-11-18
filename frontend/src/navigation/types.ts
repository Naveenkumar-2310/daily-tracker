import type { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp, BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp, NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Home: undefined;
  Health: undefined;
  Fuel: undefined;
  Directory: { initialTab?: 'medicines' | 'vehicles' } | undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList> | undefined;
  PillCalendar: undefined;
};

export type RootNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<MainTabParamList>
>;

export type DashboardScreenProps = BottomTabScreenProps<MainTabParamList, 'Home'>;
export type PillsHomeScreenProps = BottomTabScreenProps<MainTabParamList, 'Health'>;
export type PetrolEntryScreenProps = BottomTabScreenProps<MainTabParamList, 'Fuel'>;
export type DirectoryScreenProps = BottomTabScreenProps<MainTabParamList, 'Directory'>;
export type PillCalendarScreenProps = NativeStackScreenProps<RootStackParamList, 'PillCalendar'>;
