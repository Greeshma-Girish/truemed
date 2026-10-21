# 🛡️ TrueMed — AI-Powered Medicine Verification & Drug Monograph Guide

<p align="center">
  <img src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=900&auto=format&fit=crop&q=80" alt="TrueMed Banner" width="100%" style="border-radius: 12px; max-height: 320px; object-fit: cover;" />
</p>

<p align="center">
  <strong>Detect Counterfeits. Verify Drug Authenticity. Digitize Prescriptions. Safeguard Public Health.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-v4.0-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS v4" />
  <img src="https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js Express" />
  <img src="https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB Atlas" />
  <img src="https://img.shields.io/badge/Roboflow-Computer_Vision-7F52FF?style=for-the-badge&logo=roboflow&logoColor=white" alt="Roboflow" />
  <img src="https://img.shields.io/badge/Google_Gemini-Vision_AI-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Gemini Vision" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
</p>

---

## 📖 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture & ML Pipeline](#-architecture--ml-pipeline)
- [Project Directory Structure](#-project-directory-structure)
- [Technology Stack](#-technology-stack)
- [API Reference](#-api-reference)
- [Prerequisites](#-prerequisites)
- [Installation & Quick Start](#-installation--quick-start)
- [Environment Configuration](#-environment-configuration)
- [Machine Learning & Computer Vision Details](#-machine-learning--computer-vision-details)
- [OCR Prescription Digitizer](#-ocr-prescription-digitizer)
- [Demo Credentials](#-demo-credentials)
- [Testing & Smoke Suite](#-testing--smoke-suite)
- [Clinical Disclaimer & Safety](#-clinical-disclaimer--safety)
- [License](#-license)

---

## 🌟 Overview

Counterfeit and substandard pharmaceuticals pose an existential threat to patient safety worldwide. **TrueMed** is a full-stack, AI-powered medicine verification and clinical intelligence platform. It bridges state-of-the-art computer vision, deep learning, multimodal language vision models (LLMs), and optical character recognition (OCR) into an intuitive, clinical-grade mobile and desktop application.

With TrueMed, patients, pharmacists, and healthcare providers can:
1. **Instantly verify physical pills** using a smartphone camera or image upload.
2. **Detect counterfeit physical traits**, such as surface discoloration, uneven coating, incorrect pill geometry, and debossed imprint discrepancies.
3. **Access FDA & NIH RxImage monographs**, including verified active ingredients, dosage directions, medicinal indications, warnings, and adverse reactions.
4. **Digitize paper prescriptions with OCR**, automatically parsing prescribed drugs, frequencies, and schedules into a personal digital tracker.
5. **Submit counterfeit alerts** directly to regulatory authorities to combat illicit drug circulation.

---

## ✨ Key Features

### 1. 🔍 Multi-Modal AI Pill Verification
- **Real-Time Viewfinder**: Crosshair camera frame with animated laser scanning beam and drag-and-drop file upload.
- **Micro-Stamp Imprint Extraction**: Decodes alphanumeric pill markings (e.g., `DOLO 650`, `CALPOL 500`, `AUG 625`, `P 500`) using Google Gemini Multimodal Vision and offline Tesseract OCR.
- **Physical Geometry & Color Analysis**: OpenCV-powered contour shape detection (Round, Oval, Capsule, Hexagon, etc.), aspect ratio, surface smoothness, and color histogram validation.
- **Multi-Level Verdict**: Returns confidence percentage, match quality score, risk factor flags, and celebration confetti for verified authentic products.

### 2. 📚 Drug Monograph Catalog & Authentic Database
- **600+ Reference Medicines**: Seeded from authentic NIH ePillID (NLM RxImage) and commercial pharmaceutical registries.
- **Instant Search**: Filter by commercial brand name, generic formulation, manufacturer, or debossed imprint code.
- **Clinical Monograph Modal**: Detailed breakdowns of indications, recommended adult/pediatric dosages, active chemical compounds, manufacturer specifications, and contraindications.

### 3. 📄 Smart Prescription OCR & Digital Vault
- **Camera & File Prescription Ingestion**: Upload handwritten or printed prescription images.
- **Intelligent Entity Parsing**: Extracts Doctor Name, Clinic, Patient Name, Prescribed Date, Medicine Name, Dosage, Frequency, and Duration.
- **Fuzzy Clinical Matching**: Reconciles noisy OCR strings against a 50+ item pharmaceutical dictionary (e.g., matching ambiguous text to *Augmentin 625mg*, *Zerodol-SP*, *Pan-D*, *Azithral*).
- **Personal Prescription Manager**: Save, review, edit, and organize digital prescriptions securely.

### 4. ⏰ Daily Dose Tracker & Health Dashboard
- Interactive daily schedule with morning, afternoon, and night dose check-offs.
- Quick statistics on verified medications, scan history, and regulatory counterfeit warnings.
- Urgent recall notices highlighting suspect batches and flagged imprints.

### 5. 👥 Role-Based Authentication & Clinical UX
- Role assignment for **Patients**, **Pharmacists**, **Doctors**, and **Administrators**.
- One-click demo login buttons for frictionless trial and evaluation.
- Full responsive design with desktop clinical view, mobile floating bottom dock, and persistent **Dark / Light theme** toggles.

---

## 🏛️ Architecture & ML Pipeline

TrueMed employs a hybrid, multi-stage decision pipeline engineered for both ultra-high accuracy and high availability:

```
                          ┌───────────────────────────┐
                          │    User Ingests Image     │
                          │   (Pill / Prescription)   │
                          └─────────────┬─────────────┘
                                        │
                 ┌──────────────────────┴──────────────────────┐
                 ▼                                             ▼
       [Pill Scan Ingestion]                        [Prescription Document]
                 │                                             │
                 ├───────────────────────────────┐             ▼
                 ▼                               ▼     [Tesseract OCR Engine]
      ┌────────────────────┐          ┌────────────────────┐   - Layout Analysis
      │   Roboflow Model   │          │  OpenCV Python CV  │   - Line-by-line Parse
      │  (ResNet-18 Edge)  │          │   (pill_cv_detector)│  - Drug Dict Matching
      │ - Visual Category  │          │ - Shape & Contour  │           │
      │ - Trained Batches  │          │ - Color Histogram  │           ▼
      └──────────┬─────────┘          │ - Solidity Index   │  [Extracted Prescription]
                 │                    └──────────┬─────────┘   - Prescriber
                 │                               │             - Drugs & Frequency
                 └───────────────┬───────────────┘             - Verification Tag
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Gemini Vision (Cloud) │
                     │   + Offline OCR Fallback
                     │ - Debossed Imprints   │
                     │ - Zero-shot Brands    │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │ Monograph Resolution  │
                     │ - Match MongoDB / RxID│
                     │ - Physical Geometry   │
                     │ - Counterfeit Risk    │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │  Verified JSON Verdict│
                     │  Confidence & Report  │
                     └───────────────────────┘
```

---

## 📂 Project Directory Structure

```
truemed/
├── backend/                             # Express.js REST API & ML Services
│   ├── controllers/
│   │   ├── authController.js            # User signup, login & profile
│   │   ├── medicineController.js        # Drug catalog search & monographs
│   │   ├── prescriptionController.js    # Prescriptions CRUD & OCR bridge
│   │   └── scanController.js            # Verification handler & scan logs
│   ├── middleware/
│   │   └── authMiddleware.js            # JWT protection & guest fallbacks
│   ├── ml/
│   │   ├── build_full_dataset.py        # Dataset curation script
│   │   ├── create_pill_dataset.py       # Roboflow pill dataset builder
│   │   ├── pill_cv_detector.py          # OpenCV shape, color & texture extraction
│   │   └── pill_dataset.json            # 605+ RxImage authentic drug records
│   ├── models/
│   │   ├── Medicine.js                  # Reference catalog schema
│   │   ├── Prescription.js              # Digital prescription schema
│   │   ├── ScanHistory.js               # Verification telemetry & ML audit logs
│   │   └── User.js                      # User profile & credentials schema
│   ├── routes/
│   │   ├── authRoutes.js                # /api/auth routes
│   │   ├── medicineRoutes.js            # /api/medicines routes
│   │   ├── prescriptionRoutes.js        # /api/prescriptions routes
│   │   └── scanRoutes.js                # /api/scan routes
│   ├── utils/
│   │   ├── geminiVisionClient.js        # Google Gemini multimodal vision client
│   │   ├── mlInference.js               # Multi-stage ML decision engine
│   │   ├── offlinePillOcr.js            # Local Tesseract debossed imprint OCR
│   │   ├── prescriptionOcrService.js    # Server-side prescription text extraction
│   │   └── roboflowClient.js            # Roboflow serverless workflow client
│   ├── test_smoke.js                    # Automated integration & smoke test
│   ├── server.js                        # Express server entry point
│   ├── .env                             # Environment secrets & endpoints
│   └── package.json
│
├── frontend/                            # React 19 + TypeScript + Vite Client
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomNav.tsx            # Floating mobile glassmorphic dock
│   │   │   └── Navbar.tsx               # Desktop clinical header & theme switcher
│   │   ├── context/
│   │   │   ├── AuthContext.tsx          # Auth state, tokens & saved drugs
│   │   │   └── ThemeContext.tsx         # Dark/Light system preference manager
│   │   ├── pages/
│   │   │   ├── HomeScreen.tsx           # Clinical dashboard, stats & dose tracker
│   │   │   ├── LoginScreen.tsx          # Sign-in with demo credential shortcuts
│   │   │   ├── PrescriptionScreen.tsx   # Prescription scanner, OCR & vault
│   │   │   ├── ProfileScreen.tsx        # User settings, saved pills & audit logs
│   │   │   ├── RegisterScreen.tsx       # Account creation & role selector
│   │   │   └── ScanScreen.tsx           # AI pill scanner, laser & monograph view
│   │   ├── services/
│   │   │   ├── api.ts                   # Unified REST API client with failover
│   │   │   └── prescriptionOcr.ts       # Client-side prescription parsing engine
│   │   ├── types/
│   │   │   └── index.ts                 # TypeScript interfaces
│   │   ├── utils/
│   │   │   └── samplePrescriptions.ts   # Synthetic test prescription generator
│   │   ├── App.tsx                      # Root component & navigation container
│   │   ├── index.css                    # TailwindCSS v4 design tokens
│   │   └── main.tsx                     # React DOM entry
│   ├── vite.config.ts
│   └── package.json
│
├── MEDICINE_IDENTIFICATION_ML_PLAN.md   # Detailed ML training architecture & strategy
├── truemed_app_summary.md               # Feature summary & visual verification audit
├── package.json                         # Root monorepo concurrent runner
└── README.md                            # Comprehensive project documentation
```

---

## 💻 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend Framework** | React 19, TypeScript, Vite 8 |
| **Styling & Design System** | TailwindCSS v4, CSS Variables, Glassmorphism, Dark/Light Themes |
| **Icons & Visual Effects** | Lucide React, Canvas Confetti |
| **Backend Framework** | Node.js, Express.js |
| **Database & ODM** | MongoDB Atlas, Mongoose 8 |
| **Authentication** | JSON Web Tokens (JWT), BCrypt.js |
| **Machine Learning** | Roboflow Serverless Inference, Google Gemini Vision (`gemini-3.5-flash-lite`) |
| **Computer Vision** | OpenCV (Python 3), NumPy |
| **OCR Engines** | Tesseract.js (Node.js & Browser Client-Side) |
| **DevOps & Tooling** | Concurrently, Oxlint |

---

## 📡 API Reference

All REST endpoints are prefixed with `/api`.

### 1. Health Check
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | Returns server health, app metadata, and database state | No |

### 2. Authentication
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new user (`name`, `email`, `password`, `role`) | No |
| `POST` | `/api/auth/login` | Login user and obtain JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile & saved medications | Yes (`Bearer <token>`) |

### 3. Pill Scan & Verification
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/scan/verify` | Submit image for multi-modal AI analysis | Optional (Guest/User) |
| `GET` | `/api/scan/history` | Retrieve user's historical scans & verification logs | Yes (`Bearer <token>`) |

#### Sample Verification Request Body (`POST /api/scan/verify`):
```json
{
  "imageBase64": "data:image/jpeg;base64,...",
  "batchNumber": "B-984210",
  "sampleTag": "paracetamol_500"
}
```

#### Sample Verification Response:
```json
{
  "success": true,
  "verdict": "IDENTIFIED",
  "confidence": 98.4,
  "matchQuality": "High Match Confidence",
  "medicine": {
    "name": "Paracetamol 500mg Tablets",
    "genericName": "Acetaminophen",
    "brandName": "Panadol",
    "imprintCode": "P 500",
    "shape": "Round",
    "color": "White",
    "dosage": "1-2 tablets every 4-6 hours (Max 4000mg/day)",
    "manufacturer": "GSK Healthcare",
    "activeIngredients": ["Acetaminophen 500mg"],
    "uses": ["Analgesic", "Fever reduction", "Mild to moderate pain relief"],
    "warnings": ["Do not exceed 4000mg in 24 hours. Avoid alcohol."]
  },
  "breakdown": {
    "imprintMatchScore": 96.4,
    "colorHistogramScore": 94.5,
    "shapeContourScore": 95.4,
    "visionEngine": "Roboflow ResNet-18 (Imprint read by Gemini Vision)"
  }
}
```

### 4. Drug Catalog & Monographs
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/medicines` | Query catalog by name, brand, or imprint (`?q=term`) | No |
| `GET` | `/api/medicines/:id` | Fetch full monograph for a specific medicine | No |
| `POST` | `/api/medicines/seed` | Seed database from `ml/pill_dataset.json` | No (Admin/Setup) |

### 5. Prescriptions & OCR
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/prescriptions/ocr` | Perform OCR text extraction on uploaded prescription image | No |
| `GET` | `/api/prescriptions` | Get user's saved prescriptions | Yes (`Bearer <token>`) |
| `POST` | `/api/prescriptions` | Save extracted or manually created prescription | Yes (`Bearer <token>`) |
| `DELETE` | `/api/prescriptions/:id` | Delete saved prescription record | Yes (`Bearer <token>`) |

---

## 🛠️ Prerequisites

Before getting started, ensure you have the following installed on your machine:
- **Node.js**: `v18.0.0` or higher (v20+ recommended)
- **npm**: `v9.0.0` or higher
- **Python**: `3.9+` (with `opencv-python` and `numpy` if running local visual feature extraction)
- **MongoDB Atlas** (or local MongoDB community instance)
- **Git**

---

## 🚀 Installation & Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Greeshma-Girish/truemed.git
cd truemed
```

### 2. Install Root & Subproject Dependencies
Install all packages across the root, backend, and frontend:
```bash
# Install root orchestration packages
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Backend Environment
Navigate to `backend/` and verify or create `.env`:
```bash
cd backend
cp .env.example .env   # Or edit existing .env
```
*(See the [Environment Configuration](#-environment-configuration) section below for key values).*

### 4. Install Python Computer Vision Requirements (Optional for OpenCV)
```bash
pip install opencv-python numpy
```

### 5. Run Backend & Frontend Concurrently
From the root project folder, run:
```bash
npm run dev
```

This single command boots:
- 🚀 **Backend Express API** on `http://localhost:5000` (auto-falls back to 5001 if 5000 is occupied).
- ⚡ **Frontend Vite Application** on `http://localhost:5173`.

Alternatively, run each service independently:
```bash
# In terminal 1 (Backend):
npm run dev:backend

# In terminal 2 (Frontend):
npm run dev:frontend
```

---

## ⚙️ Environment Configuration

Backend configuration lives in `backend/.env`:

| Key | Description | Example / Recommended |
|---|---|---|
| `PORT` | HTTP Server port | `5000` |
| `MONGODB_URI` | MongoDB Atlas SRV connection string | `mongodb+srv://<user>:<password>@cluster.mongodb.net/truemed?retryWrites=true&w=majority` |
| `JWT_SECRET` | Secret key used for signing JWT auth tokens | `truemed_sec_jwt_key_987654321_super_secure` |
| `PYTHON_PATH` | Path to Python 3 binary | `python` or `python3` |
| `ROBOFLOW_API_KEY` | Roboflow API key for model inference | `your_roboflow_key` |
| `GEMINI_API_KEY` | Google Gemini API key for multimodal vision & imprint parsing | `your_google_gemini_key` |
| `GEMINI_MODEL` | Gemini vision model identifier | `gemini-3.5-flash-lite` |

> **Note on Network Resiliency**: On Windows systems, DNS resolution of MongoDB SRV records can sometimes stall. TrueMed's `server.js` automatically configures reliable DNS fallback servers (`8.8.8.8`, `1.1.1.1`) and incorporates an in-memory monograph failover so the app functions even when offline.

---

## 🔬 Machine Learning & Computer Vision Details

### 1. Model Fusion Logic
Pill authentication presents unique challenges: counterfeit pills often mimic the base color and dimensions of authentic tablets while failing in **micro-embossing typography**, **binder grain density**, and **active chemical consistency**.

TrueMed tackles this via three parallel checks:
1. **Roboflow Workflow / ResNet-18**: Trained on pill images to classify standard catalog medications.
2. **Google Gemini Multimodal Vision**: Performs zero-shot recognition for commercial medicines outside the training set (e.g., *Dolo 650*, *Calpol 500*, *Crocin*, *Augmentin 625*), debossing inspection, and manufacturer logo recognition.
3. **OpenCV Subprocess (`pill_cv_detector.py`)**: Computes shape contours, circularity, aspect ratios, color channel histograms, and surface solidity to flag physical deformities.

### 2. Reference Pill Monograph Dataset
The platform ships with a pre-indexed dataset (`backend/ml/pill_dataset.json`) containing **605+ authentic pharmaceutical profiles** cross-referenced with the **U.S. National Library of Medicine (NLM) RxImage** database and global clinical registries.

---

## 📑 OCR Prescription Digitizer

TrueMed features dual-layer prescription processing:
1. **Browser-Side Ingestion**: Client-side OCR via `Tesseract.js` executes directly in the browser to reduce latency and protect sensitive health data.
2. **Server-Side Verification**: Fallback processing via `backend/utils/prescriptionOcrService.js` performs advanced normalization, noise filtering, and line grouping.
3. **Intelligent Drug Matching**:
   - Compares noisy OCR extractions (e.g., *"Augmentn 625"* or *"D0L0 650"*) against a clinical dictionary of Indian and international drugs.
   - Parses administration frequency: *OD* (Once Daily), *BD/BID* (Twice Daily), *TDS/TID* (Thrice Daily), *QID* (Four Times Daily), and *SOS* (As Needed).

---

## 🔑 Demo Credentials

For quick evaluation without manual registration, TrueMed provides instant demo roles on the login screen:

| Role | Email | Password | Access Highlights |
|---|---|---|---|
| **Patient** | `patient@truemed.health` | `TrueMed@2026` | Drug verification, personal prescriptions, dosage tracker |
| **Pharmacist** | `pharmacist@truemed.health` | `TrueMed@2026` | Batch inspection, counterfeit reporting, catalog lookup |
| **Doctor** | `doctor@truemed.health` | `TrueMed@2026` | Clinical monographs, prescription authoring, verification audit |

*(You can also click the quick **"Demo Patient"** or **"Demo Pharmacist"** fill buttons on the login screen for instant access).*

---

## 🧪 Testing & Smoke Suite

TrueMed includes an automated smoke test suite to validate the live Roboflow serverless workflow and the ML inference pipeline.

To run the verification test:
```bash
cd backend
npm run test:roboflow
```

The test validates:
- [x] Communication with the Roboflow serverless workflow.
- [x] Successful image transmission and feature extraction.
- [x] Verification verdict integrity (`IDENTIFIED`, `GENUINE`, `SUSPICIOUS`, or `COUNTERFEIT`).
- [x] Correct population of drug monograph and telemetry breakdown.

---

## ⚠️ Clinical Disclaimer & Safety

> **IMPORTANT MEDICAL NOTICE**:
> TrueMed is an assistive technological screening tool designed for educational, research, and counterfeit risk mitigation purposes. While TrueMed utilizes advanced computer vision, deep learning models, and official FDA/NIH RxImage monographs, algorithmic visual identification **must never substitute for professional medical advice, clinical diagnosis, laboratory chemical assay, or pharmacist consultation**.
> 
> If you suspect that a medication is counterfeit, contaminated, or causing adverse effects, stop consumption immediately and report the batch to your national drug regulatory body (e.g., FDA, CDSCO, EMA) or consult a licensed healthcare professional.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — feel free to use, modify, and build upon this platform for academic, commercial, or humanitarian healthcare initiatives.

---

<p align="center">
  Built with ❤️ for global drug safety and public healthcare transparency.
</p>
