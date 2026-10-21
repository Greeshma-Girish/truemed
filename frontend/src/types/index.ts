export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'patient' | 'pharmacist' | 'doctor' | 'admin';
  avatar?: string;
  token?: string;
}

export interface MedicineVariant {
  name?: string;
  manufacturer: string;
  shape: string;
  color: string;
  imprintCode: string;
  dosage: string;
  ndc11?: string;
}

export interface Medicine {
  _id?: string;
  id?: string;
  name: string;
  genericName: string;
  brandName: string;
  imprintCode: string;
  shape: string;
  color: string;
  activeIngredients: string[];
  uses: string[];
  dosage: string;
  sideEffects: string[];
  warnings: string[];
  manufacturer: string;
  authenticSecurityFeatures?: {
    hologramPattern?: string;
    serialPrefix?: string;
    standardWeightGrams?: number;
  };
  imageUrl?: string;
  isCounterfeitRiskAlert?: boolean;
  authenticVariants?: MedicineVariant[];
}

export interface AnalysisBreakdown {
  imprintMatchScore: number;
  colorHistogramScore: number;
  shapeContourScore: number;
  matchQuality?: string;
  imprintSource?: string;
  visionEngine?: string;
  geminiVision?: {
    active: boolean;
    model?: string;
    imprintDetected?: string;
    pillIdentified?: string;
    note?: string;
  };
  identificationNotes?: string[];
  hologramVerification?: string;
  activeCompoundStatus?: string;
  riskFactors?: string[];
  cvDiagnostics?: {
    detectedShape?: string;
    detectedColor?: string;
    aspectRatio?: number;
    surfaceSolidity?: number;
    surfaceSmoothness?: string;
  };
  roboflow?: {
    workflowId?: string;
    modelId?: string;
    inferenceId?: string;
    inferenceTimeMs?: number;
    topPrediction?: string;
    candidates?: Array<{ class: string; confidence: number; classId?: number }>;
  };
}

export interface ScanResult {
  scanId: string;
  verdict?: 'IDENTIFIED' | 'GENUINE' | 'SUSPICIOUS' | 'COUNTERFEIT' | string;
  status?: string;
  confidence: number;
  matchQuality?: string;
  medicine: Medicine;
  breakdown: AnalysisBreakdown;
  scannedAt?: string;
  scannedImage?: string;
  isOfflineFallback?: boolean;
  connectedPort?: number;
}

export interface PrescriptionItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  verifiedStatus?: 'Verified' | 'Pending Verification' | string;
}

export interface Prescription {
  _id: string;
  doctorName: string;
  clinicName: string;
  patientName: string;
  prescribedDate: string;
  medicines: PrescriptionItem[];
  notes?: string;
  prescriptionImage?: string;
}
