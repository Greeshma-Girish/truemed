import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import type { Prescription, PrescriptionItem } from '../types';
import { runPrescriptionOcr, type ExtractedPrescription } from '../services/prescriptionOcr';
import { SAMPLE_PRESETS, generateSamplePrescriptionImage } from '../utils/samplePrescriptions';
import {
  FileText, Upload, Sparkles, Copy, Check, Edit3,
  Save, Trash2, Plus, AlertTriangle,
  ChevronRight, X, Send, Stethoscope, CheckCircle2,
  Calendar, Building2, User, Clock, ShieldCheck, Info,
  Zap, RefreshCw, Layers, Eye, Activity, CheckCheck
} from 'lucide-react';


export const PrescriptionScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'scan' | 'saved'>('scan');

  // OCR Scanner State
  const [rxImage, setRxImage] = useState<string | null>(null);
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrStep, setOcrStep] = useState('');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [copiedRawText, setCopiedRawText] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Extracted Prescription State
  const [extractedData, setExtractedData] = useState<ExtractedPrescription | null>(null);

  // Saved Prescriptions List State
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    setLoadingPrescriptions(true);
    try {
      const data = await api.getPrescriptions();
      setPrescriptions(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrescriptions(false);
    }
  };

  // OCR Processing Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRxImage(reader.result as string);
        setSelectedPresetId(null);
        setExtractedData(null);
        setOcrError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRxImage(reader.result as string);
        setSelectedPresetId(null);
        setExtractedData(null);
        setOcrError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSampleRx = (presetId: string) => {
    setSelectedPresetId(presetId);
    setOcrError(null);
    setExtractedData(null);
    const dataUrl = generateSamplePrescriptionImage(presetId);
    setRxImage(dataUrl);
  };

  const runOcrExtraction = async () => {
    if (!rxImage) return;

    setOcrLoading(true);
    setOcrProgress(5);
    setOcrStep('Analyzing document structure & character lines...');
    setOcrError(null);


    try {
      const result = await runPrescriptionOcr(rxImage, (update) => {
        setOcrStep(update.stepDescription);
        setOcrProgress(Math.round(update.progress * 100));
      });

      setExtractedData(result);
    } catch (err: any) {
      console.error('OCR Extraction error:', err);
      setOcrError(err?.message || 'Optical recognition error. Please check your image or select a sample prescription.');
    } finally {
      setOcrLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (extractedData?.rawText) {
      navigator.clipboard.writeText(extractedData.rawText);
      setCopiedRawText(true);
      setTimeout(() => setCopiedRawText(false), 2000);
    }
  };

  const handleSavePrescription = async () => {
    if (!extractedData) return;

    try {
      const newRx = await api.createPrescription({
        doctorName: extractedData.doctorName,
        clinicName: extractedData.clinicName,
        patientName: extractedData.patientName,
        notes: extractedData.notes,
        medicines: extractedData.medicines,
        prescriptionImage: rxImage || undefined
      });

      setPrescriptions(prev => [newRx, ...prev]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const updateMedicineItem = (index: number, field: keyof PrescriptionItem, value: string) => {
    if (!extractedData) return;
    const updated = [...extractedData.medicines];
    updated[index] = { ...updated[index], [field]: value };
    setExtractedData({ ...extractedData, medicines: updated });
  };

  const removeMedicineItem = (index: number) => {
    if (!extractedData) return;
    const updated = extractedData.medicines.filter((_, i) => i !== index);
    setExtractedData({ ...extractedData, medicines: updated });
  };

  const addMedicineItem = () => {
    if (!extractedData) return;
    const newItem: PrescriptionItem = {
      name: 'New Medication',
      dosage: '100mg',
      frequency: 'Once Daily',
      duration: '5 Days',
      instructions: 'Take with food',
      verifiedStatus: 'Pending Verification'
    };
    setExtractedData({ ...extractedData, medicines: [...extractedData.medicines, newItem] });
  };



  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE5E3] dark:border-[#243633]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3]">
              Clinical Prescription Digitization
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
            Prescription Optical Character Recognition (OCR)
          </h1>
          <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
            Digitize doctor prescriptions using computer vision OCR, automatically extracting patient demographics, dosage regimens, and verifying against pharmaceutical monographs.
          </p>
        </div>

        {/* Tab Navigation Pill */}
        <div className="flex bg-[#F0F4F2] dark:bg-[#1D2C2A] p-1 rounded-2xl self-start sm:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'scan'
                ? 'bg-[#FFFFFF] dark:bg-[#192624] text-[#202B29] dark:text-[#EDF5F3] shadow-xs'
                : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
            }`}
          >
            Scan Prescription
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'saved'
                ? 'bg-[#FFFFFF] dark:bg-[#192624] text-[#202B29] dark:text-[#EDF5F3] shadow-xs'
                : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
            }`}
          >
            Saved Records ({prescriptions.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Prescription OCR Scanner */}
      {activeTab === 'scan' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Upload & Preview Area (5 cols on lg) */}
            <div className="lg:col-span-5 space-y-4">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative rounded-3xl border-2 transition-all p-5 text-center flex flex-col items-center justify-center min-h-[320px] overflow-hidden ${
                  isDragging
                    ? 'border-[#43978D] bg-[#E5F3F0]/50 dark:bg-[#162C29]/50'
                    : rxImage
                      ? 'border-[#DCE5E3] dark:border-[#243633] bg-[#FFFFFF] dark:bg-[#192624]'
                      : 'border-dashed border-[#DCE5E3] dark:border-[#243633] hover:border-[#43978D]/60 bg-[#FFFFFF] dark:bg-[#192624]'
                }`}
              >
                {rxImage ? (
                  <div className="relative w-full h-full max-h-[350px] rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-black/5 dark:bg-black/30 p-2">
                    <img
                      src={rxImage}
                      alt="Prescription scan document"
                      className="max-h-[310px] w-auto max-w-full object-contain rounded-xl shadow-xs"
                    />
                    {!ocrLoading && (
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          onClick={() => { setRxImage(null); setSelectedPresetId(null); setExtractedData(null); }}
                          className="px-2.5 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[11px] font-semibold backdrop-blur-md transition-colors"
                        >
                          Change Slip
                        </button>
                      </div>
                    )}
                    {selectedPresetId && (
                      <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-md bg-[#31786F]/90 text-white text-[10px] font-mono font-bold backdrop-blur-sm">
                        High-Resolution Document Slip
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 py-6">
                    <div className="w-14 h-14 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] border border-[#43978D]/25 flex items-center justify-center mx-auto shadow-xs">
                      <FileText className="w-7 h-7 stroke-[1.9]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3]">
                        Upload Prescription Slip or Photo
                      </h3>
                      <p className="text-xs text-[#586B67] dark:text-[#91A7A2] mt-0.5 max-w-xs mx-auto">
                        Drag and drop your clinic slip, paper Rx photo, or camera capture for real optical character recognition
                      </p>
                    </div>
                    <div className="pt-2 flex items-center justify-center gap-2">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-[#43978D] hover:bg-[#31786F] text-white text-xs font-bold shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Browse Files</span>
                      </button>
                    </div>
                  </div>
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  className="hidden"
                />
              </div>

              {/* Sample Presets for Testing Real OCR */}
              <div className="rounded-2xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-4 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#586B67] dark:text-[#91A7A2] block">
                    Authentic Clinical Prescriptions for OCR:
                  </span>
                  <span className="text-[10px] text-[#43978D] font-mono font-bold">3 Presets Available</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => selectSampleRx(preset.id)}
                      className={`p-2.5 rounded-xl text-left transition-all border ${
                        selectedPresetId === preset.id
                          ? 'border-[#43978D] bg-[#E5F3F0] dark:bg-[#162C29]'
                          : 'border-transparent bg-[#F0F4F2] dark:bg-[#1D2C2A] hover:bg-[#E5F3F0]/60 dark:hover:bg-[#162C29]/60'
                      }`}
                    >
                      <p className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] truncate">{preset.title}</p>
                      <p className="text-[10px] text-[#7D938F] truncate">{preset.subtitle}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button: Extract Prescription Details */}
              {rxImage && !ocrLoading && !extractedData && (
                <button
                  onClick={runOcrExtraction}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#43978D] hover:bg-[#31786F] text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.99] group"
                >
                  <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                  <span>Extract Prescription Data & Regimen</span>
                </button>
              )}

              {/* OCR Error Alert */}
              {ocrError && (
                <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Prescription Scan Notice</p>
                    <p className="mt-0.5 text-[11px] opacity-90">{ocrError}</p>
                  </div>
                </div>
              )}

              {/* OCR Loading Stepper with Dynamic Progress Bar */}
              {ocrLoading && (
                <div className="p-5 rounded-2xl bg-[#E5F3F0]/80 dark:bg-[#162C29]/80 border border-[#43978D]/30 space-y-3 animate-fadeIn shadow-xs">
                  <div className="flex items-center justify-between text-xs font-bold text-[#31786F] dark:text-[#EDF5F3]">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin text-[#43978D]" />
                      <span>Digitizing Prescription Document...</span>
                    </div>
                    <span className="font-mono text-[#43978D]">{ocrProgress}%</span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-[#DCE5E3] dark:bg-[#243633] overflow-hidden">
                    <div
                      className="h-full bg-[#43978D] transition-all duration-300 rounded-full"
                      style={{ width: `${Math.max(5, ocrProgress)}%` }}
                    />
                  </div>

                  <p className="text-xs font-mono text-[#586B67] dark:text-[#91A7A2]">{ocrStep}</p>

                  <div className="pt-1 flex items-center justify-between text-[10px] text-[#7D938F]">
                    <span>Precision Clinical Text Extraction</span>
                    <span>Contrast Enhanced</span>
                  </div>

                </div>
              )}
            </div>

            {/* Right: Structured Prescription Document & Raw OCR (7 cols on lg) */}
            <div className="lg:col-span-7 space-y-4">
              {!extractedData && !ocrLoading && (
                <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-dashed border-[#DCE5E3] dark:border-[#243633] p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#F0F4F2] dark:bg-[#1D2C2A] text-[#7D938F] flex items-center justify-center mx-auto">
                    <FileText className="w-6 h-6 stroke-[1.8]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3]">
                    Ready for Prescription Analysis
                  </h3>
                  <p className="text-xs text-[#586B67] dark:text-[#91A7A2] max-w-sm mx-auto">
                    Select an authentic clinic prescription preset or upload any custom photo. TrueMed will automatically analyze the document to extract doctor details, prescribed medicines, and dosage schedules.
                  </p>
                </div>
              )}

              {extractedData && (
                <div className="space-y-4 animate-fadeIn">
                  {/* OCR Recognition Performance Badge Bar */}
                  <div className="p-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] flex flex-wrap items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {extractedData.confidence}% OCR Precision
                      </span>
                      {extractedData.processingTimeMs > 0 && (
                        <span className="text-[11px] font-mono text-[#586B67] dark:text-[#91A7A2]">
                          Latency: {extractedData.processingTimeMs}ms
                        </span>
                      )}
                      <span className="text-[11px] font-mono text-[#7D938F] hidden sm:inline">
                        {extractedData.wordCount} words detected
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={runOcrExtraction}
                        className="px-2.5 py-1 rounded-lg bg-[#F0F4F2] dark:bg-[#1D2C2A] hover:bg-[#E5F3F0] text-xs font-semibold text-[#31786F] dark:text-[#EDF5F3] flex items-center gap-1 transition-colors"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Re-Scan Slip</span>
                      </button>
                    </div>
                  </div>

                  {/* Save Success Banner */}
                  {saveSuccess && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200 animate-fadeIn">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Prescription successfully saved to your digital records vault!</span>
                    </div>
                  )}

                  {/* Prescription Document Container */}
                  <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-5">
                    {/* Prescription Document Header */}
                    <div className="flex items-start justify-between pb-4 border-b border-[#DCE5E3] dark:border-[#243633]">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] font-serif font-black text-2xl flex items-center justify-center shrink-0 border border-[#43978D]/25">
                          ℞
                        </div>
                        <div>
                          {isEditing ? (
                            <input
                              type="text"
                              value={extractedData.doctorName}
                              onChange={(e) => setExtractedData({ ...extractedData, doctorName: e.target.value })}
                              className="text-base font-extrabold text-[#202B29] dark:text-[#EDF5F3] bg-[#F0F4F2] dark:bg-[#1D2C2A] px-2 py-1 rounded-lg border border-[#DCE5E3] dark:border-[#243633]"
                            />
                          ) : (
                            <h2 className="text-base font-extrabold text-[#202B29] dark:text-[#EDF5F3] flex items-center gap-1.5">
                              <span>{extractedData.doctorName}</span>
                              <Stethoscope className="w-4 h-4 text-[#43978D]" />
                            </h2>
                          )}
                          {isEditing ? (
                            <input
                              type="text"
                              value={extractedData.clinicName}
                              onChange={(e) => setExtractedData({ ...extractedData, clinicName: e.target.value })}
                              className="text-xs text-[#586B67] dark:text-[#91A7A2] bg-[#F0F4F2] dark:bg-[#1D2C2A] px-2 py-0.5 rounded-lg border border-[#DCE5E3] dark:border-[#243633] mt-1"
                            />
                          ) : (
                            <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">{extractedData.clinicName}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsEditing(!isEditing)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                            isEditing
                              ? 'bg-[#43978D] text-white shadow-xs'
                              : 'bg-black/5 dark:bg-white/5 text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29]'
                          }`}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{isEditing ? 'Done Editing' : 'Edit Fields'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Patient & Date Meta */}
                    <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-[#F0F4F2]/60 dark:bg-[#1D2C2A]/60 text-xs">
                      <div>
                        <span className="text-[10px] text-[#7D938F] dark:text-[#677E79] block">Patient</span>
                        <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{extractedData.patientName}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#7D938F] dark:text-[#677E79] block">Prescribed Date</span>
                        <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{extractedData.date}</span>
                      </div>
                    </div>

                    {/* Structured Medicines Table */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#586B67] dark:text-[#91A7A2]">
                          Prescribed Medication Items ({extractedData.medicines.length})
                        </span>
                        {isEditing && (
                          <button
                            onClick={addMedicineItem}
                            className="text-xs font-bold text-[#43978D] flex items-center gap-1 hover:underline"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Medicine</span>
                          </button>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        {extractedData.medicines.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-2xl border border-[#DCE5E3] dark:border-[#243633] bg-[#FFFFFF] dark:bg-[#192624] space-y-2 shadow-xs"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                {isEditing ? (
                                  <div className="flex gap-2 mb-2">
                                    <input
                                      type="text"
                                      value={med.name}
                                      onChange={(e) => updateMedicineItem(idx, 'name', e.target.value)}
                                      placeholder="Medicine Name"
                                      className="flex-1 text-xs font-bold bg-[#F0F4F2] dark:bg-[#1D2C2A] p-2 rounded-lg border border-[#DCE5E3] dark:border-[#243633]"
                                    />
                                    <input
                                      type="text"
                                      value={med.dosage}
                                      onChange={(e) => updateMedicineItem(idx, 'dosage', e.target.value)}
                                      placeholder="Dosage"
                                      className="w-24 text-xs font-mono font-bold bg-[#F0F4F2] dark:bg-[#1D2C2A] p-2 rounded-lg border border-[#DCE5E3] dark:border-[#243633]"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-extrabold text-[#202B29] dark:text-[#EDF5F3]">
                                      {med.name}
                                    </span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] font-bold">
                                      {med.dosage}
                                    </span>
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                                      {med.verifiedStatus}
                                    </span>
                                  </div>
                                )}

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-[#586B67] dark:text-[#91A7A2] mt-1">
                                  {isEditing ? (
                                    <>
                                      <input
                                        type="text"
                                        value={med.frequency}
                                        onChange={(e) => updateMedicineItem(idx, 'frequency', e.target.value)}
                                        placeholder="Frequency"
                                        className="bg-[#F0F4F2] dark:bg-[#1D2C2A] p-1.5 rounded-lg border border-[#DCE5E3] dark:border-[#243633]"
                                      />
                                      <input
                                        type="text"
                                        value={med.duration}
                                        onChange={(e) => updateMedicineItem(idx, 'duration', e.target.value)}
                                        placeholder="Duration"
                                        className="bg-[#F0F4F2] dark:bg-[#1D2C2A] p-1.5 rounded-lg border border-[#DCE5E3] dark:border-[#243633]"
                                      />
                                    </>
                                  ) : (
                                    <>
                                      <span><strong>Frequency:</strong> {med.frequency}</span>
                                      <span><strong>Duration:</strong> {med.duration}</span>
                                    </>
                                  )}
                                </div>

                                <div className="text-[11px] text-[#586B67] dark:text-[#91A7A2] mt-1.5">
                                  {isEditing ? (
                                    <input
                                      type="text"
                                      value={med.instructions}
                                      onChange={(e) => updateMedicineItem(idx, 'instructions', e.target.value)}
                                      placeholder="Instructions"
                                      className="w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] p-1.5 rounded-lg border border-[#DCE5E3] dark:border-[#243633]"
                                    />
                                  ) : (
                                    <p className="p-2 rounded-xl bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50">
                                      <strong>Instructions:</strong> {med.instructions}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {isEditing && (
                                <button
                                  onClick={() => removeMedicineItem(idx)}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Prescriber Notes */}
                    <div className="pt-3 border-t border-[#DCE5E3] dark:border-[#243633]">
                      <span className="text-[10px] text-[#7D938F] dark:text-[#677E79] font-bold uppercase tracking-wider block mb-1">
                        Physician Clinical Instructions & Diagnostics:
                      </span>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={extractedData.notes}
                          onChange={(e) => setExtractedData({ ...extractedData, notes: e.target.value })}
                          className="w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] p-2.5 rounded-xl border border-[#DCE5E3] dark:border-[#243633] text-xs"
                        />
                      ) : (
                        <p className="text-xs text-[#586B67] dark:text-[#91A7A2] leading-relaxed">
                          {extractedData.notes}
                        </p>
                      )}
                    </div>

                    {/* Save to Digital Records Action */}
                    <button
                      onClick={handleSavePrescription}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#43978D] hover:bg-[#31786F] text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Prescription to My Records</span>
                    </button>
                  </div>

                  {/* Raw OCR Extracted Text Monospace Panel */}
                  <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-5 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] flex items-center gap-2">
                        <FileText className="w-3.5 h-3.5 text-[#43978D]" />
                        Raw Optical Character Transcript (OCR)
                      </span>
                      <button
                        onClick={copyToClipboard}
                        className="px-3 py-1 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-semibold text-[#586B67] dark:text-[#91A7A2] flex items-center gap-1.5 transition-colors"
                      >
                        {copiedRawText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedRawText ? 'Copied!' : 'Copy Transcript'}</span>
                      </button>
                    </div>

                    <pre className="p-3.5 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70 font-mono text-[11px] text-[#586B67] dark:text-[#91A7A2] overflow-x-auto whitespace-pre-wrap leading-relaxed border border-[#DCE5E3]/60 dark:border-[#243633]/60">
                      {extractedData.rawText}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Saved Prescriptions */}
      {activeTab === 'saved' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3]">
              Digital Prescriptions Vault
            </h3>
            <span className="text-xs text-[#586B67] dark:text-[#91A7A2]">
              {prescriptions.length} Records On File
            </span>
          </div>

          {loadingPrescriptions ? (
            <div className="text-center py-12">
              <div className="w-6 h-6 border-2 border-[#43978D] border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          ) : prescriptions.length === 0 ? (
            <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-8 text-center space-y-2">
              <FileText className="w-8 h-8 text-[#7D938F] mx-auto opacity-40" />
              <p className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">No Prescriptions Saved Yet</p>
              <p className="text-[11px] text-[#7D938F]">Scan a prescription slip in the Scan tab to archive it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div
                  key={rx._id}
                  className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-5 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] flex items-center justify-center font-serif text-xl font-bold">
                          ℞
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-[#202B29] dark:text-[#EDF5F3]">
                            {rx.doctorName}
                          </h4>
                          <p className="text-[11px] text-[#586B67] dark:text-[#91A7A2]">{rx.clinicName}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                        Verified Rx
                      </span>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-[#DCE5E3] dark:border-[#243633]">
                      {rx.medicines?.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-2.5 rounded-xl bg-[#F0F4F2]/60 dark:bg-[#1D2C2A]/60 flex items-center justify-between text-xs"
                        >
                          <div>
                            <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{m.name}</span>
                            <span className="text-[10px] text-[#7D938F] block">{m.frequency} • {m.duration}</span>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] font-mono text-[#43978D] font-bold">
                            {m.dosage}
                          </span>
                        </div>
                      ))}
                    </div>

                    {rx.notes && (
                      <p className="text-[11px] text-[#7D938F] dark:text-[#677E79] italic">
                        "{rx.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-[#DCE5E3] dark:border-[#243633] flex items-center justify-between text-[11px] text-[#7D938F]">
                    <span>Patient: {rx.patientName}</span>
                    <span>{new Date(rx.prescribedDate).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      


    </div>
  );
};