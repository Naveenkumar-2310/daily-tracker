export type ScheduleSlot = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'CUSTOM';
export type FoodRelation = 'BEFORE_FOOD' | 'AFTER_FOOD' | 'WITH_FOOD';

export interface IMedicine {
  id: string;
  name: string;
  strength: string;
  dosageForm: string;
  scheduleSlot: ScheduleSlot;
  reminderTime: string; // HH:mm format e.g. "21:30"
  foodRelation: FoodRelation;
  currentStock: number;
  lowStockAlert: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ICreateMedicineDTO {
  name: string;
  strength: string;
  dosageForm?: string;
  scheduleSlot: ScheduleSlot;
  reminderTime: string;
  foodRelation?: FoodRelation;
  currentStock?: number;
  lowStockAlert?: number;
}

export interface IUpdateMedicineDTO extends Partial<ICreateMedicineDTO> {
  isActive?: boolean;
}

