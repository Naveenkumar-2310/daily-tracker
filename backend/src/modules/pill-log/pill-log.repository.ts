import { JsonDatabase } from "../../common/database/db";
import { getMysqlPool } from "../../common/database/mysql";
import { IPillLog } from "./pill-log.interface";
import { v4 as uuidv4 } from "uuid";

export class PillLogRepository {
  private db = JsonDatabase.getInstance();

  public async findByDateAndMedicine(
    date: string,
    medicineId: string,
  ): Promise<IPillLog | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query(
        "SELECT * FROM pill_logs WHERE date = ? AND medicineId = ?",
        [date, medicineId],
      );
      return rows[0] || null;
    }

    const log = this.db
      .getData()
      .pillLogs.find((p) => p.date === date && p.medicineId === medicineId);
    return log || null;
  }

  public async findByMonth(
    yearMonth: string,
    medicineId?: string,
  ): Promise<IPillLog[]> {
    const pool = getMysqlPool();
    if (pool) {
      let sql = "SELECT * FROM pill_logs WHERE date LIKE ?";
      const params: any[] = [`${yearMonth}%`];
      if (medicineId) {
        sql += " AND medicineId = ?";
        params.push(medicineId);
      }
      const [rows]: any = await pool.query(sql, params);
      return rows;
    }

    return this.db.getData().pillLogs.filter((p) => {
      const matchMonth = p.date.startsWith(yearMonth);
      const matchMed = medicineId ? p.medicineId === medicineId : true;
      return matchMonth && matchMed;
    });
  }

  public async upsertLog(
    medicineId: string,
    medicineName: string,
    date: string,
    status: "TAKEN" | "MISSED" | "SKIPPED",
    notes?: string,
  ): Promise<IPillLog> {
    const pool = getMysqlPool();
    if (pool) {
      const existing = await this.findByDateAndMedicine(date, medicineId);
      const now = new Date().toISOString();
      if (existing) {
        await pool.query(
          "UPDATE pill_logs SET status = ?, takenAt = ?, notes = ? WHERE id = ?",
          [status, now, notes || existing.notes || null, existing.id],
        );
        return {
          ...existing,
          status,
          takenAt: now,
          notes: notes || existing.notes,
        };
      }

      const newLog: IPillLog = {
        id: `pill-${uuidv4()}`,
        medicineId,
        medicineName,
        date,
        status,
        takenAt: now,
        notes,
      };

      await pool.query(
        "INSERT INTO pill_logs (id, medicineId, medicineName, date, status, takenAt, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          newLog.id,
          newLog.medicineId,
          newLog.medicineName,
          newLog.date,
          newLog.status,
          newLog.takenAt,
          newLog.notes || null,
        ],
      );
      return newLog;
    }

    const logs = this.db.getData().pillLogs;
    const existing = logs.find(
      (p) => p.date === date && p.medicineId === medicineId,
    );

    if (existing) {
      existing.status = status;
      existing.takenAt = new Date().toISOString();
      if (notes !== undefined) existing.notes = notes;
      this.db.save();
      return existing;
    }

    const newLog: IPillLog = {
      id: `pill-${uuidv4()}`,
      medicineId,
      medicineName,
      date,
      status,
      takenAt: new Date().toISOString(),
      notes,
    };

    logs.push(newLog);
    this.db.save();
    return newLog;
  }

  public async delete(id: string): Promise<boolean> {
    const pool = getMysqlPool();
    if (pool) {
      const [res]: any = await pool.query(
        "DELETE FROM pill_logs WHERE id = ?",
        [id],
      );
      return res.affectedRows > 0;
    }

    const logs = this.db.getData().pillLogs;
    const index = logs.findIndex((p) => p.id === id);
    if (index === -1) return false;

    logs.splice(index, 1);
    this.db.save();
    return true;
  }
}
