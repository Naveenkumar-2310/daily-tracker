import { JsonDatabase } from '../../common/database/db';
import { getMysqlPool } from '../../common/database/mysql';
import { IMedicine, ICreateMedicineDTO, IUpdateMedicineDTO } from './medicine.interface';
import { v4 as uuidv4 } from 'uuid';

export class MedicineRepository {
  private db = JsonDatabase.getInstance();

  public async findAll(onlyActive: boolean = false): Promise<IMedicine[]> {
    const pool = getMysqlPool();
    if (pool) {
      const sql = onlyActive ? 'SELECT * FROM medicines WHERE isActive = 1' : 'SELECT * FROM medicines';
      const [rows]: any = await pool.query(sql);
      return rows.map((r: any) => ({ ...r, isActive: Boolean(r.isActive) }));
    }
    const list = this.db.getData().medicines;
    return onlyActive ? list.filter((m) => m.isActive) : [...list];
  }

  public async findById(id: string): Promise<IMedicine | null> {
    const pool = getMysqlPool();
    if (pool) {
      const [rows]: any = await pool.query('SELECT * FROM medicines WHERE id = ?', [id]);
      if (rows.length === 0) return null;
      return { ...rows[0], isActive: Boolean(rows[0].isActive) };
    }
    const item = this.db.getData().medicines.find((m) => m.id === id);
    return item || null;
  }

  public async create(dto: ICreateMedicineDTO): Promise<IMedicine> {
    const now = new Date().toISOString();
    const newMed: IMedicine = {
      id: `med-${uuidv4()}`,
      name: dto.name,
      strength: dto.strength,
      dosageForm: dto.dosageForm || 'Tablet',
      scheduleSlot: dto.scheduleSlot,
      reminderTime: dto.reminderTime,
      foodRelation: dto.foodRelation || 'AFTER_FOOD',
      currentStock: dto.currentStock !== undefined ? dto.currentStock : 30,
      lowStockAlert: dto.lowStockAlert !== undefined ? dto.lowStockAlert : 5,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };

    const pool = getMysqlPool();
    if (pool) {
      await pool.query(
        `INSERT INTO medicines (id, name, strength, dosageForm, scheduleSlot, reminderTime, foodRelation, currentStock, lowStockAlert, isActive, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          newMed.id,
          newMed.name,
          newMed.strength,
          newMed.dosageForm,
          newMed.scheduleSlot,
          newMed.reminderTime,
          newMed.foodRelation,
          newMed.currentStock,
          newMed.lowStockAlert,
          newMed.isActive,
          newMed.createdAt,
          newMed.updatedAt,
        ]
      );
      return newMed;
    }

    this.db.getData().medicines.push(newMed);
    this.db.save();
    return newMed;
  }

  public async update(id: string, dto: IUpdateMedicineDTO): Promise<IMedicine | null> {
    const pool = getMysqlPool();
    if (pool) {
      const existing = await this.findById(id);
      if (!existing) return null;
      const updated = { ...existing, ...dto, updatedAt: new Date().toISOString() };
      await pool.query(
        `UPDATE medicines SET name = ?, strength = ?, dosageForm = ?, scheduleSlot = ?, reminderTime = ?, foodRelation = ?, currentStock = ?, lowStockAlert = ?, isActive = ?, updatedAt = ?
         WHERE id = ?`,
        [
          updated.name,
          updated.strength,
          updated.dosageForm,
          updated.scheduleSlot,
          updated.reminderTime,
          updated.foodRelation,
          updated.currentStock,
          updated.lowStockAlert,
          updated.isActive,
          updated.updatedAt,
          id,
        ]
      );
      return updated;
    }

    const med = this.db.getData().medicines.find((m) => m.id === id);
    if (!med) return null;

    Object.assign(med, dto, { updatedAt: new Date().toISOString() });
    this.db.save();
    return med;
  }

  public async decrementStock(id: string, amount: number = 1): Promise<IMedicine | null> {
    const pool = getMysqlPool();
    if (pool) {
      await pool.query('UPDATE medicines SET currentStock = GREATEST(0, currentStock - ?) WHERE id = ?', [amount, id]);
      return this.findById(id);
    }

    const med = this.db.getData().medicines.find((m) => m.id === id);
    if (!med) return null;

    med.currentStock = Math.max(0, med.currentStock - amount);
    med.updatedAt = new Date().toISOString();
    this.db.save();
    return med;
  }

  public async delete(id: string): Promise<boolean> {
    const pool = getMysqlPool();
    if (pool) {
      const [res]: any = await pool.query('DELETE FROM medicines WHERE id = ?', [id]);
      return res.affectedRows > 0;
    }

    const meds = this.db.getData().medicines;
    const index = meds.findIndex((m) => m.id === id);
    if (index === -1) return false;

    meds.splice(index, 1);
    this.db.save();
    return true;
  }
}
