import React, { useState, useCallback } from "react";
import { View, StyleSheet, RefreshControl } from "react-native";
import { Text, Chip } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { AppCard } from "../../components/common/AppCard";
import { AppButton } from "../../components/common/AppButton";
import { AppDatePicker } from "../../components/common/AppDatePicker";
import { AppKeyboardWrapper } from "../../components/common/AppKeyboardWrapper";
import { useGlobalUi } from "../../context/GlobalUiContext";
import { useDoubleBackToExit } from "../../hooks/useDoubleBackToExit";
import { RootNavigationProp } from "../../navigation/types";
import { useTodayPillsQuery, useMarkPillMutation, useRestockMedicineMutation, useStreakStatsQuery } from "../../hooks/apiHooks";
import { extractErrorMessage } from "../../utils/errorUtils";

export const PillHomeScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
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
      await refetch();
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
      const now = new Date();
      const parts = reminderTimeStr.split(":");
      if (parts.length < 2) return false;
      const scheduled = new Date();
      scheduled.setHours(parseInt(parts[0], 10), parseInt(parts[1], 10), 0, 0);
      return now > scheduled;
    } catch {
      return false;
    }
  };

  return (
    <AppKeyboardWrapper
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#4F46E5"]}
        />
      }
    >
      {/* Date Header Controller */}
      <View style={styles.dateRow}>
        <View style={{ flex: 1 }}>
          <AppDatePicker
            label="Schedule Date"
            value={selectedDate}
            onChange={(d) => setSelectedDate(d)}
          />
        </View>
      </View>

      {/* Adherence Streak Banner */}
      <View style={styles.streakBanner}>
        <View style={styles.streakIconWrap}>
          <Text style={{ fontSize: 18 }}>🔥</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="labelLarge" style={styles.streakTitle}>
            {streakStats?.currentStreakDays || 0}-Day Routine Streak!
          </Text>
          <Text variant="bodySmall" style={styles.streakSub}>
            {streakStats?.takenThisMonth || 0} doses taken on schedule this month
          </Text>
        </View>
      </View>

      {/* Progress & Overview Card */}
      {totalMeds > 0 && (
        <AppCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View>
              <Text variant="titleMedium" style={styles.summaryTitle}>
                {isToday ? "Today's Tablet Routine" : `Intake for ${selectedDate}`}
              </Text>
              <Text variant="bodySmall" style={styles.summarySubtitle}>
                {takenCount} of {totalMeds} doses completed
              </Text>
            </View>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>
                {totalMeds > 0 ? Math.round((takenCount / totalMeds) * 100) : 0}
                %
              </Text>
            </View>
          </View>
        </AppCard>
      )}

      <Text variant="titleMedium" style={styles.sectionHeader}>
        {isToday ? "Scheduled Tablets" : "Tablet Routine History"}
      </Text>

      {medicines.length === 0 ? (
        <AppCard style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💊</Text>
          <Text variant="titleMedium" style={styles.emptyTitle}>
            No Active Tablets
          </Text>
          <Text variant="bodyMedium" style={styles.emptyText}>
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
              subtitle={`${item.scheduleSlot || "DAILY"} @ ${item.reminderTime || "08:30"} | Strip: ${stock} left`}
              style={[
                styles.card,
                isTaken && styles.cardTaken,
                isMissed && styles.cardMissed,
              ]}
              rightAction={
                <Chip
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
                    fontSize: 11,
                  }}
                >
                  {isTaken
                    ? "✓ COMPLETED"
                    : isMissed
                      ? "✕ MISSED"
                      : isOverdue
                        ? "⏰ OVERDUE"
                        : "PENDING"}
                </Chip>
              }
            >
              {/* Food Relation Protocol & Low Stock Tags */}
              <View style={styles.cardHeaderMeta}>
                <Chip
                  icon="silverware-fork-knife"
                  style={styles.foodChip}
                  textStyle={styles.foodChipText}
                >
                  {item.foodRelation === "BEFORE_FOOD"
                    ? "🥣 Before Food"
                    : item.foodRelation === "WITH_FOOD"
                      ? "🥗 With Food"
                      : "🍽️ After Food"}
                </Chip>

                {stock <= 2 && (
                  <Chip
                    icon="alert-circle"
                    style={styles.urgentStockChip}
                    textStyle={styles.urgentStockChipText}
                  >
                    {stock <= 0 ? "Empty Strip" : `Only ${stock} Left`}
                  </Chip>
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

              {/* Action Buttons */}
              <View style={styles.actionRow}>
                <AppButton
                  mode={isTaken ? "contained" : "outlined"}
                  icon={
                    isTaken
                      ? "check"
                      : isOverdue
                        ? "clock-fast"
                        : "checkbox-marked-circle-outline"
                  }
                  onPress={() => handleMark(item.medicineId || "", "TAKEN")}
                  style={[
                    styles.takeBtn,
                    isTaken && { backgroundColor: "#059669" },
                    !isTaken && isOverdue && { borderColor: "#F59E0B" },
                  ]}
                >
                  {isTaken
                    ? "Taken"
                    : isOverdue
                      ? "Take Now (Late)"
                      : "Mark as Taken"}
                </AppButton>

                {!isTaken && (
                  <AppButton
                    mode="text"
                    textColor="#E11D48"
                    onPress={() => handleMark(item.medicineId || "", "MISSED")}
                  >
                    {isOverdue ? "Skip Dose" : "Missed"}
                  </AppButton>
                )}
              </View>
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
    padding: 18,
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
    backgroundColor: "#FFFFFF",
    marginBottom: 14,
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
    color: "#0F172A",
  },
  summarySubtitle: {
    color: "#64748B",
    marginTop: 2,
  },
  progressCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  progressText: {
    color: "#4F46E5",
    fontWeight: "800",
    fontSize: 14,
  },
  sectionHeader: {
    fontWeight: "800",
    color: "#0F172A",
    marginVertical: 10,
    letterSpacing: -0.2,
  },
  emptyCard: {
    alignItems: "center",
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 12,
  },
  emptyTitle: {
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 6,
  },
  emptyText: {
    color: "#64748B",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 18,
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
    gap: 12,
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
  },
  streakSub: {
    color: "#9A3412",
    fontSize: 12,
  },
  cardHeaderMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  foodChip: {
    height: 26,
    backgroundColor: "#F1F5F9",
  },
  foodChipText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  urgentStockChip: {
    height: 26,
    backgroundColor: "#FEE2E2",
  },
  urgentStockChipText: {
    fontSize: 11,
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
    gap: 10,
  },
  takeBtn: {
    flex: 1,
  },
});
