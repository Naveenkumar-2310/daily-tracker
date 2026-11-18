export interface IFuelLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  date: string; // YYYY-MM-DD
  odometerKm: number;
  petrolAmount: number; // ₹
  fuelPricePerLitre?: number;
  litresFilled: number;
  distanceCovered?: number; // km since last refuel
  actualMileage?: number; // km/L
  isFullTank?: boolean;
  imageUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface ICreateFuelLogDTO {
  vehicleId: string;
  date: string; // YYYY-MM-DD
  odometerKm: number;
  petrolAmount: number; // in ₹
  fuelPricePerLitre?: number; // price per litre (e.g. 102.5)
  litresFilled?: number; // if entered directly
  isFullTank?: boolean;
  imageUrl?: string;
  notes?: string;
}

export interface IFuelAnalyticsSummary {
  vehicleId: string;
  vehicleName: string;
  expectedMileage: number;
  totalSpent: number;
  totalLitres: number;
  totalDistanceKm: number;
  averageMileage: number;
  averageCostPerKm: number;
  logsCount: number;
}

