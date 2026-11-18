import React, { useState, useCallback } from "react";
import { View, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { ExtendedTheme } from "../../theme/theme";
import { AppCard } from "../../components/common/AppCard";
import { AppButton } from "../../components/common/AppButton";
import { AppDatePicker } from "../../components/common/AppDatePicker";
import { AppKeyboardWrapper } from "../../components/common/AppKeyboardWrapper";
import { useGlobalUi } from "../../context/GlobalUiContext";
import { useDoubleBackToExit } from "../../hooks/useDoubleBackToExit";
import { RootNavigationProp } from "../../navigation/types";
import { useTodayPillsQuery, useMarkPillMutation, useRestockMedicineMutation, useStreakStatsQuery } from "../../hooks/apiHooks";
import { extractErrorMessage } from "../../utils/errorUtils";
import { NotificationService, parseHourMinute } from "../../services/notificationService";

export const PillHomeScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useTheme<ExtendedTheme>();
  const { showLoader, hideLoader, showError, showSuccess } = useGlobalUi();

  // Enable Double Back to Exit on Home Screen
  useDoubleBackToExit(true);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [refreshing, setRefreshing] = useState(false);

  // TanStack React Query hooks
  const { data: pillData, isLoading, refetch } = useTodayPillsQuery(selectedDate);
  const { data: streakStats } = useStreakStatsQuery();
  const markPillMutation = useMarkPillMutation();
  const restockMutation = useRestockMedicineMutation();
  const medicines = pillData?.medicines || [];

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const res = await refetch();
      if (res.data?.medicines && res.data.medicines.length > 0) {
        NotificationService.syncAllMedicines(res.data.medicines);
      }
    } finally {
      setRefreshing(false);
    }
  }, [refetch]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const handleMark = async (medId: string, status: "TAKEN" | "MISSED") => {
    showLoader(
      status === "TAKEN" ? "Recording intake..." : "Marking as missed...",
    );
    try {
      await markPillMutation.mutateAsync({
        medicineId: medId,
        date: selectedDate,
        status,
      });
      showSuccess(
        status === "TAKEN"
          ? "Dose marked as taken! 🎯"
          : "Marked as missed for this date.",
      );
    } catch (err: any) {
      showError(extractErrorMessage(err, "Failed to update record"));
    } finally {
      hideLoader();
    }
  };

  const handleTestAlarm = async () => {
    showLoader("Queueing test alarm in 2s...");
    try {
      const success = await NotificationService.triggerTestAlarmNow();
      if (success) {
        showSuccess("🔔 Test chime queued! Rings in 2 seconds. Check speaker & vibration.");
      } else {
        showError("Please enable notification permissions in your phone settings.");
      }
    } catch (err: any) {
      showError(extractErrorMessage(err, "Failed to trigger alarm"));
    } finally {
      hideLoader();
    }
  };

  const handleRestock = async (medId: string, medName: string) => {
    showLoader(`Restocking ${medName}...`);
    try {
      await restockMutation.mutateAsync({ id: medId, amount: 10 });
      showSuccess(`+10 tablets added to "${medName}" strip! 📦`);
      refetch();
    } catch (err: any) {
      showError(extractErrorMessage(err, "Failed to restock tablet"));
    } finally {
      hideLoader();
    }
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const totalMeds = medicines.length;
  const takenCount = medicines.filter((m) => m.status === "TAKEN").length;

  const isDoseOverdue = (reminderTimeStr: string) => {
    if (!isToday) return false;
    try {
      const parsed = parseHourMinute(reminderTimeStr);
      if (!parsed) return false;
      const now = new Date();
      const scheduled = new Date();
      scheduled.setHours(parsed.hour, parsed.minute, 0, 0);
      return now > scheduled;
    } catch {
      return false;
    }
  };

  return (
    <AppKeyboardWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4F46E5"]}
        />
      }
    >
      {/* Date Header Controller & Instant Alarm Test */}
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <AppDatePicker
            label="Schedule Date"
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
          />
        </View>
        <AppButton
          mode="outlined"
          icon="bell-ring-outline"
          onPress={handleTestAlarm}
          style={styles.testAlarmBtn}
        >
          Test Alarm
        </AppButton>
      </View>

      {/* Adherence Streak Banner - Clickable to Calendar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("PillCalendar")}
        style={[
          styles.streakBanner,
          theme.isDark && {
            backgroundColor: theme.colors.surface,
            borderColor: theme.colors.cardBorder,
          },
          theme.isHighContrast && {
            backgroundColor: "#FFFFFF",
            borderColor: "#000000",
            borderWidth: 2,
          },
        ]}
      >
        <View style={styles.streakIconWrap}>
          <Text style={{ fontSize: 18 }}>🔥</Text>
        </View>
        <View style={{ flex: 1, paddingRight: 6 }}>
          <Text
            variant="labelLarge"
            style={[
              styles.streakTitle,
              theme.isDark && { color: "#FBBF24" },
              theme.isHighContrast && { color: "#000000" },
            ]}
            numberOfLines={1}
          >
            {streakStats?.currentStreakDays || 0}-Day Routine Streak!
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.streakSub,
              theme.isDark && { color: "#E2E8F0" },
              theme.isHighContrast && { color: "#000000" },
            ]}
            numberOfLines={1}
          >
            {streakStats?.takenThisMonth || 0} doses on schedule • View Calendar →
          </Text>
        </View>
      </TouchableOpacity>

      {/* Progress & Overview Card - Clickable to Calendar */}
      {totalMeds > 0 && (
        <AppCard
          style={styles.summaryCard}
          onPress={() => navigation.navigate("PillCalendar")}
        >
          <View style={styles.summaryRow}>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <Text
                variant="titleMedium"
                style={[styles.summaryTitle, { color: theme.colors.onSurface }]}
                numberOfLines={1}
              >
                {isToday ? "Today's Tablet Routine" : `Intake for ${selectedDate}`}
              </Text>
              <Text
                variant="bodySmall"
                style={[styles.summarySubtitle, { color: theme.colors.subText }]}
                numberOfLines={1}
              >
                {takenCount} of {totalMeds} doses completed • Tap for Calendar
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>
                {totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0}%
              </Text>
            </View>
          </View>
        </AppCard>
      )}

      <Text
        variant="titleMedium"
        style={[
          styles.sectionHeader,
          { color: theme.colors.onSurface, fontWeight: theme.isHighContrast ? "900" : "800" },
        ]}
      >
        {isToday ? "Scheduled Tablets" : "Tablet Routine History"}
      </Text>

      {medicines.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💊</Text>
          <Text
            variant="titleMedium"
            style={[styles.emptyTitle, { color: theme.colors.onSurface }]}
          >
            No Active Tablets
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.emptyText, { color: theme.colors.subText }]}
          >
            You haven't configured any tablets yet. Add your daily tablets in
            Directory to schedule automatic reminders and track strip stock.
          </Text>
          <AppButton
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate("Directory", { initialTab: "medicines" })}
            style={styles.addBtn}
          >
            Add Tablet in Directory
          </AppButton>
        </AppCard>
      ) : (
        medicines.map((item) => {
          const isTaken = item.status === "TAKEN";
          const isMissed = item.status === "MISSED";
          const stock = item.currentStock ?? 10;
          const isOverdue = !isTaken && !isMissed && isDoseOverdue(item.reminderTime || "08:30");

          return (
            <AppCard
              key={item.medicineId}
              title={`${item.medicineName || "Tablet"} • ${item.strength || ""}`}
              subtitle={`${item.scheduleSlot || "DAILY"} @ ${item.reminderTime || "08:30"} | Strip: ${stock} left • Tap to edit`}
              onPress={() => navigation.navigate("Directory", { initialTab: "medicines" })}
              style={[
                styles.card,
                isTaken && styles.cardTaken,
                isMissed && styles.cardMissed,
              ]}
              rightAction={
                <Chip
                  compact
                  style={[
                    styles.statusChip,
                    isTaken
                      ? styles.chipTaken
                      : isMissed
                        ? styles.chipMissed
                        : isOverdue
                          ? styles.chipOverdue
                          : styles.chipPending,
                  ]}
                  textStyle={{
                    color: isTaken
                      ? "#059669"
                      : isMissed
                        ? "#E11D48"
                        : isOverdue
                          ? "#D97706"
                          : "#64748B",
                    fontWeight: "700",
                    fontSize: 10.5,
                  }}
                >
                  {isTaken
                    ? "✓ TAKEN"
                    : isMissed
                      ? "✕ MISSED"
                      : isOverdue
                        ? "⏰ LATE"
                        : "PENDING"}
                </Chip>
              }
            >
              {/* Food Protocol, Alarm Active & Low Stock Badges (Clean Responsive Badges) */}
              <View style={styles.tagBadgeRow}>
                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: theme.colors.surfaceVariant,
                      borderColor: theme.colors.cardBorder || theme.colors.outline,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagBadgeText,
                      { color: theme.colors.onSurface },
                    ]}
                  >
                    {item.foodRelation === "BEFORE_FOOD"
                      ? "🥣 Before Food"
                      : item.foodRelation === "WITH_FOOD"
                        ? "🥗 With Food"
                        : "🍽️ After Food"}
                  </Text>
                </View>

                <View
                  style={[
                    styles.tagBadge,
                    {
                      backgroundColor: theme.isDark
                        ? "rgba(79, 70, 229, 0.15)"
                        : "#EEF2FF",
                      borderColor: theme.isDark
                        ? "rgba(99, 102, 241, 0.35)"
                        : "#C7D2FE",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagBadgeText,
                      { color: theme.isDark ? "#A5B4FC" : "#4F46E5" },
                    ]}
                  >
                    🔔 {item.reminderTime || "08:30"} Alarm Active
                  </Text>
                </View>

                {stock <= 2 && (
                  <View style={[styles.tagBadge, styles.urgentStockBadge]}>
                    <Text style={styles.urgentStockBadgeText}>
                      {stock <= 0 ? "⚠️ Empty Strip" : `⚠️ Only ${stock} Left`}
                    </Text>
                  </View>
                )}
              </View>

              {/* Overdue Advisory Banner */}
              {isOverdue && (
                <View style={styles.overdueNotice}>
                  <Text variant="bodySmall" style={styles.overdueText}>
                    ⏰ Scheduled at {item.reminderTime || "08:30"}. Dose is overdue.
                  </Text>
                  <Text variant="labelSmall" style={styles.medicalAdvisory}>
                    💡 Take now if remembered. Never double doses if close to next slot.
                  </Text>
                </View>
              )}

              {/* 1-Tap Restock Strip Section */}
              {stock <= 2 && (
                <View style={styles.restockPrompt}>
                  <Text variant="bodySmall" style={styles.restockNotice}>
                    {stock <= 0
                      ? "⚠️ Strip is completely empty!"
                      : "⚠️ Strip running low. Refill soon."}
                  </Text>
                  <AppButton
                    mode="contained"
                    icon="package-variant"
                    compact
                    onPress={() => handleRestock(item.medicineId || "", item.medicineName || "Tablet")}
                    style={styles.restockButton}
                  >
                    + Restock Strip (+10)
                  </AppButton>
                </View>
              )}

              {/* Action Buttons - Only shown when dose is NOT yet taken */}
              {isTaken ? (
                <View style={styles.takenNoticeRow}>
                  <Text
                    style={[
                      styles.takenNoticeText,
                      { color: theme.colors.subText || "#64748B" },
                    ]}
                  >
                    ✓ Dose marked as taken for today
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleMark(item.medicineId || "", "MISSED")}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={[styles.undoText, { color: theme.colors.primary }]}>
                      Undo
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.actionRow}>
                  <AppButton
                    mode="contained"
                    icon={isOverdue ? "clock-fast" : "check"}
                    onPress={() => handleMark(item.medicineId || "", "TAKEN")}
                    style={[
                      styles.takeBtn,
                      isOverdue
                        ? { backgroundColor: "#D97706" }
                        : { backgroundColor: "#4F46E5" },
                    ]}
                  >
                    {isOverdue ? "Take Now (Late)" : "Mark as Taken"}
                  </AppButton>

                  <AppButton
                    mode="text"
                    textColor="#E11D48"
                    onPress={() => handleMark(item.medicineId || "", "MISSED")}
                  >
                    {isOverdue ? "Skip Dose" : "Missed"}
                  </AppButton>
                </View>
              )}
            </AppCard>
          );
        })
      )}
    </AppKeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 8,
  },
  calendarNavBtn: {
    marginBottom: 6,
    height: 48,
    justifyContent: "center",
    borderColor: "#E2E8F0",
  },
  summaryCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4F46E5",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryTitle: {
    fontWeight: "700",
    fontSize: 14.5,
  },
  summarySubtitle: {
    marginTop: 2,
    fontSize: 12,
  },
  progressCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    color: "#4F46E5",
    fontWeight: "800",
    fontSize: 13,
  },
  sectionHeader: {
    fontWeight: "800",
    marginVertical: 10,
    letterSpacing: -0.2,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  emptyTitle: {
    fontWeight: "700",
    marginBottom: 6,
  },
  emptyText: {
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
    maxWidth: 290,
  },
  addBtn: {
    backgroundColor: "#4F46E5",
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 10,
  },
  cardTaken: {
    borderColor: "#A7F3D0",
  },
  cardMissed: {
    borderColor: "#FECDD3",
  },
  statusChip: {
    height: 28,
  },
  chipTaken: {
    backgroundColor: "#ECFDF5",
  },
  chipMissed: {
    backgroundColor: "#FFF1F2",
  },
  chipPending: {
    backgroundColor: "#F1F5F9",
  },
  chipOverdue: {
    backgroundColor: "#FEF3C7",
  },
  streakBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    gap: 10,
  },
  streakIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  streakTitle: {
    fontWeight: "800",
    color: "#C2410C",
    fontSize: 14,
  },
  streakSub: {
    color: "#9A3412",
    fontSize: 11.5,
  },
  tagBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
    marginVertical: 6,
  },
  tagBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  tagBadgeText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  urgentStockBadge: {
    backgroundColor: "#FEE2E2",
    borderColor: "#FECACA",
  },
  urgentStockBadgeText: {
    fontSize: 11.5,
    color: "#DC2626",
    fontWeight: "700",
  },
  overdueNotice: {
    backgroundColor: "#FEF3C7",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  overdueText: {
    color: "#92400E",
    fontWeight: "700",
    fontSize: 12,
  },
  medicalAdvisory: {
    color: "#B45309",
    fontSize: 11,
    marginTop: 2,
  },
  restockPrompt: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  restockNotice: {
    color: "#991B1B",
    fontWeight: "600",
    fontSize: 11,
    flex: 1,
    marginRight: 6,
  },
  restockButton: {
    backgroundColor: "#DC2626",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  takeBtn: {
    flex: 1,
  },
  testAlarmBtn: {
    marginBottom: 6,
    height: 48,
    justifyContent: "center",
    borderColor: "#C7D2FE",
  },
  takenNoticeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 2,
    borderTopWidth: 1,
    borderTopColor: "rgba(148, 163, 184, 0.15)",
  },
  takenNoticeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#059669",
  },
  undoText: {
    fontSize: 12,
    fontWeight: "700",
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
});
