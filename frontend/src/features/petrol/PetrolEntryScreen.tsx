import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Chip, IconButton, HelperText, SegmentedButtons } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AppCard } from '../../components/common/AppCard';
import { AppTextField } from '../../components/common/AppTextField';
import { AppRadioButtonGroup } from '../../components/common/AppRadioButtonGroup';
import { AppDatePicker } from '../../components/common/AppDatePicker';
import { AppButton } from '../../components/common/AppButton';
import { AppKeyboardWrapper } from '../../components/common/AppKeyboardWrapper';
import { CameraOcrModal } from './CameraOcrModal';
import { useGlobalUi } from '../../context/GlobalUiContext';
import { RootNavigationProp } from '../../navigation/types';
import { fuelLogSchema, FuelLogFormData } from '../../schemas/formSchemas';
import {
  useVehiclesQuery,
  useFuelHistoryQuery,
  useCreateFuelLogMutation,
  useDeleteFuelLogMutation,
} from '../../hooks/apiHooks';
import { extractErrorMessage } from '../../utils/errorUtils';

export const PetrolEntryScreen: React.FC = () => {
  const navigation = useNavigation<RootNavigationProp>();
  const { showLoader, hideLoader, showError, showSuccess } = useGlobalUi();

  // Selected Vehicle State
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [cameraVisible, setCameraVisible] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<any>(null);

  // TanStack React Query Hooks
  const { data: vehicles = [], isLoading: isVehiclesLoading } = useVehiclesQuery();
  const { data: recentLogs = [], isLoading: isLogsLoading } = useFuelHistoryQuery(
    selectedVehicleId || undefined
  );

  const createFuelLogMutation = useCreateFuelLogMutation();
  const deleteFuelLogMutation = useDeleteFuelLogMutation();

  // React Hook Form with Zod Validation
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<FuelLogFormData>({
    resolver: zodResolver(fuelLogSchema),
    defaultValues: {
      vehicleId: '',
      date: new Date().toISOString().slice(0, 10),
      petrolAmount: '',
      fuelPricePerLitre: '102.5',
      odometerKm: '',
      isFullTank: true,
      notes: '',
    },
  });

  // Sync initial vehicle selection when vehicles list loads
  useEffect(() => {
    if (vehicles.length > 0) {
      if (!selectedVehicleId || !vehicles.some((v) => v.id === selectedVehicleId)) {
        const firstId = vehicles[0].id;
        setSelectedVehicleId(firstId);
        setValue('vehicleId', firstId, { shouldValidate: true });
      }
    } else {
      setSelectedVehicleId('');
      setValue('vehicleId', '');
    }
  }, [vehicles, selectedVehicleId, setValue]);

  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || null;

  const handleSelectVehicle = (id: string) => {
    setSelectedVehicleId(id);
    setValue('vehicleId', id, { shouldValidate: true });
  };

  const handleScanComplete = (data: { detectedKm: number; detectedDate: string }) => {
    setValue('odometerKm', String(data.detectedKm), { shouldValidate: true });
    setValue('date', data.detectedDate, { shouldValidate: true });
    showSuccess(`Scanned Odometer: ${data.detectedKm} KM`);
  };

  // React Hook Form submission with useMutation
  const onSubmit = async (formData: FuelLogFormData) => {
    const isFull = formData.isFullTank !== false;
    showLoader('Calculating mileage & saving log...');
    try {
      const res = await createFuelLogMutation.mutateAsync({
        vehicleId: formData.vehicleId,
        date: formData.date,
        odometerKm: parseFloat(formData.odometerKm),
        petrolAmount: parseFloat(formData.petrolAmount),
        fuelPricePerLitre: parseFloat(formData.fuelPricePerLitre),
        isFullTank: isFull,
        notes: formData.notes,
      });

      if (res?.analysis) {
        setLastAnalysis(res.analysis);
      }

      if (isFull) {
        const achieved = res?.analysis?.actualMileage || (selectedVehicle?.expectedMileage ?? 0);
        showSuccess(`Fuel entry added successfully! Achieved: ${achieved} km/L ⛽`);
      } else {
        showSuccess(`Partial refuel logged (💧). Mileage will update on next full tank.`);
      }

      // Reset form fields while remembering settings (Selected Vehicle & Fuel Price)
      reset({
        vehicleId: formData.vehicleId,
        fuelPricePerLitre: formData.fuelPricePerLitre,
        date: new Date().toISOString().slice(0, 10),
        petrolAmount: '',
        odometerKm: '',
        isFullTank: true,
        notes: '',
      });
    } catch (e: any) {
      showError(extractErrorMessage(e, 'Failed to save fuel log'));
    } finally {
      hideLoader();
    }
  };

  const handleDeleteLog = async (id: string) => {
    showLoader('Removing refuel entry...');
    try {
      await deleteFuelLogMutation.mutateAsync(id);
      showSuccess('Refuel record deleted successfully');
    } catch (e: any) {
      showError(extractErrorMessage(e, 'Failed to delete record'));
    } finally {
      hideLoader();
    }
  };

  const vehicleOptions = vehicles.map((v) => ({
    label: v.name,
    value: v.id,
    description: `Baseline: ${v.expectedMileage} km/L`,
  }));

  return (
    <AppKeyboardWrapper style={styles.container} contentContainerStyle={styles.content}>
      {/* Vehicle Selector Card */}
      <AppCard
        title="Vehicle Profile"
        subtitle={
          selectedVehicle
            ? `Target Mileage: ${selectedVehicle.expectedMileage} km/L`
            : 'No vehicle registered'
        }
        rightAction={
          <AppButton
            mode="text"
            onPress={() => navigation.navigate('Directory', { initialTab: 'vehicles' })}
          >
            + Directory
          </AppButton>
        }
      >
        {vehicleOptions.length > 0 ? (
          <>
            <AppRadioButtonGroup
              label="Selected Vehicle:"
              value={selectedVehicleId}
              onValueChange={handleSelectVehicle}
              options={vehicleOptions}
              direction="row"
            />
            {errors.vehicleId && (
              <HelperText type="error" visible={true}>
                {errors.vehicleId.message}
              </HelperText>
            )}
          </>
        ) : (
          <View style={{ paddingVertical: 6 }}>
            <Text variant="bodySmall" style={{ color: '#64748B', marginBottom: 10 }}>
              No vehicles found in your directory. Register your bike below to start calculating
              trip mileage.
            </Text>
            <AppButton
              mode="contained"
              icon="plus"
              onPress={() => navigation.navigate('Directory', { initialTab: 'vehicles' })}
            >
              Register Vehicle in Directory
            </AppButton>
          </View>
        )}
      </AppCard>

      {/* Fuel Entry Form Card */}
      <AppCard title="Log Fuel Fill" subtitle="Capture odometer & cost details">
        {/* Camera OCR Quick Scan Button */}
        <AppButton
          mode="contained"
          icon="camera-outline"
          onPress={() => setCameraVisible(true)}
          style={styles.scanBtn}
        >
          Scan Odometer & Date with Camera
        </AppButton>

        {/* Date Picker Controller */}
        <Controller
          control={control}
          name="date"
          render={({ field: { onChange, value } }) => (
            <View>
              <AppDatePicker label="Refuel Date" value={value} onChange={onChange} />
              {errors.date && (
                <HelperText type="error" visible={true}>
                  {errors.date.message}
                </HelperText>
              )}
            </View>
          )}
        />

        {/* Refuel Mode: Full Tank vs Partial Top-up */}
        <Controller
          control={control}
          name="isFullTank"
          render={({ field: { onChange, value } }) => (
            <View style={styles.refuelModeWrap}>
              <Text variant="labelSmall" style={styles.refuelModeLabel}>
                Refuel Mode:
              </Text>
              <SegmentedButtons
                value={value ? 'full' : 'partial'}
                onValueChange={(val) => onChange(val === 'full')}
                buttons={[
                  {
                    value: 'full',
                    label: '⛽ Full Tank',
                  },
                  {
                    value: 'partial',
                    label: '💧 Partial Refuel',
                  },
                ]}
                style={{ marginBottom: 6 }}
              />
              <Text variant="bodySmall" style={styles.refuelModeHint}>
                {value
                  ? '🎯 Full Tank: Automatically calculates exact km/L mileage.'
                  : '💧 Partial Top-up (₹100/₹200): Accumulates litres; true mileage computes on next full tank.'}
              </Text>
            </View>
          )}
        />

        {/* Current Odometer KM Controller */}
        <Controller
          control={control}
          name="odometerKm"
          render={({ field: { onChange, value } }) => (
            <View>
              <AppTextField
                label="Current Odometer (KM)"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                helperText={errors.odometerKm?.message || 'Auto-filled via camera or typed manually'}
                error={!!errors.odometerKm}
                right={<AppTextField.Icon icon="speedometer" color="#64748B" />}
              />
            </View>
          )}
        />

        {/* Petrol Amount ₹ Controller */}
        <Controller
          control={control}
          name="petrolAmount"
          render={({ field: { onChange, value } }) => (
            <View>
              <AppTextField
                label="Total Amount Paid (₹)"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                helperText={errors.petrolAmount?.message || 'Amount paid at the pump'}
                error={!!errors.petrolAmount}
                left={<AppTextField.Affix text="₹ " />}
              />
            </View>
          )}
        />

        {/* Petrol Price per Litre Controller */}
        <Controller
          control={control}
          name="fuelPricePerLitre"
          render={({ field: { onChange, value } }) => (
            <View>
              <AppTextField
                label="Fuel Price per Litre (₹)"
                value={value}
                onChangeText={onChange}
                keyboardType="numeric"
                helperText={
                  errors.fuelPricePerLitre?.message ||
                  'Used to compute exact volume in litres (e.g. 102.5/L)'
                }
                error={!!errors.fuelPricePerLitre}
              />
            </View>
          )}
        />

        {/* Notes Controller */}
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, value } }) => (
            <AppTextField
              label="Station / Notes (Optional)"
              value={value || ''}
              onChangeText={onChange}
              placeholder="e.g. Shell Highway Bunk"
            />
          )}
        />

        <AppButton
          mode="contained"
          icon="calculator-variant-outline"
          onPress={() => handleSubmit(onSubmit)()}
          style={styles.submitBtn}
          loading={createFuelLogMutation.isPending}
          disabled={createFuelLogMutation.isPending}
        >
          Compute Mileage & Save
        </AppButton>
      </AppCard>

      {/* Instant Mileage Result Banner */}
      {lastAnalysis && (
        <AppCard
          title="Performance Analysis"
          subtitle={lastAnalysis.message}
          style={[
            styles.analysisCard,
            lastAnalysis.isAboveTarget ? styles.goodCard : styles.warningCard,
          ]}
        >
          <View style={styles.metricsRow}>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall" style={styles.metricVal}>
                {lastAnalysis.actualMileage}
              </Text>
              <Text variant="labelSmall" style={styles.metricLabel}>
                Actual km/L
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall" style={styles.metricVal}>
                {lastAnalysis.expectedMileage}
              </Text>
              <Text variant="labelSmall" style={styles.metricLabel}>
                Baseline km/L
              </Text>
            </View>
            <View style={styles.metricBox}>
              <Text variant="headlineSmall" style={styles.metricVal}>
                {lastAnalysis.distanceCovered}
              </Text>
              <Text variant="labelSmall" style={styles.metricLabel}>
                Trip KM
              </Text>
            </View>
          </View>
        </AppCard>
      )}

      {/* Refuel History */}
      <Text variant="titleMedium" style={styles.historyTitle}>
        Recent Refuel Records
      </Text>
      {recentLogs.length === 0 ? (
        <Text style={styles.emptyText}>No refuel logs recorded yet.</Text>
      ) : (
        recentLogs.map((log: any) => (
          <AppCard
            key={log.id}
            title={`${log.vehicleName} • ₹${log.petrolAmount}`}
            subtitle={`${log.date} | ODO: ${log.odometerKm} KM`}
            rightAction={
              <View style={styles.actionChipRow}>
                {log.actualMileage ? (
                  <Chip style={styles.mileageChip} textStyle={styles.mileageChipText}>
                    {log.actualMileage} km/L
                  </Chip>
                ) : (
                  <Chip style={styles.partialChip} textStyle={styles.partialChipText}>
                    💧 Partial
                  </Chip>
                )}
                <IconButton
                  icon="trash-can-outline"
                  size={18}
                  iconColor="#EF4444"
                  onPress={() => handleDeleteLog(log.id)}
                />
              </View>
            }
          >
            <Text variant="bodySmall" style={{ color: '#64748B' }}>
              Volume: {log.litresFilled ? `${log.litresFilled} L` : 'N/A'}
              {log.distanceCovered ? ` • Trip: ${log.distanceCovered} km` : ''}
              {log.notes ? ` • ${log.notes}` : ''}
            </Text>
          </AppCard>
        ))
      )}

      {/* Camera OCR Modal */}
      <CameraOcrModal
        visible={cameraVisible}
        onDismiss={() => setCameraVisible(false)}
        onScanComplete={handleScanComplete}
      />
    </AppKeyboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  scanBtn: {
    backgroundColor: '#D97706',
    marginBottom: 14,
  },
  submitBtn: {
    marginTop: 10,
    backgroundColor: '#4F46E5',
  },
  analysisCard: {
    marginVertical: 10,
    borderWidth: 1.5,
  },
  goodCard: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  warningCard: {
    borderColor: '#F59E0B',
    backgroundColor: '#FFFBEB',
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  metricBox: {
    alignItems: 'center',
  },
  metricVal: {
    fontWeight: '800',
    color: '#0F172A',
  },
  metricLabel: {
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  historyTitle: {
    marginTop: 20,
    marginBottom: 8,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    marginVertical: 16,
    fontSize: 13,
  },
  actionChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mileageChip: {
    backgroundColor: '#ECFDF5',
    height: 28,
  },
  mileageChipText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 11,
  },
  partialChip: {
    backgroundColor: '#EFF6FF',
    height: 28,
  },
  partialChipText: {
    color: '#2563EB',
    fontWeight: '700',
    fontSize: 11,
  },
  refuelModeWrap: {
    marginVertical: 10,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  refuelModeLabel: {
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  refuelModeHint: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 16,
  },
});
