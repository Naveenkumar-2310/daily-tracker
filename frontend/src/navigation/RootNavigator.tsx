import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Text, useTheme, ActivityIndicator } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ExtendedTheme } from "../theme/theme";

import {
  RootStackParamList,
  MainTabParamList,
  RootNavigationProp,
} from "./types";
import { DashboardScreen } from "../features/dashboard/DashboardScreen";
import { ExpenseHomeScreen } from "../features/expenses/ExpenseHomeScreen";
import { PillHomeScreen } from "../features/pills/PillHomeScreen";
import { PillCalendarScreen } from "../features/pills/PillCalendarScreen";
import { AssistantScreen } from "../features/assistant/AssistantScreen";
import { PetrolEntryScreen } from "../features/petrol/PetrolEntryScreen";
import { ManageMastersScreen } from "../features/masters/ManageMastersScreen";
import { WelcomeScreen, ONBOARDING_STORAGE_KEY } from "../features/welcome/WelcomeScreen";
import { AppHeader } from "../components/common/AppHeader";
import { AppDrawer, NavScreenKey } from "../components/navigation/AppDrawer";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// Bottom Tabs Navigator (Home, Health, Fuel, Directory)
const MainTabNavigator: React.FC<{
  onOpenDrawer: () => void;
  isDrawerOpen: boolean;
}> = ({ onOpenDrawer, isDrawerOpen }) => {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useTheme<ExtendedTheme>();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        header: () => {
          const getHeaderInfo = () => {
            switch (route.name) {
              case "Home":
                return {
                  title: "Daily Dashboard",
                  subtitle: "Health & Mobility Executive Overview",
                  actions: [
                    {
                      icon: "creation",
                      onPress: () => navigation.navigate("Assistant"),
                    },
                  ],
                };
              case "Expenses":
                return {
                  title: "Expense & Finance",
                  subtitle: "Smart Budgeting & Cash Flow",
                  actions: [],
                };
              case "Health":
                return {
                  title: "Daily Health Tracker",
                  subtitle: "Prescriptions & Intake Schedule",
                  actions: [
                    {
                      icon: "calendar-month-outline",
                      onPress: () => navigation.navigate("PillCalendar"),
                    },
                  ],
                };
              case "Fuel":
                return {
                  title: "Fuel & Mobility Handler",
                  subtitle: "Mileage Tracking & Performance",
                  actions: [],
                };
              case "Directory":
                return {
                  title: "Asset Directory",
                  subtitle: "Manage Prescriptions & Vehicles",
                  actions: [],
                };
            }
          };

          const info = getHeaderInfo();
          return (
            <AppHeader
              title={info.title}
              subtitle={info.subtitle}
              onMenu={onOpenDrawer}
              actions={info.actions}
            />
          );
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.subText || "#64748B",
        tabBarStyle: [
          styles.bottomBar,
          {
            backgroundColor: theme.colors.surface,
            borderTopColor: theme.colors.cardBorder || theme.colors.outline,
            borderTopWidth: theme.isHighContrast ? 2 : 1,
          },
          isDrawerOpen ? { display: "none" } : undefined,
        ],
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName = "view-dashboard";
          if (route.name === "Home") {
            iconName = focused ? "view-dashboard" : "view-dashboard-outline";
          } else if (route.name === "Expenses") {
            iconName = focused ? "wallet" : "wallet-outline";
          } else if (route.name === "Health") {
            iconName = "pill";
          } else if (route.name === "Fuel") {
            iconName = focused ? "gas-station" : "gas-station-outline";
          } else if (route.name === "Directory") {
            iconName = focused ? "folder-cog" : "folder-cog-outline";
          }
          return (
            <MaterialCommunityIcons
              name={iconName as any}
              size={22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={DashboardScreen}
        options={{ tabBarLabel: "Dashboard" }}
      />
      <Tab.Screen
        name="Expenses"
        component={ExpenseHomeScreen}
        options={{ tabBarLabel: "Expenses" }}
      />
      <Tab.Screen
        name="Health"
        component={PillHomeScreen}
        options={{ tabBarLabel: "Health" }}
      />
      <Tab.Screen
        name="Fuel"
        component={PetrolEntryScreen}
        options={{ tabBarLabel: "Fuel & Trip" }}
      />
      <Tab.Screen
        name="Directory"
        component={ManageMastersScreen}
        options={{ tabBarLabel: "Directory" }}
      />
    </Tab.Navigator>
  );
};

// Root Stack Navigator
export const RootNavigator: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const completed = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
        setHasCompletedOnboarding(completed === "true");
      } catch (e) {
        setHasCompletedOnboarding(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkOnboarding();
  }, []);

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: "#0F172A",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color="#38BDF8" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Navigator
        initialRouteName={hasCompletedOnboarding ? "MainTabs" : "Welcome"}
        screenOptions={{
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="MainTabs" options={{ headerShown: false }}>
          {() => (
            <MainTabNavigator
              onOpenDrawer={() => setDrawerOpen(true)}
              isDrawerOpen={drawerOpen}
            />
          )}
        </Stack.Screen>

        <Stack.Screen
          name="PillCalendar"
          component={PillCalendarScreen}
          options={({ navigation }) => ({
            header: () => (
              <AppHeader
                title="Intake Calendar"
                subtitle="Monthly Adherence Grid"
                onBack={() => navigation.goBack()}
              />
            ),
          })}
        />
        <Stack.Screen
          name="Assistant"
          component={AssistantScreen}
          options={({ navigation }) => ({
            header: () => (
              <AppHeader
                title="AI Assistant"
                subtitle="Ask About Pills & Mileage"
                onBack={() => navigation.goBack()}
              />
            ),
          })}
        />
      </Stack.Navigator>

      {/* Side Drawer with Navigation Integration */}
      <DrawerController
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />
    </View>
  );
};

const DrawerController: React.FC<{ visible: boolean; onClose: () => void }> = ({
  visible,
  onClose,
}) => {
  const navigation = useNavigation<RootNavigationProp>();

  const handleSelectScreen = (key: NavScreenKey) => {
    switch (key) {
      case "dashboard":
        navigation.navigate("MainTabs", { screen: "Home" });
        break;
      case "expenses":
        navigation.navigate("MainTabs", { screen: "Expenses" });
        break;
      case "pills":
        navigation.navigate("MainTabs", { screen: "Health" });
        break;
      case "calendar":
        navigation.navigate("PillCalendar");
        break;
      case "petrol":
        navigation.navigate("MainTabs", { screen: "Fuel" });
        break;
      case "assistant":
        navigation.navigate("Assistant");
        break;
      case "directory":
        navigation.navigate("MainTabs", { screen: "Directory" });
        break;
      case "welcome":
        navigation.navigate("Welcome");
        break;
    }
  };

  return (
    <AppDrawer
      visible={visible}
      activeScreen="pills"
      onSelectScreen={handleSelectScreen}
      onClose={onClose}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  bottomBar: {
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    height: 64,
    paddingBottom: 6,
    paddingTop: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
