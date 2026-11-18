import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

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

export const NotificationService = {
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
   * Schedule a daily recurring pill alarm at the specified HH:mm time
   */
  async schedulePillReminder(params: {
    medicineId: string;
    medicineName: string;
    strength: string;
    reminderTime: string; // e.g. "08:30"
    foodRelation?: string;
    alertType?: "NOTIFICATION" | "ALARM";
  }): Promise<string | null> {
    try {
      const hasPermission = await this.setupPermissionsAndChannels();
      if (!hasPermission) return null;

      const [hourStr, minStr] = params.reminderTime.split(":");
      const hour = parseInt(hourStr, 10);
      const minute = parseInt(minStr, 10);

      if (isNaN(hour) || isNaN(minute)) return null;

      // Cancel existing notification for this medicine if any
      await this.cancelReminder(params.medicineId);

      const foodNotice =
        params.foodRelation === "BEFORE_FOOD"
          ? "🥣 Take 30 mins before food"
          : params.foodRelation === "WITH_FOOD"
            ? "🥗 Take during meal"
            : "🍽️ Take after food";

      // Schedule daily notification
      const notificationId = await Notifications.scheduleNotificationAsync({
        identifier: `pill-${params.medicineId}`,
        content: {
          title: `💊 Routine Reminder: ${params.medicineName}`,
          body: `Dose: ${params.strength} • ${foodNotice}. Don't forget your scheduled intake!`,
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
      if (!hasPermission) return false;

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
