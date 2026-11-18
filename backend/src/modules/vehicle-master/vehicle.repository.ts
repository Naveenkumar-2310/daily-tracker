import { JsonDatabase } from "../../common/database/db";
import { getMysqlPool } from "../../common/database/mysql";
import {
  IVehicle,
  ICreateVehicleDTO,
  IUpdateVehicleDTO,
} from "./vehicle.interface";
import { v4 as uuidv4 } from "uuid";

export class VehicleRepository {
  private db = JsonDatabase.getInstance();

  public async findAll(onlyActive: boolean = false): Promise<IVehicle[]> {
    const pool = getMysqlPool();
    if (pool) {
      const sql = onlyActive
        ? "SELECT * FROM vehicles WHERE isActive = 1"
        : "SELECT * FROM vehicles";
      const [rows]: any = await pool.query(sql);
      return rows.map((r: any) => ({ ...r, isActive: Boolean(r.isActive) }));
    }
    const list = this.db.getData().vehicles;
    return onlyActive ? list.filter((v) => v.isActive) : [...list];
  }

  public async findById(id: string): Promise<IVehicle | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query(
        "SELECT * FROM vehicles WHERE id = ?",
        [id],
      );
      if (rows.length === 0) return null;
      return { ...rows[0], isActive: Boolean(rows[0].isActive) };
    }
    const item = this.db.getData().vehicles.find((v) => v.id === id);
    return item || null;
  }

  public async create(dto: ICreateVehicleDTO): Promise<IVehicle> {
    const now = new Date().toISOString();
    const newVehicle: IVehicle = {
      id: `bike-${uuidv4()}`,
      name: dto.name,
      registrationNumber: dto.registrationNumber,
      expectedMileage: dto.expectedMileage,
      fuelTankCapacity: dto.fuelTankCapacity,
      initialOdometerKm: dto.initialOdometerKm,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const pool = getMysqlPool();
    if (pool) {
      await pool.query(
        `INSERT INTO vehicles (id, name, registrationNumber, expectedMileage, fuelTankCapacity, initialOdometerKm, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newVehicle.id,
          newVehicle.name,
          newVehicle.registrationNumber || null,
          newVehicle.expectedMileage,
          newVehicle.fuelTankCapacity || null,
          newVehicle.initialOdometerKm,
          newVehicle.isActive,
          newVehicle.createdAt,
          newVehicle.updatedAt,
        ],
      );
      return newVehicle;
    }

    this.db.getData().vehicles.push(newVehicle);
    this.db.save();
    return newVehicle;
  }

  public async update(
    id: string,
    dto: IUpdateVehicleDTO,
  ): Promise<IVehicle | null> {
    const pool = getMysqlPool();
    if (pool) {
      const existing = await this.findById(id);
      if (!existing) return null;
      const updated = {
        ...existing,
        ...dto,
        updatedAt: new Date().toISOString(),
      };
      await pool.query(
        `UPDATE vehicles SET name = ?, registrationNumber = ?, expectedMileage = ?, fuelTankCapacity = ?, initialOdometerKm = ?, isActive = ?, updatedAt = ?
         WHERE id = ?`,
        [
          updated.name,
          updated.registrationNumber || null,
          updated.expectedMileage,
          updated.fuelTankCapacity || null,
          updated.initialOdometerKm,
          updated.isActive,
          updated.updatedAt,
          id,
        ],
      );
      return updated;
    }

    const vehicle = this.db.getData().vehicles.find((v) => v.id === id);
    if (!vehicle) return null;

    Object.assign(vehicle, dto, { updatedAt: new Date().toISOString() });
    this.db.save();
    return vehicle;
  }

  public async delete(id: string): Promise<boolean> {
    const pool = getMysqlPool();
    if (pool) {
      const [res]: any = await pool.query("DELETE FROM vehicles WHERE id = ?", [
        id,
      ]);
      return res.affectedRows > 0;
    }

    const vehicles = this.db.getData().vehicles;
    const index = vehicles.findIndex((v) => v.id === id);
    if (index === -1) return false;

    vehicles.splice(index, 1);
    this.db.save();
    return true;
  }
}
