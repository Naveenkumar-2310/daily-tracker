import { JsonDatabase } from '../../common/database/db';
import { getMysqlPool } from '../../common/database/mysql';
import { IFuelLog } from './fuel-log.interface';
import { v4 as uuidv4 } from 'uuid';

export class FuelLogRepository {
  private db = JsonDatabase.getInstance();

  public async findAll(vehicleId?: string): Promise<IFuelLog[]> {
    const pool = getMysqlPool();
    if (pool) {
      let sql = 'SELECT * FROM fuel_logs';
      const params: any[] = [];
      if (vehicleId) {
        sql += ' WHERE vehicleId = ?';
        params.push(vehicleId);
      }
      sql += ' ORDER BY date DESC, createdAt DESC';
      const [rows]: any = await pool.query(sql, params);
      return rows;
    }

    const list = this.db.getData().fuelLogs;
    const filtered = vehicleId ? list.filter((f) => f.vehicleId === vehicleId) : list;
    return [...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async findLatestBefore(vehicleId: string, beforeOdometer: number): Promise<IFuelLog | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query(
        'SELECT * FROM fuel_logs WHERE vehicleId = ? AND odometerKm < ? ORDER BY odometerKm DESC LIMIT 1',
        [vehicleId, beforeOdometer]
      );
      return rows[0] || null;
    }

    const list = this.db.getData().fuelLogs
      .filter((f) => f.vehicleId === vehicleId && f.odometerKm < beforeOdometer)
      .sort((a, b) => b.odometerKm - a.odometerKm);

    return list[0] || null;
  }

  public async create(logData: Omit<IFuelLog, 'id' | 'createdAt'>): Promise<IFuelLog> {
    const newLog: IFuelLog = {
      ...logData,
      id: `fuel-${uuidv4()}`,
      createdAt: new Date().toISOString(),
    };

    const pool = getMysqlPool();
    if (pool) {
      await pool.query(
        `INSERT INTO fuel_logs (id, vehicleId, vehicleName, date, odometerKm, petrolAmount, fuelPricePerLitre, litresFilled, distanceCovered, actualMileage, imageUrl, notes, createdAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newLog.id,
          newLog.vehicleId,
          newLog.vehicleName,
          newLog.date,
          newLog.odometerKm,
          newLog.petrolAmount,
          newLog.fuelPricePerLitre || null,
          newLog.litresFilled,
          newLog.distanceCovered || null,
          newLog.actualMileage || null,
          newLog.imageUrl || null,
          newLog.notes || null,
          newLog.createdAt,
        ]
      );
      return newLog;
    }

    this.db.getData().fuelLogs.push(newLog);
    this.db.save();
    return newLog;
  }

  public async delete(id: string): Promise<boolean> {
    const pool = getMysqlPool();
    if (pool) {
      const [res]: any = await pool.query('DELETE FROM fuel_logs WHERE id = ?', [id]);
      return res.affectedRows > 0;
    }

    const logs = this.db.getData().fuelLogs;
    const index = logs.findIndex((l) => l.id === id);
    if (index === -1) return false;

    logs.splice(index, 1);
    this.db.save();
    return true;
  }
}
