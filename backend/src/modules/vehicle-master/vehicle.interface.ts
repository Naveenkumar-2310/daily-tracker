export interface IVehicle {
  id: string;
  name: string;
  registrationNumber?: string;
  expectedMileage: number; // e.g. 55 km/L
  fuelTankCapacity?: number;
  initialOdometerKm: number;
  monthlyBudget?: number; // Monthly petrol budget in ₹ (e.g. 3000)
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateVehicleDTO {
  name: string;
  registrationNumber?: string;
  expectedMileage: number;
  fuelTankCapacity?: number;
  initialOdometerKm: number;
  monthlyBudget?: number;
}

export interface IUpdateVehicleDTO extends Partial<ICreateVehicleDTO> {
  isActive?: boolean;
}

