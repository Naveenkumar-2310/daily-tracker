import { PillLogRepository } from "./pill-log.repository";
import { MedicineRepository } from "../medicine-master/medicine.repository";
import {
  IMarkPillDTO,
  IPillLog,
  ICalendarDaySummary,
  IPillStreakStats,
} from "./pill-log.interface";

export class PillLogService {
  constructor(
    private pillLogRepo: PillLogRepository = new PillLogRepository(),
    private medicineRepo: MedicineRepository = new MedicineRepository(),
  ) {}

  public async markPill(dto: IMarkPillDTO): Promise<IPillLog> {
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    if (dto.date > todayStr) {
      throw new Error(
        "Cannot log medicine intake for future dates as a medical safety precaution",
      );
    }

    const med = await this.medicineRepo.findById(dto.medicineId);
    if (!med) {
      throw new Error(`Medicine with id ${dto.medicineId} not found`);
    }

    const previousLog = await this.pillLogRepo.findByDateAndMedicine(
      dto.date,
      dto.medicineId,
    );
    const wasAlreadyTaken = previousLog?.status === "TAKEN";

    const log = await this.pillLogRepo.upsertLog(
      med.id,
      med.name,
      dto.date,
      dto.status,
      dto.notes,
    );

    // If marked as TAKEN now and was not previously marked TAKEN, decrement stock
    if (dto.status === "TAKEN" && !wasAlreadyTaken) {
      await this.medicineRepo.decrementStock(med.id, 1);
    } else if (wasAlreadyTaken && dto.status !== "TAKEN") {
      // Revert stock if previously TAKEN and now changed back
      await this.medicineRepo.decrementStock(med.id, -1);
    }

    return log;
  }

  public async getTodayStatus(dateStr?: string): Promise<{
    date: string;
    medicines: Array<{
      medicineId: string;
      medicineName: string;
      strength: string;
      scheduleSlot: string;
      reminderTime: string;
      foodRelation?: string;
      status: "TAKEN" | "MISSED" | "SKIPPED" | "PENDING";
      takenAt?: string;
      currentStock: number;
      lowStockAlert?: number;
    }>;
  }> {
    const today = dateStr || new Date().toISOString().slice(0, 10);
    const activeMeds = await this.medicineRepo.findAll(true);
    const todayLogs = await this.pillLogRepo.findByMonth(today.slice(0, 7));

    const result = activeMeds.map((med) => {
      const log = todayLogs.find(
        (l) => l.date === today && l.medicineId === med.id,
      );
      return {
        medicineId: med.id,
        medicineName: med.name,
        strength: med.strength,
        scheduleSlot: med.scheduleSlot,
        reminderTime: med.reminderTime,
        foodRelation: med.foodRelation || "AFTER_FOOD",
        status: (log?.status || "PENDING") as
          | "TAKEN"
          | "MISSED"
          | "SKIPPED"
          | "PENDING",
        takenAt: log?.takenAt,
        currentStock: med.currentStock,
        lowStockAlert: med.lowStockAlert,
      };
    });

    return { date: today, medicines: result };
  }

  public async getCalendarMonth(
    yearMonth: string,
    medicineId?: string,
  ): Promise<Record<string, ICalendarDaySummary>> {
    const logs = await this.pillLogRepo.findByMonth(yearMonth, medicineId);
    const activeMeds = await this.medicineRepo.findAll(true);
    const relevantMeds = medicineId
      ? activeMeds.filter((m) => m.id === medicineId)
      : activeMeds;

    const calendarMap: Record<string, ICalendarDaySummary> = {};

    logs.forEach((log) => {
      if (!calendarMap[log.date]) {
        calendarMap[log.date] = {
          date: log.date,
          allTaken: false,
          totalScheduled: relevantMeds.length,
          totalTaken: 0,
          logs: [],
        };
      }
      calendarMap[log.date].logs.push(log);
      if (log.status === "TAKEN") {
        calendarMap[log.date].totalTaken += 1;
      }
    });

    Object.values(calendarMap).forEach((day) => {
      day.allTaken =
        day.totalTaken >= day.totalScheduled && day.totalScheduled > 0;
    });

    return calendarMap;
  }

  public async getStreakStats(medicineId?: string): Promise<IPillStreakStats> {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const logs = await this.pillLogRepo.findByMonth(currentMonth, medicineId);

    const takenThisMonth = logs.filter((l) => l.status === "TAKEN").length;
    const missedThisMonth = logs.filter((l) => l.status === "MISSED").length;

    // Calculate streak back from today
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 60; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);

      const dayLogs = logs.filter((l) => l.date === dateStr);
      const taken = dayLogs.some((l) => l.status === "TAKEN");
      if (taken) {
        streak++;
      } else if (i === 0) {
        // Today might still be pending
        continue;
      } else {
        break;
      }
    }

    return {
      currentStreakDays: streak,
      takenThisMonth,
      missedThisMonth,
    };
  }
}
