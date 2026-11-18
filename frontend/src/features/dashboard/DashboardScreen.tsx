import React, { useState, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Text, Chip, useTheme } from "react-native-paper";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { ExtendedTheme } from "../../theme/theme";
import { AppCard } from "../../components/common/AppCard";
import { AppButton } from "../../components/common/AppButton";
import { AppKeyboardWrapper } from "../../components/common/AppKeyboardWrapper";
import { useGlobalUi } from "../../context/GlobalUiContext";
import { useDoubleBackToExit } from "../../hooks/useDoubleBackToExit";
import { RootNavigationProp } from "../../navigation/types";
import {
  useTodayPillsQuery,
  useStreakStatsQuery,
  useVehiclesQuery,
  useFuelHistoryQuery,
  useFuelAnalyticsQuery,
  useMarkPillMutation,
} from "../../hooks/apiHooks";
import { extractErrorMessage } from "../../utils/errorUtils";

export const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const theme = useTheme<ExtendedTheme>();
  const { showLoader, hideLoader, showError, showSuccess } = useGlobalUi();

  // Android Double Back to Exit from Dashboard
  useDoubleBackToExit(true);

  const [todayStr] = useState(new Date().toISOString().slice(0, 10));
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);

  // TanStack React Query Hooks
  const {
    data: pillData,
    isLoading: isPillsLoading,
    refetch: refetchPills,
  } = useTodayPillsQuery(todayStr);

  const {
    data: streakStats,
    refetch: refetchStreak,
  } = useStreakStatsQuery();

  const {
    data: vehicles = [],
    isLoading: isVehiclesLoading,
    refetch: refetchVehicles,
  } = useVehiclesQuery();

  const activeVehicleId = selectedVehicleId || vehicles[0]?.id;
  const currentVehicle = vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || null;

  const {
    data: vehicleFuel = [],
    isLoading: isFuelLoading,
    refetch: refetchFuel,
  } = useFuelHistoryQuery(currentVehicle?.id);

  const {
    data: analytics,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useFuelAnalyticsQuery(currentVehicle?.id);

  const markPillMutation = useMarkPillMutation();

  const medicines = pillData?.medicines || [];

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPills(),
        refetchStreak(),
        refetchVehicles(),
        refetchFuel(),
        refetchAnalytics(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchPills, refetchStreak, refetchVehicles, refetchFuel, refetchAnalytics]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [onRefresh])
  );

  const handleMarkTaken = async (medId: string) => {
    showLoader("Marking dose as taken...");
    try {
      await markPillMutation.mutateAsync({
        medicineId: medId,
        date: todayStr,
        status: "TAKEN",
      });
      showSuccess("Medication marked as taken!");
    } catch (e: any) {
      showError(extractErrorMessage(e, "Failed to update record"));
    } finally {
      hideLoader();
    }
  };

  const totalDoses = medicines.length;
  const takenDoses = medicines.filter((m) => m.status === "TAKEN").length;
  const adherencePercent =
    totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;

  const latestFuel = vehicleFuel.length > 0 ? vehicleFuel[0] : null;

  // Mileage comparison against target
  let mileageDiff: number | null = null;
  let isAboveTarget = false;
  if (latestFuel?.actualMileage != null && currentVehicle?.expectedMileage) {
    mileageDiff = Number((latestFuel.actualMileage - currentVehicle.expectedMileage).toFixed(1));
    isAboveTarget = mileageDiff >= 0;
  }

  // Engine Oil Service calculation
  const currentOdo = latestFuel?.odometerKm || currentVehicle?.initialOdometerKm || 0;
  const oilInterval = 3000;
  const oilKmIntoInterval = currentOdo % oilInterval;
  const oilDueInKm = Math.round(oilInterval - oilKmIntoInterval);
  const isOilDueSoon = oilDueInKm <= 500;

  // Monthly Fuel Expense Budget Master
  const currentMonthStr = todayStr.slice(0, 7);
  const currentMonthSpent = vehicleFuel
    .filter((f) => f.date && f.date.startsWith(currentMonthStr))
    .reduce((acc, curr) => acc + (curr.petrolAmount || 0), 0);
  const monthlyBudget = currentVehicle?.monthlyBudget || 3000;
  const budgetUsedPct = Math.min(100, Math.round((currentMonthSpent / monthlyBudget) * 100));

  const todayFormatted = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <AppKeyboardWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#D97706", "#4F46E5"]}
        />
      }
    >
      {/* Executive Welcome Banner */}
      <View style={styles.welcomeBanner}>
        <View>
          <Text
            variant="headlineSmall"
            style={[
              styles.welcomeTitle,
              {
                color: theme.colors.onSurface,
                fontWeight: theme.isHighContrast ? "900" : "800",
              },
            ]}
          >
            {todayFormatted}
          </Text>
        </View>
      </View>

      {/* Gamified Adherence Streak Card */}
      <View
        style={[
          styles.streakCard,
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
          <Text style={{ fontSize: 22 }}>🔥</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text
            variant="titleMedium"
            style={[
              styles.streakTitle,
              theme.isDark && { color: "#FBBF24" },
              theme.isHighContrast && { color: "#000000" },
            ]}
          >
            {streakStats?.currentStreakDays || 0}-Day Routine Streak!
          </Text>
          <Text
            variant="bodySmall"
            style={[
              styles.streakSubtitle,
              theme.isDark && { color: "#E2E8F0" },
              theme.isHighContrast && { color: "#000000" },
            ]}
          >
            {takenDoses} of {totalDoses} doses taken today • {streakStats?.takenThisMonth || 0} taken this month
          </Text>
        </View>
        <Chip style={styles.streakChip} textStyle={styles.streakChipText}>
          {adherencePercent}% Today
        </Chip>
      </View>

      {/* Quick Action Matrix */}
      <View style={styles.quickGrid}>
        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: "#EEF2FF" }]}
          onPress={() => navigation.navigate("Health")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="pill" size={26} color="#4F46E5" />
          <Text style={[styles.quickCardLabel, { color: "#4F46E5" }]}>
            Pill Schedule
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: "#FEF3C7" }]}
          onPress={() => navigation.navigate("Fuel")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="gas-station"
            size={26}
            color="#D97706"
          />
          <Text style={[styles.quickCardLabel, { color: "#D97706" }]}>
            Fuel Log
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: "#ECFDF5" }]}
          onPress={() => navigation.navigate("PillCalendar")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons
            name="calendar-month"
            size={26}
            color="#059669"
          />
          <Text style={[styles.quickCardLabel, { color: "#059669" }]}>
            Calendar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickCard, { backgroundColor: "#F1F5F9" }]}
          onPress={() => navigation.navigate("Directory")}
          activeOpacity={0.8}
        >
          <MaterialCommunityIcons name="folder-cog" size={26} color="#334155" />
          <Text style={[styles.quickCardLabel, { color: "#334155" }]}>
            Directory
          </Text>
        </TouchableOpacity>
      </View>

      {/* Medication Adherence Section */}
      <AppCard
        title="Medication Routine"
        subtitle={`Today: ${takenDoses} of ${totalDoses} doses taken`}
        rightAction={
          <Chip style={styles.percentChip} textStyle={styles.percentChipText}>
            {adherencePercent}% Adherence
          </Chip>
        }
      >
        {medicines.length === 0 ? (
          <View style={styles.emptyCardContent}>
            <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>
              No medications configured in directory yet.
            </Text>
            <AppButton
              mode="outlined"
              icon="plus"
              onPress={() =>
                navigation.navigate("Directory", { initialTab: "medicines" })
              }
            >
              Add Prescription
            </AppButton>
          </View>
        ) : (
          medicines.map((m) => {
            const isTaken = m.status === "TAKEN";
            return (
              <View key={m.medicineId} style={styles.medRow}>
                <View style={{ flex: 1 }}>
                  <Text variant="titleSmall" style={styles.medTitle}>
                    {m.medicineName} • {m.strength}
                  </Text>
                  <Text variant="bodySmall" style={styles.medSubtitle}>
                    {m.scheduleSlot} @ {m.reminderTime} | Stock:{" "}
                    {m.currentStock}
                  </Text>
                </View>

                {isTaken ? (
                  <Chip
                    style={styles.takenChip}
                    textStyle={styles.takenChipText}
                  >
                    ✓ Taken
                  </Chip>
                ) : (
                  <AppButton
                    mode="contained"
                    icon="check"
                    onPress={() => handleMarkTaken(m.medicineId || "")}
                    style={styles.markTakenBtn}
                  >
                    Take
                  </AppButton>
                )}
              </View>
            );
          })
        )}
      </AppCard>

      {/* Vehicle & Mileage Target Section */}
      <AppCard
        title="Vehicle & Mileage Target"
        subtitle={
          currentVehicle
            ? `${currentVehicle.name} • Target: ${currentVehicle.expectedMileage} km/L`
            : "No vehicle profile registered"
        }
        rightAction={
          currentVehicle ? (
            <Chip style={styles.targetChip} textStyle={styles.targetChipText}>
              {currentVehicle.expectedMileage} km/L Target
            </Chip>
          ) : undefined
        }
      >
        {currentVehicle ? (
          <View>
            {/* Multi-Vehicle Switcher Chips (when user has multiple vehicles) */}
            {vehicles.length > 1 && (
              <View style={styles.vehicleSelectorWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.vehicleSelectorContent}
                >
                  {vehicles.map((v) => {
                    const isSelected = v.id === currentVehicle.id;
                    return (
                      <Chip
                        key={v.id}
                        selected={isSelected}
                        onPress={() => setSelectedVehicleId(v.id)}
                        style={[
                          styles.vehicleChip,
                          isSelected && styles.vehicleChipSelected,
                        ]}
                        textStyle={[
                          styles.vehicleChipText,
                          isSelected && styles.vehicleChipTextSelected,
                        ]}
                        icon="motorbike"
                      >
                        {v.name}
                      </Chip>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Target Comparison Badge */}
            {mileageDiff !== null ? (
              <View
                style={[
                  styles.targetBadge,
                  isAboveTarget
                    ? styles.targetBadgeAbove
                    : styles.targetBadgeBelow,
                ]}
              >
                <MaterialCommunityIcons
                  name={isAboveTarget ? "trending-up" : "trending-down"}
                  size={18}
                  color={isAboveTarget ? "#059669" : "#DC2626"}
                />
                <Text
                  style={[
                    styles.targetBadgeText,
                    { color: isAboveTarget ? "#059669" : "#DC2626" },
                  ]}
                >
                  {isAboveTarget
                    ? `+${mileageDiff} km/L Above Target (${latestFuel?.actualMileage} vs ${currentVehicle.expectedMileage} km/L)`
                    : `${mileageDiff} km/L Below Target (${latestFuel?.actualMileage} vs ${currentVehicle.expectedMileage} km/L)`}
                </Text>
              </View>
            ) : (
              <View style={styles.targetBadgeNeutral}>
                <MaterialCommunityIcons
                  name="information-outline"
                  size={16}
                  color="#64748B"
                />
                <Text style={styles.targetBadgeNeutralText}>
                  Baseline: {currentVehicle.expectedMileage} km/L target • Initial Odometer:{" "}
                  {currentVehicle.initialOdometerKm} km
                </Text>
              </View>
            )}

            {/* 4-Metric Grid */}
            <View
              style={[
                styles.metricsGrid,
                {
                  backgroundColor: theme.colors.metricBoxBg,
                  borderColor: theme.colors.cardBorder || theme.colors.outline,
                  borderWidth: theme.isHighContrast ? 2 : 1,
                },
              ]}
            >
              <View style={styles.metricGridItem}>
                <Text
                  variant="headlineSmall"
                  style={[styles.metricVal, { color: theme.colors.onSurface }]}
                >
                  {latestFuel?.actualMileage != null
                    ? `${latestFuel.actualMileage}`
                    : "-"}
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricLabel, { color: theme.colors.onSurface }]}
                >
                  Last km/L
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricSub, { color: theme.colors.subText }]}
                >
                  Latest Fill
                </Text>
              </View>

              <View style={styles.metricGridItem}>
                <Text
                  variant="headlineSmall"
                  style={[styles.metricVal, { color: theme.colors.onSurface }]}
                >
                  {analytics?.averageMileage != null && analytics.averageMileage > 0
                    ? `${analytics.averageMileage}`
                    : "-"}
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricLabel, { color: theme.colors.onSurface }]}
                >
                  Avg km/L
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricSub, { color: theme.colors.subText }]}
                >
                  Lifetime
                </Text>
              </View>

              <View style={styles.metricGridItem}>
                <Text
                  variant="headlineSmall"
                  style={[styles.metricVal, { color: theme.colors.onSurface }]}
                >
                  {latestFuel?.odometerKm || currentVehicle.initialOdometerKm}
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricLabel, { color: theme.colors.onSurface }]}
                >
                  Odometer KM
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricSub, { color: theme.colors.subText }]}
                >
                  Current
                </Text>
              </View>

              <View style={styles.metricGridItem}>
                <Text
                  variant="headlineSmall"
                  style={[styles.metricVal, { color: theme.colors.onSurface }]}
                >
                  {analytics?.averageCostPerKm != null && analytics.averageCostPerKm > 0
                    ? `₹${analytics.averageCostPerKm}`
                    : "-"}
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricLabel, { color: theme.colors.onSurface }]}
                >
                  Cost / km
                </Text>
                <Text
                  variant="labelSmall"
                  style={[styles.metricSub, { color: theme.colors.subText }]}
                >
                  Running Cost
                </Text>
              </View>
            </View>

            {/* Quick Analytics Summary Strip */}
            {vehicleFuel.length > 0 && (
              <View
                style={[
                  styles.summaryStrip,
                  {
                    backgroundColor: theme.colors.surfaceVariant,
                    borderColor: theme.colors.outline,
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name="chart-timeline-variant"
                  size={15}
                  color={theme.colors.subText || "#475569"}
                />
                <Text
                  style={[
                    styles.summaryStripText,
                    { color: theme.colors.subText || "#475569" },
                  ]}
                >
                  {vehicleFuel.length} refuels logged • {analytics?.totalDistanceKm || 0} km tracked • ₹{analytics?.totalSpent || 0} spent
                </Text>
              </View>
            )}

            {/* Maintenance & Engine Oil Service Reminder */}
            <View
              style={[
                styles.maintenanceBanner,
                isOilDueSoon
                  ? styles.maintenanceBannerUrgent
                  : [
                      styles.maintenanceBannerNormal,
                      {
                        backgroundColor: theme.colors.metricBoxBg,
                        borderColor: theme.colors.cardBorder || theme.colors.outline,
                        borderWidth: theme.isHighContrast ? 2 : 1,
                      },
                    ],
              ]}
            >
              <MaterialCommunityIcons
                name={isOilDueSoon ? "wrench-clock" : "wrench-outline"}
                size={20}
                color={isOilDueSoon ? "#DC2626" : theme.colors.subText}
              />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text
                  style={[
                    styles.maintenanceTitle,
                    isOilDueSoon ? { color: "#991B1B" } : { color: theme.colors.onSurface },
                  ]}
                >
                  {isOilDueSoon
                    ? `⚠️ Engine Oil Service Due in ${oilDueInKm} KM (Urgent)`
                    : `🔧 Next Engine Oil Service due in ${oilDueInKm} KM`}
                </Text>
                <Text
                  style={[
                    styles.maintenanceSub,
                    { color: theme.colors.subText },
                  ]}
                >
                  Routine cycle every 3,000 km ensures peak engine life & top mileage
                </Text>
              </View>
            </View>

            {/* Monthly Fuel Expense Budget Tracker */}
            <View
              style={[
                styles.budgetWrap,
                {
                  backgroundColor: theme.colors.metricBoxBg,
                  borderColor: theme.colors.cardBorder || theme.colors.outline,
                  borderWidth: theme.isHighContrast ? 2 : 1,
                },
              ]}
            >
              <View style={styles.budgetHeader}>
                <Text
                  variant="labelMedium"
                  style={[styles.budgetLabel, { color: theme.colors.subText }]}
                >
                  Monthly Fuel Budget ({new Date().toLocaleString("en-US", { month: "short" })})
                </Text>
                <Text
                  variant="labelMedium"
                  style={[styles.budgetValue, { color: theme.colors.onSurface }]}
                >
                  ₹{currentMonthSpent} / ₹{monthlyBudget} ({budgetUsedPct}%)
                </Text>
              </View>
              <View
                style={[
                  styles.progressBarTrack,
                  { backgroundColor: theme.colors.surfaceVariant },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${budgetUsedPct}%`,
                      backgroundColor:
                        budgetUsedPct > 90
                          ? "#EF4444"
                          : budgetUsedPct > 70
                            ? "#F59E0B"
                            : "#10B981",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              <AppButton
                mode="contained"
                icon="gas-station"
                onPress={() => navigation.navigate("Fuel")}
                style={styles.logFuelBtn}
              >
                Log New Refuel
              </AppButton>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCardContent}>
            <Text style={{ color: "#64748B", fontSize: 13, marginBottom: 8 }}>
              Register your bike in Directory to track real mileage against your
              customized target.
            </Text>
            <AppButton
              mode="outlined"
              icon="plus"
              onPress={() =>
                navigation.navigate("Directory", { initialTab: "vehicles" })
              }
            >
              Register Vehicle Profile
            </AppButton>
          </View>
        )}
      </AppCard>
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
    paddingBottom: 50,
  },
  welcomeBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeTitle: {
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  quickGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 16,
  },
  quickCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  quickCardLabel: {
    fontWeight: "700",
    fontSize: 11,
    marginTop: 6,
    textAlign: "center",
  },
  percentChip: {
    backgroundColor: "#EEF2FF",
    height: 28,
  },
  percentChipText: {
    color: "#4F46E5",
    fontWeight: "700",
    fontSize: 11,
  },
  medRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  medTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  medSubtitle: {
    color: "#64748B",
    marginTop: 2,
  },
  takenChip: {
    backgroundColor: "#ECFDF5",
    height: 28,
  },
  takenChipText: {
    color: "#059669",
    fontWeight: "700",
    fontSize: 11,
  },
  markTakenBtn: {
    backgroundColor: "#4F46E5",
    borderRadius: 8,
  },
  emptyCardContent: {
    paddingVertical: 8,
  },
  targetChip: {
    backgroundColor: "#FEF3C7",
    height: 28,
  },
  targetChipText: {
    color: "#B45309",
    fontWeight: "700",
    fontSize: 11,
  },
  vehicleSelectorWrapper: {
    marginBottom: 12,
  },
  vehicleSelectorContent: {
    gap: 8,
    paddingVertical: 2,
  },
  vehicleChip: {
    backgroundColor: "#F1F5F9",
    height: 32,
  },
  vehicleChipSelected: {
    backgroundColor: "#FEF3C7",
    borderColor: "#D97706",
  },
  vehicleChipText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "600",
  },
  vehicleChipTextSelected: {
    color: "#B45309",
    fontWeight: "700",
  },
  targetBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  targetBadgeAbove: {
    backgroundColor: "#ECFDF5",
    borderWidth: 1,
    borderColor: "#A7F3D0",
  },
  targetBadgeBelow: {
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  targetBadgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
  targetBadgeNeutral: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 12,
    gap: 6,
  },
  targetBadgeNeutralText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    marginBottom: 10,
  },
  metricGridItem: {
    flex: 1,
    alignItems: "center",
  },
  metricVal: {
    fontWeight: "800",
    color: "#0F172A",
    fontSize: 18,
  },
  metricLabel: {
    color: "#0F172A",
    fontWeight: "700",
    marginTop: 2,
    fontSize: 11,
  },
  metricSub: {
    color: "#64748B",
    fontWeight: "500",
    fontSize: 9,
    marginTop: 1,
  },
  summaryStrip: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 12,
    gap: 6,
  },
  summaryStripText: {
    fontSize: 11,
    color: "#475569",
    fontWeight: "600",
  },
  actionRow: {
    marginTop: 2,
  },
  logFuelBtn: {
    backgroundColor: "#D97706",
  },
  streakCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderWidth: 1,
    borderColor: "#FFEDD5",
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    gap: 12,
  },
  streakIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFEDD5",
    justifyContent: "center",
    alignItems: "center",
  },
  streakTitle: {
    fontWeight: "800",
    color: "#C2410C",
    letterSpacing: -0.2,
  },
  streakSubtitle: {
    color: "#9A3412",
    fontSize: 12,
    marginTop: 2,
  },
  streakChip: {
    backgroundColor: "#FFEDD5",
    height: 28,
  },
  streakChipText: {
    color: "#C2410C",
    fontWeight: "700",
    fontSize: 11,
  },
  maintenanceBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 10,
  },
  maintenanceBannerNormal: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E2E8F0",
  },
  maintenanceBannerUrgent: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECDD3",
  },
  maintenanceTitle: {
    fontWeight: "700",
    fontSize: 12,
    color: "#334155",
  },
  maintenanceSub: {
    color: "#64748B",
    fontSize: 11,
    marginTop: 2,
  },
  budgetWrap: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  budgetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  budgetLabel: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 11,
  },
  budgetValue: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 11,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: 3,
    backgroundColor: "#E2E8F0",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
