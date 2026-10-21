# 🛡️ TrueMed — AI-Powered Counterfeit Medicine Verification Mobile Application

**TrueMed** is a mobile-first MERN stack application featuring machine learning technology to identify pill images, verify drug authenticity against counterfeit alerts, display medicinal uses, active ingredients, dosage, and side effects, and manage digital prescriptions.

---

## 📽️ Application Demo Recording & Verification Screenshots

![TrueMed App Demo Recording](file:///C:/Users/HP/.gemini/antigravity-ide/brain/092c31e2-62cd-4eae-bca8-2a27aa319659/truemed_app_demo_1790229310225.webp)

````carousel
![Genuine Pill Scan Result](file:///C:/Users/HP/.gemini/antigravity-ide/brain/092c31e2-62cd-4eae-bca8-2a27aa319659/genuine_scan_result_1790229864115.png)
<!-- slide -->
![Counterfeit Pill Alert Warning](file:///C:/Users/HP/.gemini/antigravity-ide/brain/092c31e2-62cd-4eae-bca8-2a27aa319659/counterfeit_scan_result_1790230037829.png)
<!-- slide -->
![Drug Catalog & Prescription Manager](file:///C:/Users/HP/.gemini/antigravity-ide/brain/092c31e2-62cd-4eae-bca8-2a27aa319659/medicines_catalog_1790230143941.png)
<!-- slide -->
![User Profile & Security Settings](file:///C:/Users/HP/.gemini/antigravity-ide/brain/092c31e2-62cd-4eae-bca8-2a27aa319659/user_profile_view_1790230253523.png)
````

---

## 📂 Complete Project Structure

```
d:\truemed\
├── backend/                       # Express Node.js Backend API
│   ├── models/                    # Mongoose Models
│   │   ├── User.js                # User Auth & Profile model
│   │   ├── Medicine.js            # Reference Medicine Catalog schema
│   │   ├── ScanHistory.js         # Scan verification logs & ML diagnostics
│   │   └── Prescription.js        # Digital Prescription schema
│   ├── controllers/               # Business Logic Controllers
│   │   ├── authController.js      # Register, Login, JWT auth
│   │   ├── medicineController.js  # Catalog search & monographs
│   │   ├── scanController.js      # ML scanner endpoint handler
│   │   └── prescriptionController.js # Prescription CRUD
│   ├── routes/                    # Express API Routes
│   │   ├── authRoutes.js
│   │   ├── medicineRoutes.js
│   │   ├── scanRoutes.js
│   │   └── prescriptionRoutes.js
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT Route Shield
│   ├── ml/                        # Machine Learning Module
│   │   └── create_pill_dataset.py # Pill dataset builder for Roboflow training
│   ├── utils/
│   │   ├── roboflowClient.js      # Roboflow Serverless Workflow API Client
│   │   └── mlInference.js         # AI verification engine (Roboflow + fallback)
│   ├── test_smoke.js              # Roboflow Workflow smoke test suite
│   ├── .env                       # Environment variables (ROBOFLOW_API_KEY, MongoDB URI)
│   ├── server.js                  # Entry server script
│   └── package.json
└── frontend/                      # React TypeScript Vite Frontend
    ├── public/
    ├── src/
    │   ├── components/            # Reusable UI Components
    │   │   └── BottomNav.tsx      # Mobile Bottom Navigation Bar (Home, Scan, Meds, Profile)
    │   ├── context/
    │   │   └── AuthContext.tsx    # Auth State, JWT token storage, saved meds
    │   ├── pages/                 # Mobile Application Screens
    │   │   ├── LoginScreen.tsx    # Sign In with form validation & demo one-click fill
    │   │   ├── RegisterScreen.tsx # Registration form with role selector
    │   │   ├── HomeScreen.tsx     # Dashboard, quick stats, counterfeit alerts, daily dose tracker
    │   │   ├── ScanScreen.tsx     # AI Camera frame, sample presets, ML scanning laser & diagnostics
    │   │   ├── PrescriptionScreen.tsx # Drug search catalog, prescription manager, report fake form
    │   │   └── ProfileScreen.tsx  # User metrics, saved verified pills, push alert settings
    │   ├── services/
    │   │   └── api.ts             # API Client with high-availability fallbacks
    │   ├── types/
    │   │   └── index.ts           # TypeScript interfaces
    │   ├── App.tsx                # App shell container with Mobile Frame / Full View toggle
    │   ├── index.css              # TailwindCSS v4 design system
    │   └── main.tsx
    ├── index.html
    ├── vite.config.ts
    └── package.json
```

---

## 🚀 Key Features Implemented

1. **Authentication & Role System (`LoginScreen.tsx` / `RegisterScreen.tsx`)**:
   - Email format validation, password strength requirement, password confirmation matching.
   - Demo one-click buttons for instant testing as **Patient** or **Pharmacist**.
   - Role selection: Patient, Pharmacist, Doctor.

2. **Mobile App Navigation & Shell (`BottomNav.tsx` & `App.tsx`)**:
   - Fixed mobile glassmorphism bottom navigation bar with 4 tabs: **Home**, **Scan Pill**, **Medicines/Details**, **Profile**.
   - Desktop view switcher: toggle between **Device Frame View** (realistic smartphone case) and **Full View**.

3. **AI Pill Scanner & Counterfeit Detector (`ScanScreen.tsx` & `pill_classifier.py`)**:
   - Crosshair camera viewfinder frame with animated scanning beam laser.
   - Preset quick triggers for **Paracetamol 500mg (Genuine)** and **Counterfeit Pill (Fake Batch Alert)**, as well as device photo upload.
   - **Genuine Result Banner**: 98.4% Confidence, manufacturer micro-stamping passed, active compounds verified, green badge with celebratory confetti.
   - **Counterfeit Warning Banner**: 94.6% Risk score, red pulsing alert, risk breakdown detailing font divergence, discolored texture, sub-standard chemical active ingredients.
   - Medicinal Uses, Dosage, Active Ingredients, Side Effects, and AI Diagnostic breakdowns.

4. **Medicine Details & Prescription Manager (`PrescriptionScreen.tsx`)**:
   - **Drug Catalog Tab**: Instant search across 500+ verified medicines by name, generic name, brand name, or pill imprint code. Click to view full monograph modal.
   - **My Prescriptions Tab**: View digital doctor prescriptions with dosage times, instructions, and add new prescription records.
   - **Report Fake Tab**: Form to submit suspicious medicine batch alerts directly to health regulatory authorities.

5. **Profile & Security Settings (`ProfileScreen.tsx`)**:
   - User profile info, total pills scanned, genuine count, saved verified pills list with removal capabilities.
   - Counterfeit push notification toggles and cloud scan backup sync.

---

## ⚙️ Environment & Configuration

Backend environment file (`d:\truemed\backend\.env`):
```env
PORT=5000
MONGODB_URI=mongodb+srv://greeshmagirish108_db_user:hmTiCYPK0PyJA9Ot@truemed.63edmxj.mongodb.net/truemed?retryWrites=true&w=majority
JWT_SECRET=truemed_sec_jwt_key_987654321_super_secure_verification_2026
PYTHON_PATH=python
ROBOFLOW_API_KEY=SnGl...
```

---

## 🛠️ How to Run the Project

1. **Verify Roboflow Workflow Integration**:
   ```powershell
   cd d:\truemed\backend
   npm run test:roboflow
   ```
   *Runs automated smoke test against the live Roboflow serverless workflow (`truemed-vtruemed-ednuz-1-resnet18-t1-logic`).*

2. **Start Backend Server**:
   ```powershell
   cd d:\truemed\backend
   npm start
   ```
   *Runs Express server on `http://localhost:5000` with MongoDB connection & Roboflow AI inference engine.*

3. **Start Frontend App**:
   ```powershell
   cd d:\truemed\frontend
   npm run dev
   ```
   *Runs Vite React TS mobile web application on `http://localhost:5173`.*
