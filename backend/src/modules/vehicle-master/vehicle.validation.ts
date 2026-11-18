import { z } from 'zod';

export const CreateVehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle/Bike name is required').trim(),
  registrationNumber: z.string().trim().optional(),
  expectedMileage: z.number().positive('Expected mileage must be positive (e.g. 55 km/L)'),
  fuelTankCapacity: z.number().positive().optional(),
  initialOdometerKm: z.number().nonnegative('Initial odometer cannot be negative'),
});

export const UpdateVehicleSchema = CreateVehicleSchema.partial().extend({
  isActive: z.boolean().optional(),
});

