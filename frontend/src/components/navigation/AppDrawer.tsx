import React, { useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  Modal,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Drawer, Text, Divider, useTheme } from "react-native-paper";
import CustomDrawer from "../common/CustomDrawer";
import { useAppTheme } from "../../context/ThemeContext";
import { ExtendedTheme } from "../../theme/theme";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("screen");
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

export type NavScreenKey =
  | "dashboard"
  | "expenses"
  | "pills"
  | "calendar"
  | "petrol"
  | "assistant"
  | "directory"
  | "welcome";

interface AppDrawerProps {
  visible: boolean;
  activeScreen: NavScreenKey;
  onSelectScreen: (screen: NavScreenKey) => void;
  onClose: () => void;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  visible,
  activeScreen,
  onSelectScreen,
  onClose,
}) => {
  const theme = useTheme<ExtendedTheme>();
  const { themeMode, setThemeMode } = useAppTheme();
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -DRAWER_WIDTH,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSelect = (key: NavScreenKey) => {
    onSelectScreen(key);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent={true}
      navigationBarTranslucent={true}
      hardwareAccelerated={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop Tap to Close */}
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Animated Drawer Surface */}
        <Animated.View
          style={[
            styles.drawerView,
            {
              width: DRAWER_WIDTH,
              backgroundColor: theme.colors.surface,
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          <ScrollView
            bounces={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <CustomDrawer />

            <Divider style={styles.divider} />

            {/* Navigation Items (React Native Paper Drawer) */}
            <Drawer.Section title="DAILY OPERATIONS" style={styles.section}>
              <Drawer.Item
                label="Overview Dashboard"
                icon="view-dashboard-outline"
                active={activeScreen === "dashboard"}
                onPress={() => handleSelect("dashboard")}
                style={[
                  styles.item,
                  activeScreen === "dashboard" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="Expense & Finance"
                icon="wallet-outline"
                active={activeScreen === "expenses"}
                onPress={() => handleSelect("expenses")}
                style={[
                  styles.item,
                  activeScreen === "expenses" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="Prescription Tracker"
                icon="pill"
                active={activeScreen === "pills"}
                onPress={() => handleSelect("pills")}
                style={[
                  styles.item,
                  activeScreen === "pills" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="Intake Calendar"
                icon="calendar-month-outline"
                active={activeScreen === "calendar"}
                onPress={() => handleSelect("calendar")}
                style={[
                  styles.item,
                  activeScreen === "calendar" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="Fuel & Mileage Handler"
                icon="gas-station-outline"
                active={activeScreen === "petrol"}
                onPress={() => handleSelect("petrol")}
                style={[
                  styles.item,
                  activeScreen === "petrol" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="AI Assistant"
                icon="creation"
                active={activeScreen === "assistant"}
                onPress={() => handleSelect("assistant")}
                style={[
                  styles.item,
                  activeScreen === "assistant" && styles.activeItem,
                ]}
              />
            </Drawer.Section>

            <Drawer.Section title="CONFIGURATION & TOUR" style={styles.section}>
              <Drawer.Item
                label="Asset Directory"
                icon="folder-cog-outline"
                active={activeScreen === "directory"}
                onPress={() => handleSelect("directory")}
                style={[
                  styles.item,
                  activeScreen === "directory" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="Welcome & App Tour"
                icon="sparkles"
                active={activeScreen === "welcome"}
                onPress={() => handleSelect("welcome")}
                style={[
                  styles.item,
                  activeScreen === "welcome" && styles.activeItem,
                ]}
              />
            </Drawer.Section>

            {/* Dynamic Theme & Display Mode */}
            <Drawer.Section title="THEME & DISPLAY" style={styles.section}>
              <Drawer.Item
                label="Light Mode"
                icon="weather-sunny"
                active={themeMode === "light"}
                onPress={() => setThemeMode("light")}
                style={[
                  styles.item,
                  themeMode === "light" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="Dark Mode (OLED Midnight)"
                icon="weather-night"
                active={themeMode === "dark"}
                onPress={() => setThemeMode("dark")}
                style={[
                  styles.item,
                  themeMode === "dark" && styles.activeItem,
                ]}
              />
              <Drawer.Item
                label="High-Contrast Mode (Elderly)"
                icon="eye-outline"
                active={themeMode === "high-contrast"}
                onPress={() => setThemeMode("high-contrast")}
                style={[
                  styles.item,
                  themeMode === "high-contrast" && styles.activeItem,
                ]}
              />
            </Drawer.Section>
          </ScrollView>

          {/* System Footer info */}
          <View style={styles.footer}>
            <Divider style={styles.footerDivider} />
            <View style={styles.footerRow}>
              <Text variant="labelSmall" style={styles.footerSub}>
                Daily Flow • v1.0.0
              </Text>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    ...StyleSheet.absoluteFill,
    height: SCREEN_HEIGHT,
    flexDirection: "row",
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(15, 23, 42, 0.55)",
  },
  drawerView: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    height: SCREEN_HEIGHT,
    minHeight: SCREEN_HEIGHT,
    backgroundColor: "#FFFFFF",
    paddingTop: 48,
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 35,
    zIndex: 99999,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 16,
  },
  drawerHeader: {
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  avatar: {
    backgroundColor: "#4F46E5",
    marginBottom: 12,
  },
  appName: {
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  appTagline: {
    color: "#64748B",
    marginTop: 2,
    fontSize: 12,
  },
  divider: {
    backgroundColor: "#F1F5F9",
    height: 1,
    marginVertical: 4,
  },
  section: {
    marginTop: 10,
    paddingHorizontal: 8,
  },
  item: {
    borderRadius: 12,
    marginVertical: 2,
  },
  activeItem: {
    backgroundColor: "#EEF2FF",
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 32,
    paddingHorizontal: 22,
    backgroundColor: "#FFFFFF",
  },
  footerDivider: {
    backgroundColor: "#F1F5F9",
    marginBottom: 12,
  },
  footerRow: {
    gap: 2,
  },
  footerText: {
    color: "#059669",
    fontWeight: "700",
  },
  footerSub: {
    color: "#94A3B8",
  },
});
