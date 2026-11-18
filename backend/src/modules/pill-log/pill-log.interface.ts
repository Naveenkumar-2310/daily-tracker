export type PillStatus = 'TAKEN' | 'MISSED' | 'SKIPPED';

export interface IPillLog {
  id: string;
  medicineId: string;
  medicineName: string;
  date: string; // YYYY-MM-DD
  status: PillStatus;
  takenAt: string;
  notes?: string;
}

export interface IMarkPillDTO {
  medicineId: string;
  date: string; // YYYY-MM-DD
  status: PillStatus;
  notes?: string;
}

export interface ICalendarDaySummary {
  date: string;
  allTaken: boolean;
  totalScheduled: number;
  totalTaken: number;
  logs: IPillLog[];
}

export interface IPillStreakStats {
  currentStreakDays: number;
  takenThisMonth: number;
  missedThisMonth: number;
}

