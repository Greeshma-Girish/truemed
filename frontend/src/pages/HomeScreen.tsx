import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Prescription } from '../types';
import {
  Pill, FileText, ShieldCheck, ArrowRight,
  Clock, CheckCircle2, AlertTriangle, Sparkles,
  Info, ChevronRight, Bookmark, Building2, UploadCloud,
  Check, Activity, Award, ShieldAlert, Zap, Search, Eye, Lock
} from 'lucide-react';

interface HomeScreenProps {
  onNavigateToScan: () => void;
  onNavigateToDetails: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onNavigateToScan, onNavigateToDetails }) => {
  const { user, savedMedications } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingRx, setLoadingRx] = useState(false);

  // Daily medication tracker
  const [schedule, setSchedule] = useState([
    { id: 'd1', name: 'Amoxicillin Trihydrate', dose: '250mg', time: '08:00 AM', period: 'Morning • Post Meal', taken: true },
    { id: 'd2', name: 'Paracetamol', dose: '500mg', time: '01:30 PM', period: 'Afternoon • As Needed for Pain', taken: false },
    { id: 'd3', name: 'Lipitor (Atorvastatin)', dose: '20mg', time: '09:00 PM', period: 'Night • Bedtime', taken: false },
  ]);

  useEffect(() => {
    const loadRx = async () => {
      setLoadingRx(true);
      try {
        const data = await api.getPrescriptions();
        setPrescriptions(data.slice(0, 3));
      } catch (e) {
        // Fallback handled in api
      } finally {
        setLoadingRx(false);
      }
    };
    loadRx();
  }, []);

  const toggleDose = (id: string) => {
    setSchedule(prev => prev.map(item => item.id === id ? { ...item, taken: !item.taken } : item));
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-12 animate-fadeIn pb-16">
      {/* ========================================================================= */}
      {/* 🌟 1. LANDING PAGE FIRST VIEW (HERO SECTION ABOVE THE FOLD)               */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      {/* 🌟 1. LANDING PAGE FIRST VIEW (FULL-WIDTH HERO SECTION ABOVE THE FOLD)     */}
      {/* ========================================================================= */}
      <section className="relative overflow-hidden rounded-3xl border border-[#DCE5E3] dark:border-[#243633] bg-gradient-to-br from-[#FFFFFF] via-[#F7F9F7] to-[#E5F3F0]/40 dark:from-[#192624] dark:via-[#14201E] dark:to-[#111B1A] p-6 sm:p-8 lg:p-12 shadow-sm w-full">
        {/* Subtle background glow accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#43978D]/10 dark:bg-[#43978D]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#43978D]/5 dark:bg-[#43978D]/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Headline, Subtitle & CTAs (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Clinical Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] border border-[#43978D]/30 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#43978D] animate-pulse"></span>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#31786F] dark:text-[#EDF5F3]">
                Next-Gen Medicine Verification & Prescription OCR
              </span>
            </div>

            {/* Hero Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#202B29] dark:text-[#EDF5F3] leading-[1.12]">
              Verify Every Pill. <br />
              <span className="text-[#43978D] dark:text-[#4EB3A7]">Decipher Every Prescription.</span>
            </h1>

            {/* Hero Subtitle */}
            <p className="text-sm sm:text-base text-[#586B67] dark:text-[#91A7A2] leading-relaxed max-w-xl">
              Protect patients and pharmacists against counterfeit drug batches with deep computer vision imprint matching, and translate handwritten doctor prescriptions into structured digital regimens.
            </p>

            {/* Dual Primary Call-to-Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-1">
              <button
                onClick={onNavigateToScan}
                className="px-7 py-3.5 rounded-2xl bg-[#43978D] hover:bg-[#31786F] text-white font-bold text-sm shadow-md hover:shadow-lg hover:shadow-[#43978D]/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] group"
              >
                <Pill className="w-4 h-4 stroke-[2.3] group-hover:rotate-12 transition-transform" />
                <span>Launch Medicine Scanner</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={onNavigateToDetails}
                className="px-7 py-3.5 rounded-2xl bg-[#FFFFFF] dark:bg-[#192624] hover:bg-[#F0F4F2] dark:hover:bg-[#1D2C2A] text-[#202B29] dark:text-[#EDF5F3] border border-[#DCE5E3] dark:border-[#243633] font-bold text-sm shadow-xs flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
              >
                <FileText className="w-4 h-4 text-[#43978D]" />
                <span>Scan Prescription Slip</span>
              </button>
            </div>

            {/* Feature Highlights Pills */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs text-[#586B67] dark:text-[#91A7A2]">
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#43978D]" />
                FDA / WHO Recall Synced
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#43978D]" />
                Sub-Millimeter Imprint OCR
              </span>
              <span className="flex items-center gap-1.5 font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#43978D]" />
                Private & Secure
              </span>
            </div>
          </div>

          {/* Right Column: Hero Visual with Medical Imagery & Floating Inspection Badges (5 cols on lg) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Main Medical Image with rounded styling and frame */}
              <div className="relative rounded-3xl overflow-hidden border border-[#DCE5E3] dark:border-[#243633] shadow-xl aspect-4/3 sm:aspect-16/10 lg:aspect-4/3 bg-black/5 dark:bg-black/30">
                <img
                  src="https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=800"
                  alt="Clinical pharmaceutical verification"
                  className="w-full h-full object-cover"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none"></div>

                {/* Viewfinder Corner Markers on Image */}
                <div className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-[#43978D] rounded-tl-lg pointer-events-none"></div>
                <div className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-[#43978D] rounded-tr-lg pointer-events-none"></div>
                <div className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-[#43978D] rounded-bl-lg pointer-events-none"></div>
                <div className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-[#43978D] rounded-br-lg pointer-events-none"></div>
              </div>

              
              {/* Floating Bottom Badge: Prescription OCR Extractor */}
              <div
                onClick={onNavigateToDetails}
                className="absolute -bottom-4 -right-3 sm:-right-6 p-3.5 rounded-2xl bg-[#FFFFFF]/95 dark:bg-[#192624]/95 border border-[#DCE5E3] dark:border-[#243633] shadow-lg backdrop-blur-md cursor-pointer hover:border-[#43978D] transition-all group max-w-[270px] animate-fadeIn"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono font-bold text-[#43978D] flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    Prescription OCR
                  </span>
                  <span className="px-1.5 py-0.2 rounded bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] text-[9px] font-bold">
                    ℞ Extracted
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] font-serif font-black text-base flex items-center justify-center shrink-0">
                    ℞
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] truncate group-hover:text-[#43978D] transition-colors">
                      Amoxicillin 500mg
                    </p>
                    <p className="text-[10px] text-[#586B67] dark:text-[#91A7A2] truncate">
                      Sig: 1 cap q8h x 7d • Dr. Jenkins
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 🛠️ 2. FUNCTIONALITIES SECTION (BELOW THE FIRST VIEW LANDING PAGE)          */}
      {/* ========================================================================= */}
      <section className="space-y-6">
        {/* Section Heading & User Greeting Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[#DCE5E3] dark:border-[#243633]">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
              Clinical Platform Workflows
            </h2>
            <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
              Select a dedicated tool below to perform pill verification or process prescription scans.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] text-center shadow-xs">
              <span className="text-[10px] text-[#7D938F] block">Saved Meds</span>
              <span className="text-sm font-mono font-bold text-[#43978D]">{savedMedications.length}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] text-center shadow-xs">
              <span className="text-[10px] text-[#7D938F] block">Prescriptions</span>
              <span className="text-sm font-mono font-bold text-[#202B29] dark:text-[#EDF5F3]">{prescriptions.length}</span>
            </div>
          </div>
        </div>

        {/* Functionality Cards: Dual Gateways */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Functionality 1: Medicine Identification & Verification */}
          <div className="relative overflow-hidden rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#43978D]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] border border-[#43978D]/25 text-[#43978D] flex items-center justify-center shadow-xs">
                  <Pill className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3]">
                  Pill Verification Engine
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
                  Pill Identification & Authenticity Check
                </h3>
                <p className="text-xs text-[#586B67] dark:text-[#91A7A2] leading-relaxed mt-1">
                  Upload packaging photos or loose tablet scans. Evaluates pill imprint typography, color spectrum, and geometric contours against official pharmaceutical monographs to identify counterfeits.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0F4F2] dark:bg-[#1D2C2A] text-xs space-y-1.5 text-[#586B67] dark:text-[#91A7A2]">
                <div className="flex items-center gap-1.5 font-bold text-[#202B29] dark:text-[#EDF5F3]">
                  <UploadCloud className="w-3.5 h-3.5 text-[#43978D]" />
                  <span>Input Specifications</span>
                </div>
                <p className="text-[11px]">
                  Supports JPG, PNG, WEBP (up to 10MB) • Loose pills, blister packs, and capsule packaging.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToScan}
              className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-[#43978D] hover:bg-[#31786F] text-white text-xs font-bold shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Scan Medicine Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Functionality 2: Prescription OCR Scanner */}
          <div className="relative overflow-hidden rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#43978D]/5 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform"></div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] border border-[#43978D]/25 text-[#43978D] flex items-center justify-center shadow-xs">
                  <FileText className="w-6 h-6 stroke-[2.2]" />
                </div>
                <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3]">
                  Prescription OCR Suite
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
                  Prescription OCR & Dosage Extraction
                </h3>
                <p className="text-xs text-[#586B67] dark:text-[#91A7A2] leading-relaxed mt-1">
                  Upload printed or doctor handwritten prescription slips. Extracts medication names, strengths, dosing intervals, instructions, and clinic signatures into verified digital records.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#F0F4F2] dark:bg-[#1D2C2A] text-xs space-y-1.5 text-[#586B67] dark:text-[#91A7A2]">
                <div className="flex items-center gap-1.5 font-bold text-[#202B29] dark:text-[#EDF5F3]">
                  <Sparkles className="w-3.5 h-3.5 text-[#43978D]" />
                  <span>Clinical Extraction Pipeline</span>
                </div>
                <p className="text-[11px]">
                  Interactive editing mode, raw monospace transcript copy, and digital vault archiving.
                </p>
              </div>
            </div>

            <button
              onClick={onNavigateToDetails}
              className="mt-6 w-full py-3.5 px-4 rounded-2xl bg-[#202B29] dark:bg-[#EDF5F3] hover:bg-[#31786F] dark:hover:bg-[#43978D] text-white dark:text-[#111B1A] dark:hover:text-white text-xs font-bold shadow-xs hover:shadow-md flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <span>Scan Prescription Slip</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* Functionality 3: Daily Regimen & Saved Meds Vault */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Daily Schedule Tracker (2 cols on lg) */}
          <div className="lg:col-span-2 rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] flex items-center justify-center">
                  <Clock className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
                    Today's Medication Schedule
                  </h3>
                  <p className="text-[11px] text-[#586B67] dark:text-[#91A7A2]">Click dose to log adherence</p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#F0F4F2] dark:bg-[#1D2C2A] text-[#586B67] dark:text-[#91A7A2]">
                {schedule.filter(s => s.taken).length} / {schedule.length} Taken
              </span>
            </div>

            <div className="space-y-2.5">
              {schedule.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleDose(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${item.taken
                      ? 'bg-[#E5F3F0]/40 dark:bg-[#162C29]/40 border-[#43978D]/30 opacity-75'
                      : 'bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50 border-transparent hover:border-[#DCE5E3] dark:hover:border-[#243633]'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.taken
                        ? 'bg-[#43978D] text-white shadow-xs'
                        : 'bg-[#FFFFFF] dark:bg-[#192624] text-[#586B67] dark:text-[#91A7A2] border border-[#DCE5E3] dark:border-[#243633]'
                      }`}>
                      <Pill className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`text-xs font-bold ${item.taken ? 'line-through text-[#586B67] dark:text-[#91A7A2]' : 'text-[#202B29] dark:text-[#EDF5F3]'}`}>
                          {item.name}
                        </h4>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] rounded text-[#43978D] font-bold">
                          {item.dose}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#7D938F] dark:text-[#677E79]">
                        {item.time} • {item.period}
                      </p>
                    </div>
                  </div>

                  <div className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${item.taken
                      ? 'bg-[#43978D] border-[#43978D] text-white shadow-xs'
                      : 'border-[#DCE5E3] dark:border-[#243633] bg-[#FFFFFF] dark:bg-[#192624]'
                    }`}>
                    {item.taken && <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Saved Medications / Quick Vault (1 col on lg) */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-[#43978D]" />
                  <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3]">
                    Verified Pills Saved
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-[#43978D]">
                  {savedMedications.length}
                </span>
              </div>

              {savedMedications.length === 0 ? (
                <div className="text-center py-8 px-4 rounded-2xl bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50 border border-dashed border-[#DCE5E3] dark:border-[#243633]">
                  <Pill className="w-8 h-8 text-[#7D938F] dark:text-[#677E79] mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold text-[#202B29] dark:text-[#EDF5F3]">No verified pills saved yet</p>
                  <p className="text-[11px] text-[#7D938F] dark:text-[#677E79] mt-0.5">
                    Scan a pill to save its chemical monograph.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {savedMedications.slice(0, 4).map((med, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-2xl bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70 flex items-center justify-between text-xs"
                    >
                      <div className="truncate mr-2">
                        <p className="font-bold text-[#202B29] dark:text-[#EDF5F3] truncate">{med.name}</p>
                        <p className="text-[10px] text-[#7D938F] dark:text-[#677E79] font-mono">
                          Imprint: <span className="text-[#43978D] font-bold">{med.imprintCode || 'N/A'}</span>
                        </p>
                      </div>
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] text-[9px] font-bold uppercase">
                        Verified
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onNavigateToScan}
              className="w-full mt-4 py-2.5 px-3 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] flex items-center justify-center gap-1.5 transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-[#43978D]" />
              <span>Search Drug Monographs</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#7D938F]" />
            </button>
          </div>
        </div>

        {/* Clinical Safety Disclaimer Banner */}
        <div className="rounded-2xl bg-[#E5F3F0]/60 dark:bg-[#162C29]/60 border border-[#43978D]/25 p-4 flex items-start gap-3">
          <Info className="w-4 h-4 text-[#43978D] shrink-0 mt-0.5" />
          <div className="text-xs text-[#586B67] dark:text-[#91A7A2] leading-relaxed">
            <strong className="text-[#202B29] dark:text-[#EDF5F3] font-semibold">Clinical Safety Notice: </strong>
            TrueMed provides computer-vision assisted identification and OCR verification. Predictions and extracted information must be verified by a licensed pharmacist or physician before administering or dispensing any medication.
          </div>
        </div>
      </section>
    </div>
  );
};
