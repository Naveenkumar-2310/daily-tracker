# 📱 Daily Track: Pill & Petrol Handler Mobile App

A full-stack application built with **React Native + React Native Paper** on the frontend and a **Clean Layered Architecture (Interface, Validation, Service, Repository, Controller)** on the backend.

---

## 🎯 Key Features

1. **Daily Pill Tracker (Leviphil 500 & More)**:
   - Built-in configuration for **Leviphil 500** taken nightly.
   - Quick one-tap "I Took This Tablet" button to resolve forgetting whether you took the medicine today.
   - Interactive monthly calendar with green (taken) and red (missed) indicators.
   - Strip/Stock inventory management that decrements tablets as you take them.
   - Medicine Master: Add any new medication at any time (name, strength, morning/afternoon/night slots).

2. **Bike Petrol & Mileage Handler**:
   - Built-in tracking for your bike with a **55 km/L baseline**.
   - Input refuel date, petrol amount paid (₹), and current odometer reading.
   - **Camera OCR Scanner**: Open camera to point at your odometer/speedometer to automatically recognize current KM and date.
   - **Instant Mileage Analysis**: Computes trip distance, fuel filled, and actual mileage (km/L) compared against your 55 km/L target.
   - Vehicle Master: Add any second bike, car, or scooter anytime.

3. **React Native Paper Common Components**:
   - `AppTextField`: Outlined TextInput with HelperText validation and icons.
   - `AppRadioButtonGroup`: Clean radio button group with row and column options.
   - `AppDatePicker`: Interactive modal date picker with quick presets (Today, Yesterday).
   - `AppButton`: Standardized action buttons with loading and color tokens.
   - `AppCard`: Elevated Surface/Card container for clear visual hierarchy.
   - `AppHeader`: Top Appbar navigation with title, subtitle, and back buttons.

---

## 🏗️ Project Architecture

```
daily-tracker-app/
├── backend/                       # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── modules/
│   │   │   ├── medicine-master/   # Interface, Validation, Repository, Service, Controller
│   │   │   ├── pill-log/          # Interface, Validation, Repository, Service, Controller
│   │   │   ├── vehicle-master/    # Interface, Validation, Repository, Service, Controller
│   │   │   ├── fuel-log/          # Interface, Validation, Repository, Service, Controller
│   │   │   └── ocr/               # Odometer & Date Text Recognition Service & Controller
│   │   ├── common/
│   │   │   ├── database/          # JSON/SQLite persistent storage
│   │   │   └── middleware/        # Zod validation and error handlers
│   │   └── server.ts              # API routes and server bootstrap
│   └── package.json
│
└── frontend/                      # React Native + React Native Paper (Expo)
    ├── App.tsx                    # Root provider, theme, and bottom navigation
    ├── src/
    │   ├── theme/                 # Material Design 3 custom theme
    │   ├── components/common/     # Reusable React Native Paper wrappers
    │   │   ├── AppTextField.tsx
    │   │   ├── AppRadioButtonGroup.tsx
    │   │   ├── AppButton.tsx
    │   │   ├── AppDatePicker.tsx
    │   │   ├── AppCard.tsx
    │   │   └── AppHeader.tsx
    │   ├── features/
    │   │   ├── pills/             # PillHomeScreen & PillCalendarScreen
    │   │   ├── petrol/            # PetrolEntryScreen & CameraOcrModal
    │   │   └── masters/           # ManageMastersScreen (Medicine & Bike Masters)
    │   └── services/              # API communication layer
    └── package.json
```

---

## 🚀 How to Run

### 1. Run the Backend API
```bash
cd backend
npm install
npm run dev
```
The server starts at `http://localhost:5001`.

### 2. Run the Mobile App (Frontend)
```bash
cd frontend
npm install
npx expo start
```
- Press `a` in the terminal to launch on an **Android Emulator**, or scan the QR code using the **Expo Go** app on your physical Android phone.
- If using a physical phone on Wi-Fi, update `API_BASE_URL` in [api.ts](file:///C:/Users/VirdhiTech/.gemini/antigravity/scratch/daily-tracker-app/frontend/src/services/api.ts) with your computer's local IP address (e.g. `http://192.168.1.X:5001`).

