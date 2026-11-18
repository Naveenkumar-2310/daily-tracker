import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  SegmentedButtons,
  Text,
  IconButton,
  Portal,
  Modal,
  Dialog,
  Button,
  HelperText,
  Switch,
  Chip,
  useTheme,
} from "react-native-paper";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExtendedTheme } from "../../theme/theme";

import { AppCard } from "../../components/common/AppCard";
import { AppTextField } from "../../components/common/AppTextField";
import { AppRadioButtonGroup } from "../../components/common/AppRadioButtonGroup";
import { AppButton } from "../../components/common/AppButton";
import { AppTimePicker } from "../../components/common/AppTimePicker";
import { AppDropdown } from "../../components/common/AppDropdown";
import { AppKeyboardWrapper } from "../../components/common/AppKeyboardWrapper";
import { useGlobalUi } from "../../context/GlobalUiContext";
import { RootNavigationProp } from "../../navigation/types";
import {
  medicineSchema,
  MedicineFormData,
  vehicleSchema,
  VehicleFormData,
} from "../../schemas/formSchemas";
import {
  useMedicinesQuery,
  useVehiclesQuery,
  useCreateMedicineMutation,
  useUpdateMedicineMutation,
  useDeleteMedicineMutation,
  useCreateVehicleMutation,
  useUpdateVehicleMutation,
  useDeleteVehicleMutation,
} from "../../hooks/apiHooks";
import { extractErrorMessage } from "../../utils/errorUtils";

export const ManageMastersScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const route = useRoute<any>();
  const theme = useTheme<ExtendedTheme>();
  const { showLoader, hideLoader, showError, showSuccess } = useGlobalUi();

  const [tab, setTab] = useState<"medicines" | "vehicles">(
    route.params?.initialTab || "medicines"
  );

  useEffect(() => {
    if (route.params?.initialTab) {
      setTab(route.params.initialTab);
    }
  }, [route.params?.initialTab]);

  // TanStack React Query Hooks
  const { data: medicinesList = [], isLoading: isMedsLoading } = useMedicinesQuery();
  const { data: vehiclesList = [], isLoading: isVehiclesLoading } = useVehiclesQuery();

  const createMedicineMutation = useCreateMedicineMutation();
  const updateMedicineMutation = useUpdateMedicineMutation();
  const deleteMedicineMutation = useDeleteMedicineMutation();

  const createVehicleMutation = useCreateVehicleMutation();
  const updateVehicleMutation = useUpdateVehicleMutation();
  const deleteVehicleMutation = useDeleteVehicleMutation();

  // --- React Hook Form for Add Medicine / Tablet ---
  const {
    control: medControl,
    handleSubmit: handleMedSubmit,
    reset: resetMedForm,
    watch: watchMedForm,
    formState: { errors: medErrors },
  } = useForm<MedicineFormData>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      name: "",
      strength: "",
      scheduleSlot: "MORNING",
      reminderTime: "08:30",
      foodRelation: "AFTER_FOOD",
      frequency: "DAILY",
      durationDays: "10",
      currentStock: "10",
      refillReminder: true,
      alertType: "NOTIFICATION",
    },
  });

  // Dynamic Refill Day calculation:
  // If 1 tablet: Show reorder alert on form submission
  // If > 1 tablet: Always send reminder 1 Day Before the strip finishes (Day stripCount - 1)
  const watchedStock = watchMedForm("currentStock");
  const stripCount = parseInt(watchedStock || "10", 10) || 10;
  const isSingleTablet = stripCount <= 1;
  const refillDay = isSingleTablet ? 1 : stripCount - 1;

  // --- React Hook Form for Add Vehicle ---
  const {
    control: vehicleControl,
    handleSubmit: handleVehicleSubmit,
    reset: resetVehicleForm,
    formState: { errors: vehicleErrors },
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      name: "",
      registrationNumber: "",
      expectedMileage: "",
      initialOdometerKm: "",
      monthlyBudget: "3000",
    },
  });

  // Medicine Edit Modal State
  const [editingMed, setEditingMed] = useState<any | null>(null);
  const [editMedName, setEditMedName] = useState("");
  const [editMedStrength, setEditMedStrength] = useState("");
  const [editMedSlot, setEditMedSlot] = useState("MORNING");
  const [editMedTime, setEditMedTime] = useState("08:30");
  const [editMedFoodRelation, setEditMedFoodRelation] = useState<"BEFORE_FOOD" | "AFTER_FOOD" | "WITH_FOOD">("AFTER_FOOD");
  const [editMedStock, setEditMedStock] = useState("10");

  // Medicine Delete State
  const [deletingMed, setDeletingMed] = useState<any | null>(null);

  // Vehicle Edit Modal State
  const [editingVehicle, setEditingVehicle] = useState<any | null>(null);
  const [editVehicleName, setEditVehicleName] = useState("");
  const [editVehiclePlate, setEditVehiclePlate] = useState("");
  const [editVehicleMileage, setEditVehicleMileage] = useState("");
  const [editVehicleInitialKm, setEditVehicleInitialKm] = useState("");
  const [editVehicleBudget, setEditVehicleBudget] = useState("3000");

  // Vehicle Delete State
  const [deletingVehicle, setDeletingVehicle] = useState<any | null>(null);

  // --- Medicine Handlers ---
  const onAddMedicine = async (data: MedicineFormData) => {
    const stockNum = parseInt(data.currentStock, 10) || 1;
    const isSingle = stockNum <= 1;

    showLoader("Registering new tablet...");
    try {
      // If 1 tablet: lowStockAlert = 1 (immediate low-stock state)
      // If > 1 tablet: lowStockAlert = 1 (fires 1 day before strip finishes when 1 tablet is left)
      const lowStockAlert = data.refillReminder ? 1 : 0;

      await createMedicineMutation.mutateAsync({
        name: data.name.trim(),
        strength: data.strength.trim(),
        dosageForm: "Tablet",
        scheduleSlot: data.scheduleSlot as any,
        reminderTime: data.reminderTime.trim() || "08:30",
        foodRelation: data.foodRelation || "AFTER_FOOD",
        currentStock: stockNum,
        lowStockAlert: lowStockAlert,
      });

      // Reset form fields while remembering tab setting
      resetMedForm({
        name: "",
        strength: "",
        scheduleSlot: "MORNING",
        reminderTime: "08:30",
        foodRelation: "AFTER_FOOD",
        frequency: "DAILY",
        durationDays: "10",
        currentStock: "10",
        refillReminder: true,
        alertType: "NOTIFICATION",
      });

      if (isSingle) {
        showSuccess(`⚠️ "${data.name.trim()}" saved with ONLY 1 tablet! Please reorder a new strip today.`);
      } else {
        showSuccess(`"${data.name.trim()}" added! Refill reminder set for Day ${stockNum - 1} morning.`);
      }
    } catch (e: any) {
      showError(extractErrorMessage(e, "Failed to save tablet"));
    } finally {
      hideLoader();
    }
  };

  const openEditMedicine = (item: any) => {
    setEditingMed(item);
    setEditMedName(item.name);
    setEditMedStrength(item.strength);
    setEditMedSlot(item.scheduleSlot || "MORNING");
    setEditMedTime(item.reminderTime || "08:30");
    setEditMedFoodRelation(item.foodRelation || "AFTER_FOOD");
    setEditMedStock(String(item.currentStock || 10));
  };

  const handleSaveEditMedicine = async () => {
    if (!editingMed) return;
    if (!editMedName.trim() || !editMedStrength.trim()) {
      showError("Please provide both Tablet Name and Dose");
      return;
    }

    showLoader("Updating tablet details...");
    try {
      await updateMedicineMutation.mutateAsync({
        id: editingMed.id,
        dto: {
          name: editMedName.trim(),
          strength: editMedStrength.trim(),
          scheduleSlot: editMedSlot as any,
          reminderTime: editMedTime.trim() || "08:30",
          foodRelation: editMedFoodRelation,
          currentStock: parseInt(editMedStock, 10) || 10,
        },
      });
      setEditingMed(null);
      showSuccess(`"${editMedName.trim()}" updated successfully!`);
    } catch (e: any) {
      showError(extractErrorMessage(e, "Failed to update tablet"));
    } finally {
      hideLoader();
    }
  };

  const handleDeleteMedicine = async () => {
    if (!deletingMed) return;
    const name = deletingMed.name;
    showLoader("Removing prescription...");
    try {
      await deleteMedicineMutation.mutateAsync(deletingMed.id);
      setDeletingMed(null);
      showSuccess(`"${name}" removed from directory!`);
    } catch (e: any) {
      showError(extractErrorMessage(e, "Failed to delete medication"));
    } finally {
      hideLoader();
    }
  };

  // --- Vehicle Handlers ---
  const onAddVehicle = async (data: VehicleFormData) => {
    showLoader("Registering vehicle profile...");
    try {
      await createVehicleMutation.mutateAsync({
        name: data.name.trim(),
        registrationNumber: data.registrationNumber?.trim() || undefined,
        expectedMileage: parseFloat(data.expectedMileage) || 55.0,
        initialOdometerKm: parseFloat(data.initialOdometerKm || "0") || 0,
        monthlyBudget: parseFloat(data.monthlyBudget || "3000") || 3000,
      });

      // Reset form fields while remembering tab setting
      resetVehicleForm({
        name: "",
        registrationNumber: "",
        expectedMileage: "",
        initialOdometerKm: "",
        monthlyBudget: "3000",
      });
      showSuccess(`Vehicle "${data.name.trim()}" registered successfully!`);
    } catch (e: any) {
      showError(extractErrorMessage(e, "Failed to save vehicle"));
    } finally {
      hideLoader();
    }
  };

  const openEditVehicle = (item: any) => {
    setEditingVehicle(item);
    setEditVehicleName(item.name);
    setEditVehiclePlate(item.registrationNumber || "");
    setEditVehicleMileage(String(item.expectedMileage));
    setEditVehicleInitialKm(String(item.initialOdometerKm));
    setEditVehicleBudget(String(item.monthlyBudget || 3000));
  };

  const handleSaveEditVehicle = async () => {
    if (!editingVehicle) return;
    if (!editVehicleName.trim() || !editVehicleMileage.trim()) {
      showError("Please enter both Vehicle Name and Baseline Mileage");
      return;
    }

    showLoader("Updating vehicle profile...");
    try {
      await updateVehicleMutation.mutateAsync({
        id: editingVehicle.id,
        dto: {
          name: editVehicleName.trim(),
          registrationNumber: editVehiclePlate.trim() || undefined,
          expectedMileage: parseFloat(editVehicleMileage) || 55.0,
          initialOdometerKm: parseFloat(editVehicleInitialKm) || 0,
          monthlyBudget: parseFloat(editVehicleBudget || "3000") || 3000,
        },
      });
      setEditingVehicle(null);
      showSuccess(`Vehicle "${editVehicleName.trim()}" updated successfully!`);
    } catch (e: any) {
      showError(extractErrorMessage(e, "Failed to update vehicle"));
    } finally {
      hideLoader();
    }
  };

  const handleDeleteVehicle = async () => {
    if (!deletingVehicle) return;
    const name = deletingVehicle.name;
    showLoader("Removing vehicle profile...");
    try {
      await deleteVehicleMutation.mutateAsync(deletingVehicle.id);
      setDeletingVehicle(null);
      showSuccess(`Vehicle "${name}" removed from directory!`);
    } catch (e: any) {
      showError(extractErrorMessage(e, "Failed to delete vehicle"));
    } finally {
      hideLoader();
    }
  };

  return (
    <AppKeyboardWrapper
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as any)}
        buttons={[
          { value: "medicines", label: "Prescriptions", icon: "pill" },
          { value: "vehicles", label: "Vehicles", icon: "motorbike" },
        ]}
        style={styles.segmented}
      />

      {tab === "medicines" ? (
        <>
          {/* Add Tablet Card with React Hook Form */}
          <AppCard
            title="Add Prescription / Tablet"
            subtitle="Configure tablet name, dose, routine slot, and refill reminder"
          >
            {/* Tablet Name */}
            <Controller
              control={medControl}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppTextField
                    label="Tablet Name"
                    placeholder="e.g. Dolo 650, Metformin, Pan D"
                    value={value}
                    onChangeText={onChange}
                    error={!!medErrors.name}
                    helperText={medErrors.name?.message}
                  />
                </View>
              )}
            />

            {/* Dose */}
            <Controller
              control={medControl}
              name="strength"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppTextField
                    label="Dose"
                    placeholder="e.g. 650 mg, 1 Tablet, 5 ml"
                    value={value}
                    onChangeText={onChange}
                    error={!!medErrors.strength}
                    helperText={medErrors.strength?.message}
                  />
                </View>
              )}
            />

            {/* Daily Routine Slot (Dropdown) */}
            <Controller
              control={medControl}
              name="scheduleSlot"
              render={({ field: { onChange, value } }) => (
                <AppDropdown
                  label="Daily Routine Slot"
                  value={value}
                  onSelect={onChange}
                  options={[
                    {
                      label: "Morning (Breakfast)",
                      value: "MORNING",
                      icon: "weather-sunset-up",
                      subtitle: "Taken around 08:00 AM",
                    },
                    {
                      label: "Afternoon (Lunch)",
                      value: "AFTERNOON",
                      icon: "white-balance-sunny",
                      subtitle: "Taken around 01:30 PM - 02:30 PM",
                    },
                    {
                      label: "Evening (Snacks)",
                      value: "CUSTOM",
                      icon: "weather-sunset-down",
                      subtitle: "Taken around 06:00 PM",
                    },
                    {
                      label: "Night (Dinner)",
                      value: "NIGHT",
                      icon: "moon-waning-crescent",
                      subtitle: "Taken around 09:30 PM",
                    },
                  ]}
                  error={medErrors.scheduleSlot?.message}
                />
              )}
            />

            {/* Frequency / Schedule (Dropdown) */}
            <Controller
              control={medControl}
              name="frequency"
              render={({ field: { onChange, value } }) => (
                <AppDropdown
                  label="Frequency / Schedule"
                  value={value || "DAILY"}
                  onSelect={onChange}
                  options={[
                    {
                      label: "Daily (Every Day)",
                      value: "DAILY",
                      icon: "calendar-sync",
                      subtitle: "Take 1 dose every day",
                    },
                    {
                      label: "Alternate Days (Every 2nd Day)",
                      value: "ALTERNATE",
                      icon: "calendar-range",
                      subtitle: "Take dose every 48 hours",
                    },
                    {
                      label: "Weekdays Only (Mon - Fri)",
                      value: "WEEKDAYS",
                      icon: "calendar-week",
                      subtitle: "Take Monday through Friday",
                    },
                    {
                      label: "Weekends Only (Sat - Sun)",
                      value: "WEEKENDS",
                      icon: "calendar-weekend",
                      subtitle: "Take Saturday and Sunday",
                    },
                    {
                      label: "As Needed (SOS / PRN)",
                      value: "SOS",
                      icon: "alert-decagram",
                      subtitle: "Take only during pain / symptoms",
                    },
                  ]}
                  error={medErrors.frequency?.message}
                />
              )}
            />

            {/* Reminder Time (12-Hour Clock) */}
            <Controller
              control={medControl}
              name="reminderTime"
              render={({ field: { onChange, value } }) => (
                <AppTimePicker
                  label="Reminder Time (12-Hour Clock)"
                  value={value}
                  onChange={onChange}
                  helperText="Alarm / notification will trigger at this time"
                />
              )}
            />

            {/* Food Relation Protocol */}
            <Controller
              control={medControl}
              name="foodRelation"
              render={({ field: { onChange, value } }) => (
                <AppDropdown
                  label="Food Relation Protocol"
                  value={value}
                  options={[
                    {
                      label: "🍽️ After Food (Recommended)",
                      value: "AFTER_FOOD",
                      subtitle: "Take with or right after food",
                    },
                    {
                      label: "🥣 Before Food (Empty Stomach)",
                      value: "BEFORE_FOOD",
                      subtitle: "Take 30 mins before breakfast / meal",
                    },
                    {
                      label: "🥗 With Food / During Meals",
                      value: "WITH_FOOD",
                      subtitle: "Take during meals with water",
                    },
                  ]}
                  onSelect={onChange}
                  helperText="Prevents stomach irritation & optimizes absorption"
                />
              )}
            />

            {/* Tablets in Strip */}
            <Controller
              control={medControl}
              name="currentStock"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppTextField
                    label="Tablets in Strip"
                    placeholder="e.g. 10 or 15"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={!!medErrors.currentStock}
                    helperText={
                      medErrors.currentStock?.message ||
                      "Total pills in one complete strip / blister pack"
                    }
                  />
                </View>
              )}
            />

            {/* Dynamic Refill Reminder Section (Calculated from Tablets in Strip) */}
            <View
              style={[
                styles.refillSection,
                isSingleTablet && {
                  borderColor: "#F59E0B",
                  backgroundColor: "#FFFBEB",
                },
              ]}
            >
              <View style={styles.refillHeader}>
                <View style={{ flex: 1, marginRight: 8 }}>
                  <Text
                    variant="titleSmall"
                    style={[
                      styles.refillTitle,
                      isSingleTablet && { color: "#B45309" },
                    ]}
                  >
                    {isSingleTablet
                      ? "⚠️ Immediate Reorder Notice (1-Tablet Strip)"
                      : `Day ${refillDay} Refill Reminder (${stripCount}-Tablet Strip)`}
                  </Text>
                  <Text variant="bodySmall" style={styles.refillSub}>
                    {isSingleTablet
                      ? "Only 1 tablet in strip. Reorder alert will show immediately upon saving."
                      : `Reminder will be sent on Day ${refillDay} morning (1 day before strip finishes).`}
                  </Text>
                </View>
                {!isSingleTablet && (
                  <Controller
                    control={medControl}
                    name="refillReminder"
                    render={({ field: { onChange, value } }) => (
                      <Switch
                        value={value}
                        onValueChange={onChange}
                        color="#4F46E5"
                      />
                    )}
                  />
                )}
              </View>

              {!isSingleTablet && (
                <Controller
                  control={medControl}
                  name="alertType"
                  render={({ field: { onChange, value } }) => (
                    <View style={styles.alertTypeRow}>
                      <Text variant="labelSmall" style={styles.alertTypeLabel}>
                        {`Reminder Mode (Day ${refillDay}):`}
                      </Text>
                      <View style={styles.alertChipsGroup}>
                        <Chip
                          selected={value === "NOTIFICATION"}
                          onPress={() => onChange("NOTIFICATION")}
                          icon="bell-ring-outline"
                          style={[
                            styles.alertChip,
                            value === "NOTIFICATION" && styles.alertChipActive,
                          ]}
                          textStyle={
                            value === "NOTIFICATION"
                              ? styles.alertChipTextActive
                              : styles.alertChipText
                          }
                        >
                          Notification
                        </Chip>
                        <Chip
                          selected={value === "ALARM"}
                          onPress={() => onChange("ALARM")}
                          icon="alarm"
                          style={[
                            styles.alertChip,
                            value === "ALARM" && styles.alertChipActive,
                          ]}
                          textStyle={
                            value === "ALARM"
                              ? styles.alertChipTextActive
                              : styles.alertChipText
                          }
                        >
                          Loud Alarm
                        </Chip>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>

            <AppButton
              mode="contained"
              icon="plus"
              onPress={() => handleMedSubmit(onAddMedicine)()}
              style={styles.actionBtn}
              loading={createMedicineMutation.isPending}
              disabled={createMedicineMutation.isPending}
            >
              Save Tablet Prescription
            </AppButton>
          </AppCard>

          {/* List of Existing Medicines */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Registered Tablets ({medicinesList.length})
          </Text>

          {medicinesList.length === 0 ? (
            <Text style={styles.emptyNote}>
              No tablets added yet. Register your first prescription above.
            </Text>
          ) : (
            medicinesList.map((m: any) => (
              <AppCard
                key={m.id}
                title={`${m.name} • ${m.strength}`}
                subtitle={`Slot: ${m.scheduleSlot} @ ${m.reminderTime} | ${m.currentStock} in strip`}
                rightAction={
                  <View style={styles.cardActionsRow}>
                    <IconButton
                      icon="pencil-outline"
                      size={20}
                      iconColor="#4F46E5"
                      onPress={() => openEditMedicine(m)}
                    />
                    <IconButton
                      icon="trash-can-outline"
                      size={20}
                      iconColor="#EF4444"
                      onPress={() => setDeletingMed(m)}
                    />
                  </View>
                }
              >
                <Text variant="bodySmall" style={{ color: "#64748B" }}>
                  Protocol: {m.foodRelation === "BEFORE_FOOD" ? "🥣 Before Food" : m.foodRelation === "WITH_FOOD" ? "🥗 With Food" : "🍽️ After Food"} • Stock: {m.currentStock} in strip
                </Text>
              </AppCard>
            ))
          )}
        </>
      ) : (
        <>
          {/* Add Vehicle Card with React Hook Form */}
          <AppCard
            title="Add Vehicle Profile"
            subtitle="Configure vehicle model, registration number, and custom mileage target"
          >
            {/* Vehicle Name */}
            <Controller
              control={vehicleControl}
              name="name"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppTextField
                    label="Vehicle Name / Model"
                    placeholder="e.g. Honda Shine, Bajaj Pulsar, Activa"
                    value={value}
                    onChangeText={onChange}
                    error={!!vehicleErrors.name}
                    helperText={vehicleErrors.name?.message}
                  />
                </View>
              )}
            />

            {/* License Plate */}
            <Controller
              control={vehicleControl}
              name="registrationNumber"
              render={({ field: { onChange, value } }) => (
                <AppTextField
                  label="License Plate / Reg Number (Optional)"
                  placeholder="e.g. TN-01-BK-5500"
                  value={value || ""}
                  onChangeText={onChange}
                />
              )}
            />

            {/* Baseline Mileage */}
            <Controller
              control={vehicleControl}
              name="expectedMileage"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppTextField
                    label="Target Mileage (km/L)"
                    placeholder="e.g. 45.0, 50.0, 60.0"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={!!vehicleErrors.expectedMileage}
                    helperText={
                      vehicleErrors.expectedMileage?.message ||
                      "Your vehicle's expected fuel efficiency (km/L)"
                    }
                  />
                </View>
              )}
            />

            {/* Initial Odometer */}
            <Controller
              control={vehicleControl}
              name="initialOdometerKm"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppTextField
                    label="Initial Odometer Reading (KM)"
                    placeholder="e.g. 12500"
                    value={value || ""}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={!!vehicleErrors.initialOdometerKm}
                    helperText={
                      vehicleErrors.initialOdometerKm?.message ||
                      "Current speedometer reading before first fuel log"
                    }
                  />
                </View>
              )}
            />

            {/* Monthly Fuel Expense Budget Master */}
            <Controller
              control={vehicleControl}
              name="monthlyBudget"
              render={({ field: { onChange, value } }) => (
                <View>
                  <AppTextField
                    label="Monthly Fuel Budget (₹)"
                    placeholder="e.g. 3000"
                    value={value || ""}
                    onChangeText={onChange}
                    keyboardType="numeric"
                    error={!!vehicleErrors.monthlyBudget}
                    helperText={
                      vehicleErrors.monthlyBudget?.message ||
                      "Allocated monthly spending limit (e.g. ₹2,500 bike / ₹6,000 car)"
                    }
                    left={<AppTextField.Affix text="₹ " />}
                  />
                </View>
              )}
            />

            <AppButton
              mode="contained"
              icon="plus"
              onPress={() => handleVehicleSubmit(onAddVehicle)()}
              style={[styles.actionBtn, { backgroundColor: "#D97706" }]}
              loading={createVehicleMutation.isPending}
              disabled={createVehicleMutation.isPending}
            >
              Save Vehicle Profile
            </AppButton>
          </AppCard>

          {/* List of Existing Vehicles */}
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Registered Vehicles ({vehiclesList.length})
          </Text>

          {vehiclesList.length === 0 ? (
            <Text style={styles.emptyNote}>
              No vehicles registered. Add your bike above.
            </Text>
          ) : (
            vehiclesList.map((v: any) => (
              <AppCard
                key={v.id}
                title={v.name}
                subtitle={`Target: ${v.expectedMileage} km/L | Starting ODO: ${v.initialOdometerKm} KM`}
                rightAction={
                  <View style={styles.cardActionsRow}>
                    <IconButton
                      icon="pencil-outline"
                      size={20}
                      iconColor="#4F46E5"
                      onPress={() => openEditVehicle(v)}
                    />
                    <IconButton
                      icon="trash-can-outline"
                      size={20}
                      iconColor="#EF4444"
                      onPress={() => setDeletingVehicle(v)}
                    />
                  </View>
                }
              >
                <Text variant="bodySmall" style={{ color: "#64748B" }}>
                  Reg: {v.registrationNumber || "Not specified"} • Budget: ₹{v.monthlyBudget || 3000}/mo • Fuel: Petrol
                </Text>
              </AppCard>
            ))
          )}
        </>
      )}

      {/* --- Medicine Edit Modal --- */}
      <Portal>
        <Modal
          visible={!!editingMed}
          onDismiss={() => setEditingMed(null)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Edit Tablet Prescription
            </Text>
            <Text variant="bodySmall" style={styles.modalSubtitle}>
              Update tablet name, dose, routine slot, or strip count
            </Text>

            <AppTextField
              label="Tablet Name"
              value={editMedName}
              onChangeText={setEditMedName}
            />

            <AppTextField
              label="Dose"
              value={editMedStrength}
              onChangeText={setEditMedStrength}
            />

            <AppDropdown
              label="Daily Routine Slot"
              value={editMedSlot}
              onSelect={setEditMedSlot}
              options={[
                {
                  label: "Morning (Breakfast)",
                  value: "MORNING",
                  icon: "weather-sunset-up",
                  subtitle: "Taken around 08:00 AM",
                },
                {
                  label: "Afternoon (Lunch)",
                  value: "AFTERNOON",
                  icon: "white-balance-sunny",
                  subtitle: "Taken around 01:30 PM - 02:30 PM",
                },
                {
                  label: "Evening (Snacks)",
                  value: "CUSTOM",
                  icon: "weather-sunset-down",
                  subtitle: "Taken around 06:00 PM",
                },
                {
                  label: "Night (Dinner)",
                  value: "NIGHT",
                  icon: "moon-waning-crescent",
                  subtitle: "Taken around 09:30 PM",
                },
              ]}
            />

            <AppTimePicker
              label="Reminder Time (12-Hour Clock)"
              value={editMedTime}
              onChange={setEditMedTime}
            />

            <AppDropdown
              label="Food Relation Protocol"
              value={editMedFoodRelation}
              onSelect={(val: any) => setEditMedFoodRelation(val)}
              options={[
                {
                  label: "🍽️ After Food (Recommended)",
                  value: "AFTER_FOOD",
                  subtitle: "Take with or right after food",
                },
                {
                  label: "🥣 Before Food (Empty Stomach)",
                  value: "BEFORE_FOOD",
                  subtitle: "Take 30 mins before breakfast / meal",
                },
                {
                  label: "🥗 With Food / During Meals",
                  value: "WITH_FOOD",
                  subtitle: "Take during meals with water",
                },
              ]}
              helperText="Prevents stomach irritation & optimizes absorption"
            />

            <AppTextField
              label="Tablets in Strip"
              value={editMedStock}
              onChangeText={setEditMedStock}
              keyboardType="numeric"
            />

            <View style={styles.modalBtnRow}>
              <Button
                mode="outlined"
                onPress={() => setEditingMed(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveEditMedicine}
                style={styles.saveBtn}
                loading={updateMedicineMutation.isPending}
                disabled={updateMedicineMutation.isPending}
              >
                Save Changes
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* --- Medicine Delete Confirmation Dialog --- */}
      <Portal>
        <Dialog visible={!!deletingMed} onDismiss={() => setDeletingMed(null)}>
          <Dialog.Title>Delete Prescription</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to remove "{deletingMed?.name}" from your
              prescription directory?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeletingMed(null)}>Cancel</Button>
            <Button
              textColor="#EF4444"
              onPress={handleDeleteMedicine}
              loading={deleteMedicineMutation.isPending}
              disabled={deleteMedicineMutation.isPending}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      {/* --- Vehicle Edit Modal --- */}
      <Portal>
        <Modal
          visible={!!editingVehicle}
          onDismiss={() => setEditingVehicle(null)}
          contentContainerStyle={styles.modalContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text variant="titleLarge" style={styles.modalTitle}>
              Edit Vehicle Profile
            </Text>
            <Text variant="bodySmall" style={styles.modalSubtitle}>
              Update vehicle name, registration number, or mileage benchmark
            </Text>

            <AppTextField
              label="Vehicle Name / Model"
              value={editVehicleName}
              onChangeText={setEditVehicleName}
            />

            <AppTextField
              label="License Plate / Reg Number"
              value={editVehiclePlate}
              onChangeText={setEditVehiclePlate}
            />

            <AppTextField
              label="Baseline / Target Mileage (km/L)"
              value={editVehicleMileage}
              onChangeText={setEditVehicleMileage}
              keyboardType="numeric"
            />

            <AppTextField
              label="Initial Odometer Reading (KM)"
              value={editVehicleInitialKm}
              onChangeText={setEditVehicleInitialKm}
              keyboardType="numeric"
            />

            <AppTextField
              label="Monthly Fuel Budget (₹)"
              value={editVehicleBudget}
              onChangeText={setEditVehicleBudget}
              keyboardType="numeric"
              left={<AppTextField.Affix text="₹ " />}
            />

            <View style={styles.modalBtnRow}>
              <Button
                mode="outlined"
                onPress={() => setEditingVehicle(null)}
                style={styles.cancelBtn}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleSaveEditVehicle}
                style={[styles.saveBtn, { backgroundColor: "#D97706" }]}
                loading={updateVehicleMutation.isPending}
                disabled={updateVehicleMutation.isPending}
              >
                Save Changes
              </Button>
            </View>
          </ScrollView>
        </Modal>
      </Portal>

      {/* --- Vehicle Delete Confirmation Dialog --- */}
      <Portal>
        <Dialog
          visible={!!deletingVehicle}
          onDismiss={() => setDeletingVehicle(null)}
        >
          <Dialog.Title>Delete Vehicle</Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Are you sure you want to remove "{deletingVehicle?.name}" from your
              vehicle directory?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeletingVehicle(null)}>Cancel</Button>
            <Button
              textColor="#EF4444"
              onPress={handleDeleteVehicle}
              loading={deleteVehicleMutation.isPending}
              disabled={deleteVehicleMutation.isPending}
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
    paddingBottom: 60,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  pageTitle: {
    fontWeight: "800",
    color: "#0F172A",
  },
  segmented: {
    marginBottom: 16,
    backgroundColor: "#FFFFFF",
  },
  sectionTitle: {
    marginTop: 22,
    marginBottom: 8,
    fontWeight: "800",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  actionBtn: {
    marginTop: 10,
    backgroundColor: "#4F46E5",
  },
  cardActionsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyNote: {
    color: "#94A3B8",
    textAlign: "center",
    marginVertical: 14,
    fontSize: 13,
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    margin: 20,
    padding: 24,
    borderRadius: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontWeight: "800",
    color: "#0F172A",
  },
  modalSubtitle: {
    color: "#64748B",
    marginBottom: 16,
    marginTop: 2,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 18,
  },
  cancelBtn: {
    borderColor: "#CBD5E1",
  },
  saveBtn: {
    backgroundColor: "#4F46E5",
  },
  refillSection: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 14,
    marginVertical: 10,
  },
  refillHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  refillTitle: {
    fontWeight: "700",
    color: "#0F172A",
  },
  refillSub: {
    color: "#64748B",
    marginTop: 2,
    fontSize: 12,
  },
  alertTypeRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  alertTypeLabel: {
    fontWeight: "700",
    color: "#475569",
    marginBottom: 6,
  },
  alertChipsGroup: {
    flexDirection: "row",
    gap: 8,
  },
  alertChip: {
    backgroundColor: "#F1F5F9",
    height: 32,
  },
  alertChipActive: {
    backgroundColor: "#EEF2FF",
    borderColor: "#4F46E5",
  },
  alertChipText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },
  alertChipTextActive: {
    color: "#4F46E5",
    fontSize: 11,
    fontWeight: "700",
  },
});
