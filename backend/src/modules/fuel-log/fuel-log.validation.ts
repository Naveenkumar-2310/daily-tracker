import { z } from 'zod';

export const CreateFuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Vehicle ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted as YYYY-MM-DD'),
  odometerKm: z.number().positive('Odometer reading must be greater than 0'),
  petrolAmount: z.number().positive('Petrol amount must be greater than 0'),
  fuelPricePerLitre: z.number().positive().optional(),
  litresFilled: z.number().positive().optional(),
  isFullTank: z.boolean().optional(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
}).refine((data) => data.fuelPricePerLitre !== undefined || data.litresFilled !== undefined, {
  message: 'Please provide either fuel price per litre or litres filled',
  path: ['litresFilled'],
});

