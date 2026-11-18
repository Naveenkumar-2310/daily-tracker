import { z } from 'zod';

export const CreateMedicineSchema = z.object({
  name: z.string().min(1, 'Medicine name is required').trim(),
  strength: z.string().min(1, 'Strength is required (e.g. 500 mg)').trim(),
  dosageForm: z.string().default('Tablet'),
  scheduleSlot: z.enum(['MORNING', 'AFTERNOON', 'NIGHT', 'CUSTOM']),
  reminderTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Time must be in HH:mm format (e.g. 21:30)'),
  foodRelation: z.enum(['BEFORE_FOOD', 'AFTER_FOOD', 'WITH_FOOD']).default('AFTER_FOOD'),
  currentStock: z.number().int().nonnegative().default(30),
  lowStockAlert: z.number().int().nonnegative().default(5),
});

export const UpdateMedicineSchema = CreateMedicineSchema.partial().extend({
  isActive: z.boolean().optional(),
});

