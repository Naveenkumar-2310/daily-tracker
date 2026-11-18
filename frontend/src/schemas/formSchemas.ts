import { z } from 'zod';

/**
 * Fuel Log Form Schema
 */
export const fuelLogSchema = z.object({
  vehicleId: z.string().min(1, 'Please select a vehicle profile'),
  date: z.string().min(1, 'Date is required'),
  petrolAmount: z
    .string()
    .min(1, 'Petrol amount in ₹ is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Amount must be greater than ₹0',
    }),
  fuelPricePerLitre: z
    .string()
    .min(1, 'Fuel price per litre is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Fuel price must be greater than ₹0',
    }),
  odometerKm: z
    .string()
    .min(1, 'Current odometer reading is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
      message: 'Odometer must be a valid positive kilometer reading',
    }),
  notes: z.string().optional(),
});

export type FuelLogFormData = z.infer<typeof fuelLogSchema>;

/**
 * Medicine / Tablet Form Schema
 */
export const medicineSchema = z.object({
  name: z.string().min(1, 'Tablet name is required (e.g. Dolo 650)'),
  strength: z.string().min(1, 'Dose is required (e.g. 650 mg or 1 Tablet)'),
  scheduleSlot: z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'CUSTOM']),
  reminderTime: z.string().min(1, 'Reminder time is required (e.g. 14:30)'),
  frequency: z.enum(['DAILY', 'ALTERNATE', 'WEEKDAYS', 'WEEKENDS', 'SOS']),
  durationDays: z.string().optional(),
  currentStock: z
    .string()
    .min(1, 'Tablets in strip is required (e.g. 10)')
    .refine((val) => !isNaN(parseInt(val, 10)) && parseInt(val, 10) >= 1, {
      message: 'Tablets in strip must be at least 1',
    }),
  refillReminder: z.boolean(),
  alertType: z.enum(['NOTIFICATION', 'ALARM']),
});

export type MedicineFormData = z.infer<typeof medicineSchema>;

/**
 * Vehicle Form Schema
 */
export const vehicleSchema = z.object({
  name: z.string().min(1, 'Vehicle name is required (e.g. KTM Duke 390)'),
  registrationNumber: z.string().optional(),
  expectedMileage: z
    .string()
    .min(1, 'Target mileage is required')
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Target mileage must be greater than 0 km/L',
    }),
  initialOdometerKm: z
    .string()
    .optional()
    .refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
      message: 'Initial odometer must be a valid number',
    }),
});

export type VehicleFormData = z.infer<typeof vehicleSchema>;

