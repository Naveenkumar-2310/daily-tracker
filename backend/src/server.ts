import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { initMysql } from './common/database/mysql';
import { MedicineController } from './modules/medicine-master/medicine.controller';
import { PillLogController } from './modules/pill-log/pill-log.controller';
import { VehicleController } from './modules/vehicle-master/vehicle.controller';
import { FuelLogController } from './modules/fuel-log/fuel-log.controller';
import { OcrController } from './modules/ocr/ocr.controller';
import { validateRequest } from './common/middleware/validation.middleware';
import { CreateMedicineSchema, UpdateMedicineSchema } from './modules/medicine-master/medicine.validation';
import { MarkPillSchema } from './modules/pill-log/pill-log.validation';
import { CreateVehicleSchema, UpdateVehicleSchema } from './modules/vehicle-master/vehicle.validation';
import { CreateFuelLogSchema } from './modules/fuel-log/fuel-log.validation';
import { errorHandler } from './common/middleware/error.middleware';

const app = express();
const PORT: number = Number(process.env.PORT) || 5001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Controllers
const medicineController = new MedicineController();
const pillLogController = new PillLogController();
const vehicleController = new VehicleController();
const fuelLogController = new FuelLogController();
const ocrController = new OcrController();

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Daily Tracker Backend API',
    documentation: '/api-docs',
    swagger: '/swagger',
    health: '/health',
    timestamp: new Date().toISOString(),
  });
});

// Health Check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Pills & Petrol Handler API', timestamp: new Date().toISOString() });
});

// Swagger OpenAPI Endpoints (Tutor-AI Pattern)
const swaggerJsonPath = path.join(__dirname, 'swagger.json');
app.get('/swagger', (_req, res) => {
  if (fs.existsSync(swaggerJsonPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(swaggerJsonPath);
  } else {
    // In dev / ts-node fallback
    res.sendFile(path.join(process.cwd(), 'src/swagger.json'));
  }
});

app.get('/docs/swagger.json', (_req, res) => {
  if (fs.existsSync(swaggerJsonPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.sendFile(swaggerJsonPath);
  } else {
    res.sendFile(path.join(process.cwd(), 'src/swagger.json'));
  }
});

app.get('/api-docs', (_req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Pills & Petrol Tracker API Documentation</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui.css" />
  <style>body { margin: 0; background: #fafafa; }</style>
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.11.0/swagger-ui-bundle.js"></script>
  <script>
    window.onload = () => {
      window.ui = SwaggerUIBundle({
        url: '/swagger',
        dom_id: '#swagger-ui',
        deepLinking: true
      });
    };
  </script>
</body>
</html>`);
});

// Medicine Master Routes
const medRouter = express.Router();
medRouter.get('/', medicineController.getAll);
medRouter.get('/:id', medicineController.getById);
medRouter.post('/', validateRequest(CreateMedicineSchema), medicineController.create);
medRouter.put('/:id', validateRequest(UpdateMedicineSchema), medicineController.update);
medRouter.post('/:id/restock', medicineController.restock);
medRouter.delete('/:id', medicineController.delete);
app.use('/api/v1/medicines', medRouter);

// Pill Log (Transactions & Calendar) Routes
const pillRouter = express.Router();
pillRouter.get('/today', pillLogController.getToday);
pillRouter.get('/calendar', pillLogController.getCalendar);
pillRouter.get('/stats', pillLogController.getStats);
pillRouter.post('/mark', validateRequest(MarkPillSchema), pillLogController.markPill);
app.use('/api/v1/pill-logs', pillRouter);

// Vehicle Master Routes
const vehicleRouter = express.Router();
vehicleRouter.get('/', vehicleController.getAll);
vehicleRouter.get('/:id', vehicleController.getById);
vehicleRouter.post('/', validateRequest(CreateVehicleSchema), vehicleController.create);
vehicleRouter.put('/:id', validateRequest(UpdateVehicleSchema), vehicleController.update);
vehicleRouter.delete('/:id', vehicleController.delete);
app.use('/api/v1/vehicles', vehicleRouter);

// Fuel Log (Transactions & Mileage Calculation) Routes
const fuelRouter = express.Router();
fuelRouter.get('/history', fuelLogController.getHistory);
fuelRouter.get('/analytics/:vehicleId', fuelLogController.getAnalytics);
fuelRouter.post('/', validateRequest(CreateFuelLogSchema), fuelLogController.create);
fuelRouter.delete('/:id', fuelLogController.delete);
app.use('/api/v1/fuel-logs', fuelRouter);

// OCR Scanner Routes
const ocrRouter = express.Router();
ocrRouter.post('/analyze-text', ocrController.analyzeText);
ocrRouter.post('/analyze-image', ocrController.analyzeImage);
app.use('/api/v1/ocr', ocrRouter);

// Global Error Handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  const dbUri = process.env.DB_CONNECTION_STRING || 'mysql://root:Naveen2310@localhost:3306/daily_tracker';
  initMysql(dbUri).then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Pills & Petrol Handler Backend running at http://0.0.0.0:${PORT}`);
    });
  });
}

export default app;
