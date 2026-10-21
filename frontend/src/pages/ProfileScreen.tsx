import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../services/api';
import type { Prescription } from '../types';
import {
  User as UserIcon, ShieldCheck, Bookmark, Bell,
  Trash2, Pill, Sun, Moon, Monitor, LogOut,
  Save, CheckCircle2, FileText, Lock, Mail, ChevronRight
} from 'lucide-react';

export const ProfileScreen: React.FC = () => {
  const { user, logout, savedMedications, removeSavedMedication } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [pushAlerts, setPushAlerts] = useState(true);
  const [highPrecision, setHighPrecision] = useState(true);

  // Editable fields
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Saved Prescriptions
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loadingRx, setLoadingRx] = useState(false);

  useEffect(() => {
    const loadRx = async () => {
      setLoadingRx(true);
      try {
        const data = await api.getPrescriptions();
        setPrescriptions(data);
      } catch (e) {
        // Fallback handled in api
      } finally {
        setLoadingRx(false);
      }
    };
    loadRx();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = {
        ...user,
        name: editName,
        email: editEmail
      };
      localStorage.setItem('truemed_user_profile', JSON.stringify(updatedUser));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };


  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Page Header */}
      <div className="pb-3 border-b border-[#DCE5E3] dark:border-[#243633]">
        <h1 className="text-xl sm:text-2xl font-extrabold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
          Account Profile & Clinical Preferences
        </h1>
        <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
          Manage your verified credentials, security settings, saved medications, and platform theme.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Profile Card & Editable Info (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Identity Card */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm flex items-center gap-4">
            <div className="relative shrink-0">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250'}
                alt={user?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-[#43978D]/30 shadow-xs"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-[#43978D] text-white rounded-full ring-2 ring-[#FFFFFF] dark:ring-[#192624]">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <h2 className="text-base font-extrabold text-[#202B29] dark:text-[#EDF5F3]">
                  {user?.name || 'Verified User'}
                </h2>
              </div>
              <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">{user?.email}</p>
            </div>
          </div>

          {/* Editable Profile Fields */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#586B67] dark:text-[#91A7A2]">
                Personal Account Details
              </h3>
              {saveSuccess && (
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 animate-fadeIn">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved Changes
                </span>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-[#586B67] dark:text-[#91A7A2] block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-2.5" />
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border border-[#DCE5E3] dark:border-[#243633] rounded-xl pl-10 pr-3 py-2 text-xs text-[#202B29] dark:text-[#EDF5F3] outline-none focus:border-[#43978D]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-[#586B67] dark:text-[#91A7A2] block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-2.5" />
                  <input
                    type="email"
                    required
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border border-[#DCE5E3] dark:border-[#243633] rounded-xl pl-10 pr-3 py-2 text-xs text-[#202B29] dark:text-[#EDF5F3] outline-none focus:border-[#43978D]"
                  />
                </div>
              </div>


              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#43978D] hover:bg-[#31786F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </form>
          </div>

          {/* Saved Medications History */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#43978D]" />
                <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3]">
                  Saved Medications
                </h3>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3]">
                {savedMedications.length} Meds
              </span>
            </div>

            {savedMedications.length === 0 ? (
              <p className="text-xs text-[#7D938F] dark:text-[#677E79] py-4 text-center">
                No verified medications saved yet. Scan a pill to bookmark it.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {savedMedications.map((med) => (
                  <div
                    key={med.id || med._id}
                    className="p-3 bg-[#F0F4F2]/70 dark:bg-[#1D2C2A]/70 rounded-2xl flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#FFFFFF] dark:bg-[#192624] text-[#43978D] flex items-center justify-center shadow-xs">
                        <Pill className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">{med.name}</h4>
                        <p className="text-[10px] text-[#586B67] dark:text-[#91A7A2]">
                          Imprint: <span className="font-mono text-[#43978D] font-bold">{med.imprintCode}</span> • {med.manufacturer}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeSavedMedication((med.id || med._id)!)}
                      className="p-1.5 text-[#7D938F] hover:text-rose-500 rounded-lg hover:bg-black/5 transition-colors"
                      title="Remove medication"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Theme & System Settings (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Theme Preferences */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#586B67] dark:text-[#91A7A2]">
              Interface Appearance & Theme
            </h3>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${theme === 'light'
                    ? 'bg-[#E5F3F0] dark:bg-[#162C29] border-[#43978D] text-[#31786F] dark:text-[#EDF5F3] font-bold shadow-xs'
                    : 'bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50 border-transparent text-[#586B67] dark:text-[#91A7A2]'
                  }`}
              >
                <Sun className="w-5 h-5 text-amber-500" />
                <span className="text-xs">Light</span>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${theme === 'dark'
                    ? 'bg-[#E5F3F0] dark:bg-[#162C29] border-[#43978D] text-[#31786F] dark:text-[#EDF5F3] font-bold shadow-xs'
                    : 'bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50 border-transparent text-[#586B67] dark:text-[#91A7A2]'
                  }`}
              >
                <Moon className="w-5 h-5 text-[#43978D]" />
                <span className="text-xs">Dark</span>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${theme === 'system'
                    ? 'bg-[#E5F3F0] dark:bg-[#162C29] border-[#43978D] text-[#31786F] dark:text-[#EDF5F3] font-bold shadow-xs'
                    : 'bg-[#F0F4F2]/50 dark:bg-[#1D2C2A]/50 border-transparent text-[#586B67] dark:text-[#91A7A2]'
                  }`}
              >
                <Monitor className="w-5 h-5 text-[#7D938F]" />
                <span className="text-xs">System</span>
              </button>
            </div>
            <p className="text-[11px] text-[#7D938F] dark:text-[#677E79]">
              Active theme: <strong className="capitalize text-[#202B29] dark:text-[#EDF5F3]">{resolvedTheme}</strong>. Stored in localStorage with zero-flash loading.
            </p>
          </div>

          {/* Safety & Notification Toggles */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#586B67] dark:text-[#91A7A2]">
              Alerts & Optical Settings
            </h3>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] block">
                    Medication Safety & Recall Alerts
                  </span>
                  <span className="text-[11px] text-[#7D938F] dark:text-[#677E79]">
                    Push notifications when FDA or manufacturers update drug safety notices
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setPushAlerts(!pushAlerts)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 ${pushAlerts ? 'bg-[#43978D]' : 'bg-[#DCE5E3] dark:bg-[#243633]'
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${pushAlerts ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  ></div>
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#DCE5E3] dark:border-[#243633]">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] block">
                    High-Precision Imprint OCR
                  </span>
                  <span className="text-[11px] text-[#7D938F] dark:text-[#677E79]">
                    Dual-pass contrast enhancement for faint engravings
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setHighPrecision(!highPrecision)}
                  className={`w-11 h-6 rounded-full transition-colors p-0.5 ${highPrecision ? 'bg-[#43978D]' : 'bg-[#DCE5E3] dark:bg-[#243633]'
                    }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${highPrecision ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Saved Prescriptions Quick List */}
          <div className="rounded-3xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#43978D]" />
                Prescriptions On File
              </span>
              <span className="text-xs font-mono font-bold text-[#43978D]">
                {prescriptions.length}
              </span>
            </div>

            {prescriptions.length === 0 ? (
              <p className="text-xs text-[#7D938F] py-2">No prescriptions archived.</p>
            ) : (
              <div className="space-y-2">
                {prescriptions.slice(0, 3).map((rx) => (
                  <div
                    key={rx._id}
                    className="p-2.5 rounded-xl bg-[#F0F4F2]/60 dark:bg-[#1D2C2A]/60 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-[#202B29] dark:text-[#EDF5F3]">{rx.doctorName}</p>
                      <p className="text-[10px] text-[#7D938F]">{rx.clinicName}</p>
                    </div>
                    <span className="text-[10px] text-[#7D938F]">
                      {new Date(rx.prescribedDate).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sign Out Action */}
          <button
            onClick={logout}
            className="w-full py-3.5 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 text-rose-600 dark:text-rose-400 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition-all border border-rose-200 dark:border-rose-900/50"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out of TrueMed</span>
          </button>
        </div>
      </div>
    </div>
  );
};
