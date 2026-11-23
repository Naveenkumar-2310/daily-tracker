import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Text } from "react-native-paper";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";

export interface CustomDrawerProps extends Partial<DrawerContentComponentProps> {
  name?: string;
  email?: string;
}

export function CustomDrawerContent(props?: CustomDrawerProps) {
  const userName = props?.name || "Naveen";
  const firstLetter = userName.trim().charAt(0).toUpperCase() || "N";

  return (
    <View style={styles.header}>
      <View style={styles.userRow}>
        <Avatar.Text
          size={50}
          label={firstLetter}
          style={styles.avatar}
          labelStyle={styles.avatarText}
        />
        <View style={styles.userInfo}>
          <Text variant="titleMedium" style={styles.userName}>
            {userName}
          </Text>
          <Text variant="bodySmall" style={styles.userRole}>
            User
          </Text>
        </View>
      </View>
      <View style={styles.badgeRow}>
        <Text style={styles.caption}>Health, Wealth & Mobility in Flow</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 16,
    borderRadius: 16,
    marginHorizontal: 12,
    marginVertical: 10,
    shadowColor: "#4F46E5",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    backgroundColor: "#FFFFFF",
  },
  avatarText: {
    color: "#4F46E5",
    fontWeight: "800",
    fontSize: 22,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  userRole: {
    color: "#C7D2FE",
    marginTop: 2,
    fontSize: 12,
  },
  badgeRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
  },
  caption: {
    color: "#E0E7FF",
    fontSize: 11,
    fontWeight: "500",
  },
});

export default CustomDrawerContent;
