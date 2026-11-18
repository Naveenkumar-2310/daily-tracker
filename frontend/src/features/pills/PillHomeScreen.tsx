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
import { useTodayPillsQuery, useMarkPillMutation } from "../../hooks/apiHooks";
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
  const markPillMutation = useMarkPillMutation();
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
          ? "Dose marked as taken!"
          : "Marked as missed for this date.",
      );
    } catch (err: any) {
      showError(extractErrorMessage(err, "Failed to update record"));
    } finally {
      hideLoader();
    }
  };

  const isToday = selectedDate === new Date().toISOString().slice(0, 10);
  const totalMeds = medicines.length;
  const takenCount = medicines.filter((m) => m.status === "TAKEN").length;

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

          return (
            <AppCard
              key={item.medicineId}
              title={`${item.medicineName} • ${item.strength}`}
              subtitle={`${item.scheduleSlot} @ ${item.reminderTime} | Strip: ${item.currentStock} left`}
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
                        : styles.chipPending,
                  ]}
                  textStyle={{
                    color: isTaken
                      ? "#059669"
                      : isMissed
                        ? "#E11D48"
                        : "#64748B",
                    fontWeight: "700",
                    fontSize: 11,
                  }}
                >
                  {isTaken ? "✓ COMPLETED" : isMissed ? "✕ MISSED" : "PENDING"}
                </Chip>
              }
            >
              <View style={styles.actionRow}>
                <AppButton
                  mode={isTaken ? "contained" : "outlined"}
                  icon={isTaken ? "check" : "checkbox-marked-circle-outline"}
                  onPress={() => handleMark(item.medicineId || "", "TAKEN")}
                  style={[
                    styles.takeBtn,
                    isTaken && { backgroundColor: "#059669" },
                  ]}
                >
                  {isTaken ? "Taken" : "Mark as Taken"}
                </AppButton>

                {!isTaken && (
                  <AppButton
                    mode="text"
                    textColor="#E11D48"
                    onPress={() => handleMark(item.medicineId || "", "MISSED")}
                  >
                    Missed
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
