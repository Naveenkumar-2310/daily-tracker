export interface IVehicle {
  id: string;
  name: string;
  registrationNumber?: string;
  expectedMileage: number; // e.g. 55 km/L
  fuelTankCapacity?: number;
  initialOdometerKm: number;
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
}

export interface IUpdateVehicleDTO extends Partial<ICreateVehicleDTO> {
  isActive?: boolean;
}

