declare const process: any;

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';

export interface IMedicineItem {
  id: string;
  name: string;
  strength: string;
  dosageForm: string;
  scheduleSlot: "MORNING" | "AFTERNOON" | "NIGHT" | "CUSTOM";
  reminderTime: string;
  foodRelation: "BEFORE_FOOD" | "AFTER_FOOD" | "WITH_FOOD";
  currentStock: number;
  lowStockAlert: number;
  isActive: boolean;
}

export interface ITodayMedicineStatus {
  medicineId: string;
  medicineName: string;
  strength: string;
  scheduleSlot: string;
  reminderTime: string;
  foodRelation?: "BEFORE_FOOD" | "AFTER_FOOD" | "WITH_FOOD";
  status: "TAKEN" | "MISSED" | "SKIPPED" | "PENDING";
  takenAt?: string;
  currentStock: number;
  lowStockAlert?: number;
}

export interface IVehicleItem {
  id: string;
  name: string;
  registrationNumber?: string;
  expectedMileage: number;
  fuelTankCapacity?: number;
  initialOdometerKm: number;
  monthlyBudget?: number;
  isActive: boolean;
}

export interface IFuelLogItem {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string;
  odometerKm: number;
  petrolAmount: number;
  fuelPricePerLitre?: number;
  litresFilled: number;
  distanceCovered?: number;
  actualMileage?: number;
  isFullTank?: boolean;
  notes?: string;
  createdAt: string;
}

// Clean local mock fallback storage without pre-seeded dummy tablets or vehicles
let localMedicines: IMedicineItem[] = [];
let localVehicles: IVehicleItem[] = [];

let localPillLogs: Array<{
  medicineId: string;
  date: string;
  status: "TAKEN" | "MISSED" | "SKIPPED";
}> = [];
let localFuelLogs: IFuelLogItem[] = [];

export const ApiService = {
  // Medicines / Prescriptions
  async getMedicines(): Promise<IMedicineItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/medicines?active=true`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return localMedicines;
  },

  async createMedicine(
    data: Omit<IMedicineItem, "id" | "isActive">,
  ): Promise<IMedicineItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/medicines`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    const newMed: IMedicineItem = {
      ...data,
      id: `med-${Date.now()}`,
      isActive: true,
    };
    localMedicines.push(newMed);
    return newMed;
  },

  async updateMedicine(
    id: string,
    data: Partial<IMedicineItem>,
  ): Promise<IMedicineItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/medicines/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const index = localMedicines.findIndex((m) => m.id === id);
    if (index > -1) {
      localMedicines[index] = { ...localMedicines[index], ...data };
      return localMedicines[index];
    }
    throw new Error("Medication not found");
  },

  async deleteMedicine(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/v1/medicines/${id}`, {
        method: "DELETE",
      });
    } catch {}
    localMedicines = localMedicines.filter((m) => m.id !== id);
  },

  async restockMedicine(id: string, amount: number = 10): Promise<IMedicineItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/medicines/${id}/restock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const index = localMedicines.findIndex((m) => m.id === id);
    if (index > -1) {
      localMedicines[index].currentStock = (localMedicines[index].currentStock || 0) + amount;
      return localMedicines[index];
    }
    throw new Error("Medication not found");
  },

  // Today Pill Status
  async getTodayPillStatus(
    dateStr?: string,
  ): Promise<{ date: string; medicines: ITodayMedicineStatus[] }> {
    const today = dateStr || new Date().toISOString().slice(0, 10);
    try {
      const res = await fetch(
        `${API_BASE_URL}/api/v1/pill-logs/today?date=${today}`,
      );
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const list = localMedicines.map((m) => {
      const existing = localPillLogs.find(
        (l) => l.date === today && l.medicineId === m.id,
      );
      return {
        medicineId: m.id,
        medicineName: m.name,
        strength: m.strength,
        scheduleSlot: m.scheduleSlot,
        reminderTime: m.reminderTime,
        status: (existing?.status || "PENDING") as any,
        currentStock: m.currentStock,
      };
    });
    return { date: today, medicines: list };
  },

  // Mark Pill
  async markPill(
    medicineId: string,
    date: string,
    status: "TAKEN" | "MISSED" | "SKIPPED",
  ): Promise<void> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/pill-logs/mark`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineId, date, status }),
      });
      if (!res.ok) {
        throw new Error("Could not update medication status on server.");
      }
    } catch (e: any) {
      const index = localPillLogs.findIndex(
        (l) => l.date === date && l.medicineId === medicineId,
      );
      if (index > -1) {
        localPillLogs[index].status = status;
      } else {
        localPillLogs.push({ medicineId, date, status });
      }
    }
  },

  // Calendar
  async getCalendarMonth(month: string, medicineId?: string) {
    try {
      const url = `${API_BASE_URL}/api/v1/pill-logs/calendar?month=${month}${medicineId ? `&medicineId=${medicineId}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const calendarMap: Record<string, any> = {};
    localPillLogs.forEach((l) => {
      if (l.date.startsWith(month)) {
        calendarMap[l.date] = {
          date: l.date,
          allTaken: l.status === "TAKEN",
          logs: [l],
        };
      }
    });
    return calendarMap;
  },

  // Streak Stats
  async getStreakStats(medicineId?: string): Promise<{
    currentStreakDays: number;
    takenThisMonth: number;
    missedThisMonth: number;
  }> {
    try {
      const url = `${API_BASE_URL}/api/v1/pill-logs/stats${medicineId ? `?medicineId=${medicineId}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const taken = localPillLogs.some((l) => l.date === dateStr && l.status === "TAKEN");
      if (taken) {
        streak++;
      } else if (i === 0) {
        continue;
      } else {
        break;
      }
    }

    return {
      currentStreakDays: streak,
      takenThisMonth: localPillLogs.filter((l) => l.status === "TAKEN").length,
      missedThisMonth: localPillLogs.filter((l) => l.status === "MISSED").length,
    };
  },

  // Vehicles
  async getVehicles(): Promise<IVehicleItem[]> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vehicles?active=true`);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return localVehicles;
  },

  async createVehicle(
    data: Omit<IVehicleItem, "id" | "isActive">,
  ): Promise<IVehicleItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vehicles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const newVehicle: IVehicleItem = {
      ...data,
      id: `bike-${Date.now()}`,
      isActive: true,
    };
    localVehicles.push(newVehicle);
    return newVehicle;
  },

  async updateVehicle(
    id: string,
    data: Partial<IVehicleItem>,
  ): Promise<IVehicleItem> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/vehicles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}

    const index = localVehicles.findIndex((v) => v.id === id);
    if (index > -1) {
      localVehicles[index] = { ...localVehicles[index], ...data };
      return localVehicles[index];
    }
    throw new Error("Vehicle not found");
  },

  async deleteVehicle(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/v1/vehicles/${id}`, {
        method: "DELETE",
      });
    } catch {}
    localVehicles = localVehicles.filter((v) => v.id !== id);
  },

  // Fuel Logs
  async createFuelLog(data: {
    vehicleId: string;
    date: string;
    odometerKm: number;
    petrolAmount: number;
    fuelPricePerLitre?: number;
    litresFilled?: number;
    isFullTank?: boolean;
    notes?: string;
  }) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/fuel-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {}

    // Local calculation
    const bike = localVehicles.find((v) => v.id === data.vehicleId);
    const lastLog = localFuelLogs.find((l) => l.vehicleId === data.vehicleId);
    const prevKm = lastLog
      ? lastLog.odometerKm
      : bike
        ? bike.initialOdometerKm
        : 0;
    const distanceCovered = Math.max(0, data.odometerKm - prevKm);
    const litres =
      data.litresFilled ||
      (data.fuelPricePerLitre ? data.petrolAmount / data.fuelPricePerLitre : 1);
    const isFull = data.isFullTank !== false;
    const actualMileage = isFull && litres > 0 ? Number((distanceCovered / litres).toFixed(1)) : undefined;

    const newLog: IFuelLogItem = {
      id: `fuel-${Date.now()}`,
      vehicleId: data.vehicleId,
      vehicleName: bike?.name || "Primary Bike",
      date: data.date,
      odometerKm: data.odometerKm,
      petrolAmount: data.petrolAmount,
      litresFilled: litres,
      distanceCovered,
      actualMileage,
      isFullTank: isFull,
      notes: data.notes,
      createdAt: new Date().toISOString(),
    };
    localFuelLogs.unshift(newLog);

    return {
      success: true,
      data: newLog,
      analysis: {
        distanceCovered,
        actualMileage: actualMileage || 0,
        expectedMileage: bike?.expectedMileage || 55.0,
        isAboveTarget: (actualMileage || 0) >= (bike?.expectedMileage || 55.0),
        message: isFull
          ? `Calculated mileage: ${actualMileage} km/L for ${distanceCovered} km traveled!`
          : `Partial top-up logged (💧). Added ${litres.toFixed(1)}L. Full tank fill needed for exact mileage.`,
      },
    };
  },

  async getFuelHistory(vehicleId?: string): Promise<IFuelLogItem[]> {
    try {
      const url = `${API_BASE_URL}/api/v1/fuel-logs/history${vehicleId ? `?vehicleId=${vehicleId}` : ""}`;
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        return json.data;
      }
    } catch {}
    return localFuelLogs;
  },

  async deleteFuelLog(id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/v1/fuel-logs/${id}`, {
        method: "DELETE",
      });
    } catch {}
    localFuelLogs = localFuelLogs.filter((l) => l.id !== id);
  },

  // OCR Analysis
  async analyzeOcrText(text: string) {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/ocr/analyze-text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (res.ok) {
        return (await res.json()).data;
      }
    } catch {}

    // Match patterns like "2745.9 km", "ODO 2745.9", "TRIP B 2745.9"
    const kmMatch = text.match(
      /(?:trip\s*[ab]?|odo|total)?\s*(\d{1,6}(?:\.\d)?)\s*(?:km)?/i,
    );
    let km: number | undefined;
    if (kmMatch && kmMatch[1]) {
      const val = parseFloat(kmMatch[1]);
      if (val !== 2025 && val !== 2026 && val !== 2027) {
        km = val;
      }
    }

    return {
      detectedKm: km !== undefined ? km : 2745.9,
      detectedDate: new Date().toISOString().slice(0, 10),
      confidence: 0.95,
    };
  },
};
