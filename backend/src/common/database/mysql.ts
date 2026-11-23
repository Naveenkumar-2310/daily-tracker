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

  await p.query(`
    CREATE TABLE IF NOT EXISTS expense_categories (
      id VARCHAR(64) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'EXPENSE',
      icon VARCHAR(100) NOT NULL DEFAULT 'tag',
      color VARCHAR(30) NOT NULL DEFAULT '#4F46E5',
      isDefault BOOLEAN DEFAULT TRUE,
      createdAt VARCHAR(50) NOT NULL
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS expenses (
      id VARCHAR(64) PRIMARY KEY,
      type VARCHAR(20) NOT NULL DEFAULT 'EXPENSE',
      amount DOUBLE NOT NULL,
      categoryId VARCHAR(64) NOT NULL,
      categoryName VARCHAR(255) NOT NULL,
      date VARCHAR(20) NOT NULL,
      paymentMode VARCHAR(30) NOT NULL DEFAULT 'UPI',
      accountName VARCHAR(100),
      notes TEXT,
      receiptUrl TEXT,
      vehicleId VARCHAR(64),
      fuelLogId VARCHAR(64),
      medicineId VARCHAR(64),
      isRecurring BOOLEAN DEFAULT FALSE,
      createdAt VARCHAR(50) NOT NULL,
      updatedAt VARCHAR(50) NOT NULL,
      INDEX idx_expense_date (date),
      INDEX idx_expense_cat (categoryId)
    );
  `);

  await p.query(`
    CREATE TABLE IF NOT EXISTS monthly_budgets (
      id VARCHAR(64) PRIMARY KEY,
      month INT NOT NULL,
      year INT NOT NULL,
      overallBudget DOUBLE NOT NULL DEFAULT 0,
      categoryBudgetsJson TEXT,
      createdAt VARCHAR(50) NOT NULL,
      updatedAt VARCHAR(50) NOT NULL,
      UNIQUE KEY uq_month_year (month, year)
    );
  `);

  // Seed default categories if none exist
  try {
    const [rows]: any = await p.query('SELECT COUNT(*) as count FROM expense_categories');
    if (rows[0]?.count === 0) {
      const defaultCategories = [
        ['cat-fuel', 'Fuel & Transport', 'EXPENSE', 'gas-station', '#D97706', true, new Date().toISOString()],
        ['cat-med', 'Medicines & Health', 'EXPENSE', 'pill', '#0D9488', true, new Date().toISOString()],
        ['cat-food', 'Food & Dining', 'EXPENSE', 'silverware-fork-knife', '#F97316', true, new Date().toISOString()],
        ['cat-grocery', 'Groceries', 'EXPENSE', 'cart-outline', '#10B981', true, new Date().toISOString()],
        ['cat-bills', 'Bills & Utilities', 'EXPENSE', 'lightning-bolt', '#3B82F6', true, new Date().toISOString()],
        ['cat-shopping', 'Shopping', 'EXPENSE', 'shopping-outline', '#8B5CF6', true, new Date().toISOString()],
        ['cat-entertainment', 'Entertainment', 'EXPENSE', 'movie-play-outline', '#EC4899', true, new Date().toISOString()],
        ['cat-other-exp', 'Other Expenses', 'EXPENSE', 'dots-horizontal-circle', '#6B7280', true, new Date().toISOString()],
        ['cat-salary', 'Salary', 'INCOME', 'briefcase-outline', '#059669', true, new Date().toISOString()],
        ['cat-freelance', 'Freelance & Projects', 'INCOME', 'laptop', '#0284C7', true, new Date().toISOString()],
        ['cat-other-inc', 'Other Income', 'INCOME', 'cash-plus', '#6366F1', true, new Date().toISOString()],
      ];
      for (const cat of defaultCategories) {
        await p.query(
          'INSERT INTO expense_categories (id, name, type, icon, color, isDefault, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
          cat
        );
      }
    }
  } catch (seedErr) {
    console.warn('Could not seed default expense categories:', seedErr);
  }
}

export function getMysqlPool(): Pool | null {
  return pool;
}

