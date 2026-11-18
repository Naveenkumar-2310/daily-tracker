import * as Notifications from "expo-notifications";
import { Platform, Alert, Linking } from "react-native";

// Set foreground notification handler so alarms display and sound even while app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
    priority: Notifications.AndroidNotificationPriority.MAX,
  }),
});

/**
 * Robustly parses time strings in either 24-hour ("21:00", "08:30") or 12-hour ("9 PM", "09:00 PM", "8:30 AM")
 */
export function parseHourMinute(timeStr: string): { hour: number; minute: number } | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  const isPM = /pm/i.test(clean);
  const isAM = /am/i.test(clean);

  // Extract digits for hour and optional minute
  const match = clean.match(/(\d{1,2})(?::(\d{2}))?/);
  if (!match) return null;

  let hour = parseInt(match[1], 10);
  const minute = match[2] ? parseInt(match[2], 10) : 0;

  if (isNaN(hour) || isNaN(minute)) return null;

  // Convert to 24-hour standard if AM/PM was present
  if (isPM && hour < 12) {
    hour += 12;
  } else if (isAM && hour === 12) {
    hour = 0;
  }

  return { hour, minute };
}

export const NotificationService = {
  /**
   * Check if notification permission is currently granted
   */
  async isPermissionGranted(): Promise<boolean> {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status === "granted";
    } catch {
      return false;
    }
  },

  /**
   * Open the phone's native Settings screen for this app so user can enable notifications
   */
  openDeviceSettings(): void {
    if (Platform.OS === "ios") {
      Linking.openURL("app-settings:").catch(() => Linking.openSettings());
    } else {
      Linking.openSettings().catch(() => {});
    }
  },

  /**
   * Prompt user with an interactive modal dialog to open system settings directly
   */
  promptToOpenSettings(): void {
    Alert.alert(
      "Notifications Disabled 🔔",
      "To receive your daily pill alarms, loud chimes, and reminder banners, please allow Notifications for Daily Tracker in your phone settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open Settings ⚙️",
          style: "default",
          onPress: () => this.openDeviceSettings(),
        },
      ],
      { cancelable: true }
    );
  },

  /**
   * Request OS Notification Permissions & setup Android High-Priority Channel
   */
  async setupPermissionsAndChannels(): Promise<boolean> {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        return false;
      }

      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(
          "pill-reminders-alarm",
          {
            name: "Pill Reminders & Alarms",
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 500, 250, 500],
            lightColor: "#4F46E5",
            sound: "default",
            enableLights: true,
            enableVibrate: true,
            lockscreenVisibility:
              Notifications.AndroidNotificationVisibility.PUBLIC,
            bypassDnd: true,
          },
        );
      }

      return true;
    } catch {
      return false;
    }
  },

  /**
   * Schedule a daily recurring pill alarm at the specified HH:mm time (e.g. 21:00 or 9 PM)
   */
  async schedulePillReminder(params: {
    medicineId: string;
    medicineName: string;
    strength: string;
    reminderTime: string; // e.g. "21:00" or "09:00 PM"
    foodRelation?: string;
    alertType?: "NOTIFICATION" | "ALARM";
  }): Promise<string | null> {
    try {
      const hasPermission = await this.setupPermissionsAndChannels();
      if (!hasPermission) return null;

      const parsed = parseHourMinute(params.reminderTime);
      if (!parsed) return null;
      const { hour, minute } = parsed;

      // Cancel existing notification for this medicine if any
      await this.cancelReminder(params.medicineId);

      const foodNotice =
        params.foodRelation === "BEFORE_FOOD"
          ? "🥣 Take 30 mins before food"
          : params.foodRelation === "WITH_FOOD"
            ? "🥗 Take during meal"
            : "🍽️ Take after food";

      // Schedule daily recurring notification at the exact hour:minute
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `pill-${params.medicineId}`,
        content: {
          title: `💊 Routine Reminder: ${params.medicineName}`,
          body: `Dose: ${params.strength} • ${foodNotice}. Time for your scheduled intake!`,
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            medicineId: params.medicineId,
            medicineName: params.medicineName,
            reminderTime: params.reminderTime,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: "pill-reminders-alarm",
        },
      });

      return notificationId;
    } catch (e) {
      console.warn("Failed to schedule reminder:", e);
      return null;
    }
  },

  /**
   * Cancel reminder for a specific medicine
   */
  async cancelReminder(medicineId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(
        `pill-${medicineId}`,
      );
    } catch {}
  },

  /**
   * Immediately trigger a test alarm in 2 seconds so the user can verify sound and banner
   */
  async triggerTestAlarmNow(): Promise<boolean> {
    try {
      const hasPermission = await this.setupPermissionsAndChannels();
      if (!hasPermission) {
        this.promptToOpenSettings();
        return false;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "🔔 Test Alarm: Pills & Petrol Tracker",
          body: "Your alarm and notification chimes are working properly! 🎉",
          sound: "default",
          priority: Notifications.AndroidNotificationPriority.MAX,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 2,
          channelId: "pill-reminders-alarm",
        },
      });
      return true;
    } catch {
      return false;
    }
  },

  /**
   * Sync all active medicines with OS scheduled reminders
   */
  async syncAllMedicines(medicines: Array<any>): Promise<void> {
    try {
      const hasPermission = await this.setupPermissionsAndChannels();
      if (!hasPermission) return;

      for (const med of medicines) {
        if (med.reminderTime) {
          await this.schedulePillReminder({
            medicineId: med.id || med.medicineId,
            medicineName: med.name || med.medicineName,
            strength: med.strength,
            reminderTime: med.reminderTime,
            foodRelation: med.foodRelation,
            alertType: med.alertType || "ALARM",
          });
        }
      }
    } catch {}
  },
};
