import mysql, { Pool } from 'mysql2/promise';

let pool: Pool | null = null;

export async function initMysql(connectionString: string): Promise<Pool | null> {
  try {
    // Parse connection string: mysql://root:Naveen2310@localhost:3306/daily_tracker
    const url = new URL(connectionString);
    const database = url.pathname.replace(/^\//, '') || 'daily_tracker';
    const isCloud = url.hostname !== 'localhost' && url.hostname !== '127.0.0.1';
    const sslConfig = isCloud ? { rejectUnauthorized: false } : undefined;

    // 1. Connect without database first to ensure database exists (on local MySQL)
    if (!isCloud) {
      try {
        const rootConnection = await mysql.createConnection({
          host: url.hostname || 'localhost',
          port: parseInt(url.port || '3306', 10),
          user: decodeURIComponent(url.username || 'root'),
          password: decodeURIComponent(url.password || ''),
        });

        await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${database}\`;`);
        await rootConnection.end();
      } catch (rootErr) {
        // Cloud providers often restrict root creation, ignore if already exists
      }
    }

    // 2. Create the connection pool with the database
    pool = mysql.createPool({
      host: url.hostname || 'localhost',
      port: parseInt(url.port || '3306', 10),
      user: decodeURIComponent(url.username || 'root'),
      password: decodeURIComponent(url.password || ''),
      database: database,
      ssl: sslConfig,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });

    // 3. Create tables if not exist
    await createTables(pool);
    console.log(`✅ Connected to MySQL database "${database}" at ${url.hostname}:${url.port}`);
    return pool;
  } catch (error) {
    console.warn('⚠️ Could not connect to MySQL server. Falling back to local storage.', error);
    return null;
  }
}

async function createTables(p: Pool): Promise<void> {
  await p.query(`
    CREATE TABLE IF NOT EXISTS medicines (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      strength VARCHAR(100) NOT NULL,
      dosageForm VARCHAR(100) DEFAULT 'Tablet',
      scheduleSlot VARCHAR(50) NOT NULL,
      reminderTime VARCHAR(10) NOT NULL,
      foodRelation VARCHAR(50) DEFAULT 'AFTER_FOOD',
      currentStock INT DEFAULT 30,
      lowStockAlert INT DEFAULT 5,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt VARCHAR(50) NOT NULL,
      updatedAt VARCHAR(50) NOT NULL
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS pill_logs (
      id VARCHAR(64) PRIMARY KEY,
      medicineId VARCHAR(64) NOT NULL,
      medicineName VARCHAR(255) NOT NULL,
      date VARCHAR(20) NOT NULL,
      status VARCHAR(20) NOT NULL,
      takenAt VARCHAR(50) NOT NULL,
      notes TEXT,
      FOREIGN KEY (medicineId) REFERENCES medicines(id) ON DELETE CASCADE
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      registrationNumber VARCHAR(100),
      expectedMileage DOUBLE NOT NULL DEFAULT 55.0,
      fuelTankCapacity DOUBLE,
      initialOdometerKm DOUBLE NOT NULL DEFAULT 0.0,
      monthlyBudget DOUBLE DEFAULT 3000.0,
      isActive BOOLEAN DEFAULT TRUE,
      createdAt VARCHAR(50) NOT NULL,
      updatedAt VARCHAR(50) NOT NULL
    );
  `);

  try {
    await p.query(`ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS monthlyBudget DOUBLE DEFAULT 3000.0;`);
  } catch {}

  await p.query(`
    CREATE TABLE IF NOT EXISTS fuel_logs (
      id VARCHAR(64) PRIMARY KEY,
      vehicleId VARCHAR(64) NOT NULL,
      vehicleName VARCHAR(255) NOT NULL,
      date VARCHAR(20) NOT NULL,
      odometerKm DOUBLE NOT NULL,
      petrolAmount DOUBLE NOT NULL,
      fuelPricePerLitre DOUBLE,
      litresFilled DOUBLE NOT NULL,
      distanceCovered DOUBLE,
      actualMileage DOUBLE,
      imageUrl TEXT,
      notes TEXT,
      createdAt VARCHAR(50) NOT NULL,
      FOREIGN KEY (vehicleId) REFERENCES vehicles(id) ON DELETE CASCADE
    );
  `);

  // Seed default Bike if vehicles table is empty
  const [vehicleRows]: any = await p.query('SELECT COUNT(*) as count FROM vehicles');
  if (vehicleRows[0].count === 0) {
    const now = new Date().toISOString();
    await p.query(
      `INSERT INTO vehicles (id, name, registrationNumber, expectedMileage, fuelTankCapacity, initialOdometerKm, isActive, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      ['bike-commuter-55', 'My Daily Bike', 'TN-01-BK-5500', 55.0, 12.0, 12500.0, true, now, now]
    );
  }
}

export function getMysqlPool(): Pool | null {
  return pool;
}

