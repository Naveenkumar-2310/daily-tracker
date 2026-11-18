import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../api/client/apiClient';
import axiosInstance from '../api/client/axiosInstance';
import {
  CreateMedicineDto,
  UpdateMedicineDto,
  CreateVehicleDto,
  UpdateVehicleDto,
  CreateFuelLogDto,
  MarkPillDto,
} from '../api/generated';
import { extractErrorMessage } from '../utils/errorUtils';

// Query Keys Constant
export const QUERY_KEYS = {
  medicines: (active?: boolean) => ['medicines', active] as const,
  medicineById: (id: string) => ['medicines', id] as const,
  todayPills: (date?: string) => ['todayPills', date] as const,
  pillStats: (medicineId?: string) => ['pillStats', medicineId] as const,
  calendarMonth: (month?: string, medicineId?: string) => ['calendarMonth', month, medicineId] as const,
  vehicles: (active?: boolean) => ['vehicles', active] as const,
  vehicleById: (id: string) => ['vehicles', id] as const,
  fuelHistory: (vehicleId?: string) => ['fuelHistory', vehicleId] as const,
  fuelAnalytics: (vehicleId: string) => ['fuelAnalytics', vehicleId] as const,
};

// ==================== MEDICINES & PRESCRIPTIONS ====================

export function useMedicinesQuery(active = true) {
  return useQuery({
    queryKey: QUERY_KEYS.medicines(active),
    queryFn: async () => {
      const res = await apiClient.getMedicines(active);
      return res.data?.data || [];
    },
  });
}

export function useCreateMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateMedicineDto) => {
      const res = await apiClient.createMedicine(dto);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['todayPills'] });
    },
  });
}

export function useUpdateMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateMedicineDto }) => {
      const res = await apiClient.updateMedicine(id, dto);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['todayPills'] });
    },
  });
}

export function useDeleteMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.deleteMedicine(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['todayPills'] });
    },
  });
}

export function useRestockMedicineMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, amount = 10 }: { id: string; amount?: number }) => {
      const res = await axiosInstance.post(`/api/v1/medicines/${id}/restock`, { amount });
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
      queryClient.invalidateQueries({ queryKey: ['todayPills'] });
    },
  });
}

// ==================== PILL DOSES & INTAKE ====================

export function useTodayPillsQuery(date?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.todayPills(date),
    queryFn: async () => {
      const res = await apiClient.getTodayPillStatus(date);
      return res.data?.data;
    },
  });
}

export function useStreakStatsQuery(medicineId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.pillStats(medicineId),
    queryFn: async () => {
      const res = await axiosInstance.get(`/api/v1/pill-logs/stats${medicineId ? `?medicineId=${medicineId}` : ''}`);
      return res.data?.data || { currentStreakDays: 0, takenThisMonth: 0, missedThisMonth: 0 };
    },
  });
}

export function useMarkPillMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: MarkPillDto) => {
      const res = await apiClient.markPillDose(dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayPills'] });
      queryClient.invalidateQueries({ queryKey: ['pillStats'] });
      queryClient.invalidateQueries({ queryKey: ['calendarMonth'] });
      queryClient.invalidateQueries({ queryKey: ['medicines'] });
    },
  });
}

// ==================== VEHICLES & DIRECTORY ====================

export function useVehiclesQuery(active = true) {
  return useQuery({
    queryKey: QUERY_KEYS.vehicles(active),
    queryFn: async () => {
      const res = await apiClient.getVehicles(active);
      return res.data?.data || [];
    },
  });
}

export function useCreateVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateVehicleDto) => {
      const res = await apiClient.createVehicle(dto);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useUpdateVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateVehicleDto }) => {
      const res = await apiClient.updateVehicle(id, dto);
      return res.data?.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

export function useDeleteVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.deleteVehicle(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
}

// ==================== FUEL LOGS & MOBILITY ====================

export function useFuelHistoryQuery(vehicleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.fuelHistory(vehicleId),
    queryFn: async () => {
      const res = await apiClient.getFuelHistory(vehicleId);
      return res.data?.data || [];
    },
  });
}

export function useFuelAnalyticsQuery(vehicleId?: string) {
  return useQuery({
    queryKey: QUERY_KEYS.fuelAnalytics(vehicleId || ''),
    queryFn: async () => {
      if (!vehicleId) return null;
      const res = await apiClient.getFuelAnalytics(vehicleId);
      return res.data?.data || null;
    },
    enabled: !!vehicleId,
  });
}

export function useCreateFuelLogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (dto: CreateFuelLogDto) => {
      const res = await apiClient.createFuelLog(dto);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelHistory'] });
      queryClient.invalidateQueries({ queryKey: ['fuelAnalytics'] });
    },
  });
}

export function useDeleteFuelLogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await apiClient.deleteFuelLog(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fuelHistory'] });
      queryClient.invalidateQueries({ queryKey: ['fuelAnalytics'] });
    },
  });
}

// ==================== OCR ODOMETER ANALYSIS ====================

export function useAnalyzeOcrMutation() {
  return useMutation({
    mutationFn: async (text: string) => {
      const res = await apiClient.analyzeOcrText({ text });
      return res.data?.data;
    },
  });
}

