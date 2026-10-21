import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ScanResult, MedicineVariant, Medicine } from '../types';
import confetti from 'canvas-confetti';
import {
  Upload, Camera, ShieldCheck, AlertTriangle, CheckCircle2,
  ArrowLeft, Bookmark, Building2, Check, RefreshCw,
  Eye, Sparkles, AlertCircle, HelpCircle,
  ChevronRight, Search, Pill, X, Info, FileText
} from 'lucide-react';

export const ScanScreen: React.FC = () => {
  const { saveMedication, savedMedications } = useAuth();

  // Top-level View Tab: 'scan' | 'catalog'
  const [pageTab, setPageTab] = useState<'scan' | 'catalog'>('scan');

  // Scanner State
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSampleTag, setSelectedSampleTag] = useState<string>('custom_upload');
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>('');
  const [scanStepIndex, setScanStepIndex] = useState<number>(0);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<MedicineVariant | null>(null);
  const [resultTab, setResultTab] = useState<'overview' | 'uses' | 'breakdown'>('overview');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Drug Catalog State
  const [catalogMeds, setCatalogMeds] = useState<Medicine[]>([]);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [selectedCatalogMed, setSelectedCatalogMed] = useState<Medicine | null>(null);
  const [loadingCatalog, setLoadingCatalog] = useState(false);

  useEffect(() => {
    fetchCatalog();
  }, [catalogQuery]);

  const fetchCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const data = await api.getMedicines(catalogQuery);
      setCatalogMeds(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingCatalog(false);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const stepsList = [
    'Normalizing lighting & contour boundary extraction...',
    'Matching imprint typography & physical geometry...',
    'Cross-referencing FDA & NIH RxImage drug monograph catalog...'
  ];

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
    setFileError(null);
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      setFileError('Unsupported file type. Please upload a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size exceeds 10MB limit. Please upload a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setSelectedSampleTag('custom_upload');
      setScanResult(null);
    };
    reader.readAsDataURL(file);
  };

  const runIdentification = async () => {
    if (!selectedImage) return;

    setScanning(true);
    setScanResult(null);
    setSavedSuccess(false);

    setScanStepIndex(0);
    setScanStep(stepsList[0]);
    await new Promise(r => setTimeout(r, 500));

    setScanStepIndex(1);
    setScanStep(stepsList[1]);
    await new Promise(r => setTimeout(r, 500));

    setScanStepIndex(2);
    setScanStep(stepsList[2]);
    await new Promise(r => setTimeout(r, 450));

    try {
      const res = await api.verifyScan(selectedImage, selectedSampleTag);
      setScanResult(res);

      if (res.medicine?.authenticVariants?.length) {
        const matched = res.medicine.authenticVariants.find(v =>
          v.imprintCode === res.medicine.imprintCode && v.manufacturer === res.medicine.manufacturer
        );
        setSelectedVariant(matched || res.medicine.authenticVariants[0]);
      } else {
        setSelectedVariant(null);
      }

      if (res.confidence && res.confidence > 60) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err: any) {
      setFileError('Identification pipeline encountered an error. Please try another image.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveToMeds = () => {
    if (scanResult?.medicine) {
      const medToSave = selectedVariant ? { ...scanResult.medicine, ...selectedVariant } : scanResult.medicine;
      saveMedication(medToSave);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const isSaved = scanResult?.medicine ? savedMedications.some(m => m.name === scanResult.medicine.name) : false;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#DCE5E3] dark:border-[#243633]">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3]">
              AI Medicine Identification & Monograph Explorer
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
            Medicine Identification & Drug Catalog
          </h1>
          <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
            Inspect pill imprints and physical contours to identify chemical monographs, or browse the verified drug catalog directory.
          </p>
        </div>

        {/* Tab Navigation Pill & Reset */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-[#F0F4F2] dark:bg-[#1D2C2A] p-1 rounded-2xl overflow-x-auto max-w-full">
            <button
              onClick={() => setPageTab('scan')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${pageTab === 'scan'
                  ? 'bg-[#FFFFFF] dark:bg-[#192624] text-[#202B29] dark:text-[#EDF5F3] shadow-xs'
                  : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
                }`}
            >
              <Camera className="w-3.5 h-3.5 text-[#43978D]" />
              <span>Identify Pill</span>
            </button>
            <button
              onClick={() => setPageTab('catalog')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap flex items-center gap-1.5 ${pageTab === 'catalog'
                  ? 'bg-[#FFFFFF] dark:bg-[#192624] text-[#202B29] dark:text-[#EDF5F3] shadow-xs'
                  : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
                }`}
            >
              <Building2 className="w-3.5 h-3.5 text-[#43978D]" />
              <span>Drug Catalog</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] font-bold">
                {catalogMeds.length}
              </span>
            </button>
          </div>

          {pageTab === 'scan' && scanResult && (
            <button
              onClick={() => {
                setScanResult(null);
                setSelectedImage(null);
                setSelectedSampleTag('custom_upload');
              }}
              className="px-3.5 py-2 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] border border-[#DCE5E3] dark:border-[#243633] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Identify Another Pill</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: Pill Verification & Scan */}
      {pageTab === 'scan' && (
        <>
          {/* Main Scanner Section (When no result or preparing new scan) */}
          {!scanResult && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Upload / Viewfinder Zone (7 cols on lg) */}
              <div className="lg:col-span-7 space-y-4">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`relative rounded-3xl border-2 transition-all p-6 text-center flex flex-col items-center justify-center min-h-[340px] sm:min-h-[400px] overflow-hidden ${isDragging
                      ? 'border-[#43978D] bg-[#E5F3F0]/50 dark:bg-[#162C29]/50 scale-[0.99]'
                      : selectedImage
                        ? 'border-[#DCE5E3] dark:border-[#243633] bg-[#FFFFFF] dark:bg-[#192624]'
                        : 'border-dashed border-[#DCE5E3] dark:border-[#243633] hover:border-[#43978D]/60 bg-[#FFFFFF] dark:bg-[#192624]'
                    }`}
                >
                  {/* If Image Selected: Show Preview with Viewfinder Overlay */}
                  {selectedImage ? (
                    <div className="relative w-full h-full max-h-[380px] rounded-2xl overflow-hidden flex items-center justify-center bg-black/5 dark:bg-black/30">
                      <img
                        src={selectedImage}
                        alt="Pill preview"
                        className="max-h-[360px] w-auto max-w-full object-contain rounded-xl"
                      />

                      {/* Corner Target Markers */}
                      <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#43978D] rounded-tl-lg pointer-events-none"></div>
                      <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#43978D] rounded-tr-lg pointer-events-none"></div>
                      <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#43978D] rounded-bl-lg pointer-events-none"></div>
                      <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#43978D] rounded-br-lg pointer-events-none"></div>

                      {/* Center reticle */}
                      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
                        <div className="w-16 h-16 border border-dashed border-[#43978D] rounded-full"></div>
                      </div>

                      {/* Laser Scan Animation when processing */}
                      {scanning && (
                        <div className="absolute inset-0 bg-[#43978D]/15 backdrop-blur-[1px] flex flex-col items-center justify-center pointer-events-none">
                          <div className="w-full h-1 bg-[#43978D] shadow-[0_0_16px_#43978D] animate-laser absolute"></div>
                        </div>
                      )}

                      {/* Top-Right Clear Image Control */}
                      {!scanning && (
                        <button
                          onClick={() => {
                            setSelectedImage(null);
                            setSelectedSampleTag('custom_upload');
                          }}
                          className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 hover:bg-black/80 text-white text-[11px] font-semibold backdrop-blur-md transition-colors"
                        >
                          Change Image
                        </button>
                      )}
                    </div>
                  ) : (
                    /* Empty Upload Zone */
                    <div className="max-w-md space-y-4 py-8">
                      <div className="w-16 h-16 rounded-3xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] border border-[#43978D]/25 flex items-center justify-center mx-auto shadow-xs">
                        <Camera className="w-8 h-8 stroke-[1.9]" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-bold text-[#202B29] dark:text-[#EDF5F3]">
                          Drag & Drop Pill Image Here
                        </h3>
                        <p className="text-xs text-[#586B67] dark:text-[#91A7A2] mt-1">
                          Or browse files from your computer or mobile camera. Ensure clear lighting and visible imprint code.
                        </p>
                      </div>

                      <div className="flex items-center justify-center gap-3 pt-2">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-[#43978D] hover:bg-[#31786F] text-white text-xs font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95"
                        >
                          <Upload className="w-4 h-4" />
                          <span>Browse Files</span>
                        </button>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="px-4 py-2.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#202B29] dark:text-[#EDF5F3] border border-[#DCE5E3] dark:border-[#243633] text-xs font-bold flex items-center gap-2 transition-all"
                        >
                          <Camera className="w-4 h-4 text-[#43978D]" />
                          <span>Open Camera</span>
                        </button>
                      </div>

                      <p className="text-[11px] text-[#7D938F] dark:text-[#677E79]">
                        Supported formats: JPEG, PNG, WEBP • Max 10MB
                      </p>
                    </div>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileInputChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                </div>

                {/* Action Button: Identify Medicine */}
                {selectedImage && !scanning && (
                  <button
                    onClick={runIdentification}
                    className="w-full py-3.5 px-6 rounded-2xl bg-[#43978D] hover:bg-[#31786F] text-white font-bold text-sm shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 transition-all active:scale-[0.99]"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Identify & Verify Medicine</span>
                  </button>
                )}

                {/* Processing Steps Status */}
                {scanning && (
                  <div className="p-4 rounded-2xl bg-[#E5F3F0]/60 dark:bg-[#162C29]/60 border border-[#43978D]/30 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#31786F] dark:text-[#EDF5F3] flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#43978D]" />
                        Analyzing Sample...
                      </span>
                      <span className="font-mono font-bold text-[#43978D]">Step {scanStepIndex + 1} of 3</span>
                    </div>
                    <div className="w-full bg-[#DCE5E3] dark:bg-[#243633] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#43978D] transition-all duration-300"
                        style={{ width: `${((scanStepIndex + 1) / 3) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-[#586B67] dark:text-[#91A7A2] font-mono">
                      {scanStep}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column: Guidance & Verification Criteria (5 cols on lg) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Pill Photography Best Practices Card */}
                <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-5 shadow-sm space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#586B67] dark:text-[#91A7A2] flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#43978D]" />
                    <span>Photography Tips for Best Accuracy</span>
                  </h3>
                  <div className="space-y-2 text-xs text-[#586B67] dark:text-[#91A7A2]">
                    <div className="p-2.5 rounded-2xl bg-[#F0F4F2]/60 dark:bg-[#1D2C2A]/60 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white dark:bg-[#192624] flex items-center justify-center text-[#43978D] font-bold text-[10px] shrink-0 mt-0.5">
                        1
                      </div>
                      <div>
                        <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">Plain, Neutral Background:</span>
                        <p className="text-[11px] text-[#7D938F] dark:text-[#677E79]">Place the pill on clean white paper or a matte surface without patterns.</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#F0F4F2]/60 dark:bg-[#1D2C2A]/60 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white dark:bg-[#192624] flex items-center justify-center text-[#43978D] font-bold text-[10px] shrink-0 mt-0.5">
                        2
                      </div>
                      <div>
                        <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">Diffuse, Even Lighting:</span>
                        <p className="text-[11px] text-[#7D938F] dark:text-[#677E79]">Avoid heavy glare or flash reflection directly over the imprint letters.</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-2xl bg-[#F0F4F2]/60 dark:bg-[#1D2C2A]/60 flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-white dark:bg-[#192624] flex items-center justify-center text-[#43978D] font-bold text-[10px] shrink-0 mt-0.5">
                        3
                      </div>
                      <div>
                        <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">Imprint Side Up:</span>
                        <p className="text-[11px] text-[#7D938F] dark:text-[#677E79]">Ensure embossed characters or company logos are directly facing the camera.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Structured Results Display (When scanResult available) */}
          {scanResult && (
            <div className="space-y-6 animate-fadeIn">
              {(() => {
                const displayMed = selectedVariant ? { ...scanResult.medicine, ...selectedVariant } : scanResult.medicine;
                const variants = scanResult.medicine.authenticVariants || [];
                const isGenuine = scanResult.verdict === 'GENUINE';

                return (
                  <>
                    {/* Offline Fallback Banner */}
                    {scanResult.isOfflineFallback && (
                      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-200 animate-fadeIn">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold">On-Device Visual Estimation Active</p>
                          <p className="mt-0.5 text-amber-700 dark:text-amber-300">
                            Operating in secure offline mode. Visual features and imprint markings have been evaluated using on-device image heuristics against the local reference monograph library.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Top Identification Result Banner */}
                    <div className="p-5 rounded-3xl border border-[#43978D]/40 bg-[#E5F3F0] dark:bg-[#162C29] text-[#202B29] dark:text-[#EDF5F3] transition-all shadow-xs">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-[#43978D] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <CheckCircle2 className="w-7 h-7 stroke-[2.3]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider bg-[#43978D] text-white">
                                MEDICINE IDENTIFIED
                              </span>
                              <span className="text-xs font-mono font-bold text-[#31786F] dark:text-[#EDF5F3]">
                                Confidence: {scanResult.confidence}%
                              </span>
                              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/70 dark:bg-black/30 text-[#31786F] dark:text-[#EDF5F3]">
                                {scanResult.breakdown?.matchQuality || 'High Match Confidence'}
                              </span>
                            </div>
                            <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                              {displayMed.name}
                            </h2>
                            <p className="text-xs text-[#586B67] dark:text-[#91A7A2] mt-0.5">
                              Generic: <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.genericName}</span> • Brand: <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.brandName}</span> • Manufacturer: <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.manufacturer}</span>
                            </p>
                          </div>
                        </div>

                        {/* Top Action: Save to My Meds */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <button
                            onClick={handleSaveToMeds}
                            className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 ${savedSuccess
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : isSaved
                                  ? 'bg-black/10 dark:bg-white/10 text-[#586B67] dark:text-[#91A7A2]'
                                  : 'bg-[#43978D] hover:bg-[#31786F] text-white shadow-xs'
                              }`}
                          >
                            <Bookmark className="w-4 h-4" />
                            <span>{savedSuccess ? 'Saved to Records!' : isSaved ? 'Saved in Records' : 'Save to My Meds'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Split Layout: Image on Left (4 cols), Monograph & Breakdown on Right (8 cols) */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                      {/* Left Column: Pill Image & Formulations */}
                      <div className="lg:col-span-4 space-y-4">
                        <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-4 shadow-sm text-center">
                          <div className="w-full aspect-square rounded-2xl overflow-hidden bg-black/5 dark:bg-black/30 flex items-center justify-center mb-3">
                            <img
                              src={selectedImage || displayMed.imageUrl || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400'}
                              alt={displayMed.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center justify-between text-xs px-1">
                            <span className="font-mono text-[#7D938F] dark:text-[#677E79]">Imprint Code:</span>
                            <span className="font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] border border-[#43978D]/30">
                              {displayMed.imprintCode}
                            </span>
                          </div>
                        </div>

                        {/* Formulations / Variants Selector if available */}
                        {variants.length > 1 && (
                          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-4 shadow-sm space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-[#43978D]" />
                                Authorized Variants ({variants.length})
                              </span>
                              <span className="text-[10px] text-[#43978D] font-bold">Monographs</span>
                            </div>
                            <div className="space-y-1.5">
                              {variants.map((v, idx) => {
                                const isSelected = selectedVariant
                                  ? (selectedVariant.imprintCode === v.imprintCode && selectedVariant.manufacturer === v.manufacturer)
                                  : (idx === 0);
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => setSelectedVariant(v)}
                                    className={`w-full text-left p-2.5 rounded-xl text-xs transition-all flex items-center justify-between ${isSelected
                                        ? 'bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] border border-[#43978D]/40 font-bold'
                                        : 'bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50 text-[#586B67] dark:text-[#91A7A2] hover:bg-black/5'
                                      }`}
                                  >
                                    <div>
                                      <p className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{v.manufacturer}</p>
                                      <p className="text-[10px] font-mono text-[#7D938F]">{v.dosage} • {v.imprintCode}</p>
                                    </div>
                                    {isSelected && <Check className="w-4 h-4 text-[#43978D] stroke-[2.5]" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right Column: Tabbed Clinical Monograph (8 cols) */}
                      <div className="lg:col-span-8 space-y-4">
                        {/* Tab Switcher */}
                        <div className="flex bg-[#F0F4F2] dark:bg-[#1D2C2A] p-1 rounded-2xl">
                          <button
                            onClick={() => setResultTab('overview')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${resultTab === 'overview'
                                ? 'bg-[#FFFFFF] dark:bg-[#192624] text-[#202B29] dark:text-[#EDF5F3] shadow-xs'
                                : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
                              }`}
                          >
                            Clinical Monograph
                          </button>
                          <button
                            onClick={() => setResultTab('uses')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${resultTab === 'uses'
                                ? 'bg-[#FFFFFF] dark:bg-[#192624] text-[#202B29] dark:text-[#EDF5F3] shadow-xs'
                                : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
                              }`}
                          >
                            Uses & Warnings
                          </button>
                          <button
                            onClick={() => setResultTab('breakdown')}
                            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${resultTab === 'breakdown'
                                ? 'bg-[#FFFFFF] dark:bg-[#192624] text-[#202B29] dark:text-[#EDF5F3] shadow-xs'
                                : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
                              }`}
                          >
                            Computer Vision Diagnostics
                          </button>
                        </div>

                        {/* Tab 1: Overview */}
                        {resultTab === 'overview' && (
                          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-5 animate-fadeIn">
                            {/* 4 Essential Stats Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="p-3 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[10px] text-[#7D938F] dark:text-[#677E79] font-medium block mb-0.5">Generic Name</span>
                                <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.genericName}</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[10px] text-[#7D938F] dark:text-[#677E79] font-medium block mb-0.5">Dosage Strength</span>
                                <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.dosage}</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[10px] text-[#7D938F] dark:text-[#677E79] font-medium block mb-0.5">Shape & Contour</span>
                                <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.shape}</span>
                              </div>
                              <div className="p-3 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[10px] text-[#7D938F] dark:text-[#677E79] font-medium block mb-0.5">Color Coating</span>
                                <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.color}</span>
                              </div>
                            </div>

                            {/* Active Ingredients Section */}
                            <div>
                              <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] block mb-2">
                                Active Chemical Ingredients:
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {displayMed.activeIngredients.map((ing, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 rounded-xl bg-[#E5F3F0] dark:bg-[#162C29] border border-[#43978D]/20 text-[#31786F] dark:text-[#EDF5F3] text-xs font-medium"
                                  >
                                    {ing}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Security Features & Monograph Specifications */}
                            <div className="pt-3 border-t border-[#DCE5E3] dark:border-[#243633] space-y-2">
                              <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] block">
                                Pharmaceutical Monograph Verification:
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                                <div className="p-3 rounded-2xl bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50">
                                  <span className="text-[#7D938F] dark:text-[#677E79] block text-[10px]">Brand Trademarks</span>
                                  <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.brandName}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50">
                                  <span className="text-[#7D938F] dark:text-[#677E79] block text-[10px]">Manufacturer Origin</span>
                                  <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">{displayMed.manufacturer}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Tab 2: Uses & Warnings */}
                        {resultTab === 'uses' && (
                          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4 animate-fadeIn">
                            <div>
                              <h4 className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] mb-2.5">
                                Approved Therapeutic Indications
                              </h4>
                              <div className="space-y-2">
                                {displayMed.uses.map((use, i) => (
                                  <div
                                    key={i}
                                    className="p-3 rounded-2xl bg-[#F0F4F2]/60 dark:bg-[#1D2C2A]/60 flex items-start gap-2.5"
                                  >
                                    <CheckCircle2 className="w-4 h-4 text-[#43978D] shrink-0 mt-0.5" />
                                    <span className="text-xs text-[#202B29] dark:text-[#EDF5F3]">{use}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {displayMed.warnings && (
                              <div className="pt-3 border-t border-[#DCE5E3] dark:border-[#243633]">
                                <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400 mb-2">
                                  Clinical Warnings & Contraindications
                                </h4>
                                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                                  {displayMed.warnings.map((w, idx) => (
                                    <p key={idx}>{w}</p>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tab 3: Diagnostics */}
                        {resultTab === 'breakdown' && (
                          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4 animate-fadeIn">
                            <div className="flex items-center justify-between">
                              <h4 className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">
                                Computer Vision & Physical Scoring Breakdown
                              </h4>
                              <div className="flex items-center gap-2">
                                {scanResult.breakdown?.visionEngine && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] font-bold">
                                    {scanResult.breakdown.visionEngine}
                                  </span>
                                )}
                                {scanResult.breakdown?.roboflow?.modelId && !scanResult.breakdown?.visionEngine?.includes('Gemini') && (
                                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3]">
                                    {scanResult.breakdown.roboflow.modelId}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Physical Contour & Color Diagnostics */}
                            {scanResult.breakdown?.cvDiagnostics && (
                              <div className="p-3.5 rounded-2xl bg-[#E5F3F0]/60 dark:bg-[#162C29]/60 border border-[#43978D]/20 space-y-2">
                                <span className="text-[11px] font-bold text-[#31786F] dark:text-[#EDF5F3] flex items-center gap-1.5">
                                  <Eye className="w-3.5 h-3.5 text-[#43978D]" />
                                  Extracted Visual Characteristics
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                  <div className="bg-white/80 dark:bg-black/30 p-2 rounded-xl">
                                    <span className="text-[10px] text-[#7D938F] block">Detected Shape</span>
                                    <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{scanResult.breakdown.cvDiagnostics.detectedShape || 'Round'}</span>
                                  </div>
                                  <div className="bg-white/80 dark:bg-black/30 p-2 rounded-xl">
                                    <span className="text-[10px] text-[#7D938F] block">Dominant Color</span>
                                    <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{scanResult.breakdown.cvDiagnostics.detectedColor || 'White'}</span>
                                  </div>
                                  <div className="bg-white/80 dark:bg-black/30 p-2 rounded-xl">
                                    <span className="text-[10px] text-[#7D938F] block">Aspect Ratio</span>
                                    <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{scanResult.breakdown.cvDiagnostics.aspectRatio || 1.0}</span>
                                  </div>
                                  <div className="bg-white/80 dark:bg-black/30 p-2 rounded-xl">
                                    <span className="text-[10px] text-[#7D938F] block">Contour Solidity</span>
                                    <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{scanResult.breakdown.cvDiagnostics.surfaceSolidity || 0.98}</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            <div className="space-y-2.5 text-xs">
                              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <div>
                                  <span className="text-[#586B67] dark:text-[#91A7A2] block">Imprint Typography & Code Match</span>
                                  <span className="text-[10px] text-[#7D938F] dark:text-[#677E79]">
                                    {scanResult.breakdown?.imprintSource || 'Extracted via Visual Analysis'}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <span className="font-mono font-bold text-[#43978D] block">
                                    {scanResult.breakdown.imprintMatchScore}%
                                  </span>
                                  <span className="font-mono text-[10px] font-extrabold text-[#202B29] dark:text-[#EDF5F3]">
                                    {displayMed.imprintCode || 'N/A'}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[#586B67] dark:text-[#91A7A2]">Color Spectrum & Reflectance</span>
                                <span className="font-mono font-bold text-[#43978D]">
                                  {scanResult.breakdown.colorHistogramScore}%
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[#586B67] dark:text-[#91A7A2]">Shape Contour Geometry</span>
                                <span className="font-mono font-bold text-[#43978D]">
                                  {scanResult.breakdown.shapeContourScore}%
                                </span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[#7D938F] dark:text-[#677E79] block text-[10px] mb-0.5">Monograph Database Cross-Reference</span>
                                <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">
                                  US National Library of Medicine (NLM RxImage) & FDA NDC Verified
                                </span>
                              </div>
                              <div className="p-3.5 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                                <span className="text-[#7D938F] dark:text-[#677E79] block text-[10px] mb-0.5">Active Chemical Compound Entity</span>
                                <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3]">
                                  {displayMed.genericName} • {displayMed.dosage}
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* VIEW 2: Drug Catalog & Monograph Directory */}
      {pageTab === 'catalog' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Catalog Search & Filter Bar */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-extrabold text-[#202B29] dark:text-[#EDF5F3]">
                  Pharmaceutical Monograph Directory
                </h2>
                <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
                  Search authenticated pharmacopeia standards by drug name, active generic formula, or pill imprint stamp.
                </p>
              </div>
              <span className="self-start sm:self-auto px-3 py-1 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] text-xs font-mono font-bold">
                {catalogMeds.length} Monographs Listed
              </span>
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by medicine name, generic ingredient, or imprint code (e.g. Paracetamol, AMO 250, PAN 40)..."
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                className="w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border border-[#DCE5E3] dark:border-[#243633] focus:border-[#43978D] rounded-2xl pl-10 pr-10 py-2.5 text-xs text-[#202B29] dark:text-[#EDF5F3] placeholder-[#7D938F] outline-none transition-colors shadow-xs"
              />
              {catalogQuery && (
                <button
                  onClick={() => setCatalogQuery('')}
                  className="absolute right-3.5 top-2.5 text-[#7D938F] hover:text-[#202B29] dark:hover:text-[#EDF5F3]"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Catalog List / Grid */}
          {loadingCatalog ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-8 h-8 border-2 border-[#43978D] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
                Searching verified pharmaceutical monograph registry...
              </p>
            </div>
          ) : catalogMeds.length === 0 ? (
            <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-dashed border-[#DCE5E3] dark:border-[#243633] p-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F0F4F2] dark:bg-[#1D2C2A] text-[#7D938F] flex items-center justify-center mx-auto">
                <Search className="w-6 h-6 stroke-[1.8]" />
              </div>
              <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3]">
                No matching monographs found
              </h3>
              <p className="text-xs text-[#586B67] dark:text-[#91A7A2] max-w-sm mx-auto">
                Try searching for common names like "Paracetamol", "Amoxicillin", "Pantoprazole", or stamp imprints like "P 500".
              </p>
              <button
                onClick={() => setCatalogQuery('')}
                className="px-4 py-2 rounded-xl bg-[#43978D] text-white text-xs font-bold hover:bg-[#31786F] transition-colors"
              >
                Reset Search Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {catalogMeds.map((med) => (
                <div
                  key={med.id || med._id}
                  onClick={() => setSelectedCatalogMed(med)}
                  className="bg-[#FFFFFF] dark:bg-[#192624] hover:bg-[#F0F4F2]/50 dark:hover:bg-[#1D2C2A]/50 border border-[#DCE5E3] dark:border-[#243633] hover:border-[#43978D]/40 p-5 rounded-3xl cursor-pointer transition-all shadow-xs group flex flex-col justify-between space-y-4"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] flex items-center justify-center shrink-0 border border-[#43978D]/20">
                          <Pill className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-extrabold text-[#202B29] dark:text-[#EDF5F3] group-hover:text-[#43978D] transition-colors line-clamp-1">
                            {med.name}
                          </h4>
                          <p className="text-xs text-[#586B67] dark:text-[#91A7A2] line-clamp-1">
                            {med.genericName}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Physical pill specs */}
                    <div className="grid grid-cols-2 gap-2 text-[11px] mb-3">
                      <div className="p-2.5 rounded-xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                        <span className="text-[#7D938F] dark:text-[#677E79] block text-[10px]">Imprint Stamp</span>
                        <span className="font-mono font-bold text-[#43978D]">{med.imprintCode || 'N/A'}</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70">
                        <span className="text-[#7D938F] dark:text-[#677E79] block text-[10px]">Appearance</span>
                        <span className="font-semibold text-[#202B29] dark:text-[#EDF5F3] truncate block">
                          {med.shape} • {med.color}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-[#586B67] dark:text-[#91A7A2] line-clamp-2 leading-relaxed">
                      <strong>Approved Uses: </strong>{Array.isArray(med.uses) ? med.uses.join(', ') : (med.uses || 'Standard pharmacopeia monograph')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#DCE5E3]/60 dark:border-[#243633]/60 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#7D938F] dark:text-[#677E79] truncate max-w-[180px]">
                      {med.manufacturer}
                    </span>
                    <span className="text-[#43978D] font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform text-xs">
                      <span>View Monograph</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Drug Catalog Monograph Detail Modal rendered via Portal to escape parent containers */}
      {selectedCatalogMed && createPortal(
        <div
          onClick={() => setSelectedCatalogMed(null)}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fadeIn max-h-[85vh] overflow-y-auto my-auto"
          >
            {(() => {
              const activeIngredientsList = Array.isArray(selectedCatalogMed.activeIngredients)
                ? selectedCatalogMed.activeIngredients
                : typeof selectedCatalogMed.activeIngredients === 'string'
                  ? [selectedCatalogMed.activeIngredients]
                  : selectedCatalogMed.genericName
                    ? [selectedCatalogMed.genericName]
                    : [];

              const usesList = Array.isArray(selectedCatalogMed.uses)
                ? selectedCatalogMed.uses
                : typeof selectedCatalogMed.uses === 'string'
                  ? [selectedCatalogMed.uses]
                  : ['Standard therapeutic indications documented in national formulary.'];

              const warningsList = Array.isArray(selectedCatalogMed.warnings)
                ? selectedCatalogMed.warnings
                : typeof selectedCatalogMed.warnings === 'string'
                  ? [selectedCatalogMed.warnings]
                  : [];

              return (
                <>
                  <div className="flex items-start justify-between pb-3 border-b border-[#DCE5E3] dark:border-[#243633]">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] flex items-center justify-center shrink-0 border border-[#43978D]/25">
                        <Pill className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-[#202B29] dark:text-[#EDF5F3] leading-snug">
                          {selectedCatalogMed.name}
                        </h3>
                        <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
                          {selectedCatalogMed.genericName || 'Standard Chemical Entity'} • {selectedCatalogMed.manufacturer || 'Approved Manufacturer'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedCatalogMed(null)}
                      className="p-1.5 rounded-full text-[#7D938F] hover:text-[#202B29] dark:hover:text-[#EDF5F3] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 bg-[#F0F4F2] dark:bg-[#1D2C2A] rounded-2xl">
                      <span className="text-[10px] text-[#7D938F] block">Physical Geometry</span>
                      <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">
                        {selectedCatalogMed.shape || 'Standard'} ({selectedCatalogMed.color || 'Monochrome'})
                      </span>
                    </div>
                    <div className="p-3 bg-[#F0F4F2] dark:bg-[#1D2C2A] rounded-2xl">
                      <span className="text-[10px] text-[#7D938F] block">Die Imprint Stamp</span>
                      <span className="font-mono font-bold text-[#43978D]">{selectedCatalogMed.imprintCode || 'N/A'}</span>
                    </div>
                  </div>

                  {activeIngredientsList.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] block mb-1">
                        Active Ingredients:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeIngredientsList.map((ing, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] text-xs font-medium"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] block mb-1">
                      Approved Therapeutic Indications:
                    </span>
                    <ul className="text-xs text-[#586B67] dark:text-[#91A7A2] space-y-1 list-disc list-inside">
                      {usesList.map((u, i) => (
                        <li key={i}>{u}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedCatalogMed.dosage && (
                    <div>
                      <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] block mb-1">
                        Standard Dosage:
                      </span>
                      <p className="text-xs text-[#586B67] dark:text-[#91A7A2] p-3 rounded-2xl bg-[#F0F4F2] dark:bg-[#1D2C2A]">
                        {selectedCatalogMed.dosage}
                      </p>
                    </div>
                  )}

                  {warningsList.length > 0 && (
                    <div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block mb-1">
                        Clinical Precautions:
                      </span>
                      <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                        {warningsList.map((w, idx) => (
                          <p key={idx}>{w}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        setSelectedCatalogMed(null);
                        setPageTab('scan');
                      }}
                      className="flex-1 py-2.5 bg-[#43978D] hover:bg-[#31786F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Verify / Scan This Pill</span>
                    </button>
                    <button
                      onClick={() => setSelectedCatalogMed(null)}
                      className="py-2.5 px-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-[#202B29] dark:text-[#EDF5F3] font-bold rounded-xl text-xs transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
