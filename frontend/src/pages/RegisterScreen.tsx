import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight,
  AlertCircle, CheckCircle2, Eye, EyeOff, Sun, Moon, Check
} from 'lucide-react';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const { register } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState<'patient' | 'pharmacist' | 'doctor'>('patient');

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});
  const [submitting, setSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength();
  const getStrengthLabel = () => {
    if (!password) return { text: 'Enter password', color: 'bg-slate-200' };
    if (strengthScore <= 2) return { text: 'Weak', color: 'bg-rose-500' };
    if (strengthScore <= 3) return { text: 'Moderate', color: 'bg-amber-500' };
    return { text: 'Strong', color: 'bg-[#43978D]' };
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setErrors({});
    try {
      await register(name, email, password, role);
    } catch (err: any) {
      setErrors({ general: err.message || 'Registration failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F9F7] dark:bg-[#111B1A] text-[#202B29] dark:text-[#EDF5F3] flex flex-col justify-between items-center p-4 sm:p-6 transition-colors duration-150 medical-grid-bg">
      {/* Top Bar with Brand & Theme Toggle */}
      <header className="w-full max-w-md flex items-center justify-between py-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] flex items-center justify-center border border-[#43978D]/25">
            <ShieldCheck className="w-5 h-5 stroke-[2.3]" />
          </div>
          <span className="text-sm font-extrabold tracking-tight text-[#202B29] dark:text-[#EDF5F3]">
            TrueMed
          </span>
        </div>

        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[#DCE5E3] dark:border-[#243633] flex items-center justify-center text-[#202B29] dark:text-[#EDF5F3] transition-colors"
        >
          {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#31786F]" />}
        </button>
      </header>

      {/* Main Authentication Card */}
      <div className="w-full max-w-md my-auto py-6 space-y-6">
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-3xl bg-[#E5F3F0] dark:bg-[#162C29] text-[#43978D] border border-[#43978D]/30 flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl font-extrabold text-[#202B29] dark:text-[#EDF5F3] tracking-tight">
            Create Verified Account
          </h1>
          <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
            Join TrueMed for verified medicine identification & prescription tracking
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          {errors.general && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            {/* Full Name */}
            <div>
              <label className="block text-[11px] font-semibold text-[#586B67] dark:text-[#91A7A2] mb-1">
                Full Legal Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="e.g. Alex Mercer"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border ${errors.name ? 'border-rose-400' : 'border-[#DCE5E3] dark:border-[#243633] focus:border-[#43978D]'
                    } rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#202B29] dark:text-[#EDF5F3] outline-none transition-all`}
                />
              </div>
              {errors.name && <span className="text-[10px] text-rose-500 mt-1 block">{errors.name}</span>}
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[11px] font-semibold text-[#586B67] dark:text-[#91A7A2] mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-3" />
                <input
                  type="email"
                  placeholder="name@healthcare.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border ${errors.email ? 'border-rose-400' : 'border-[#DCE5E3] dark:border-[#243633] focus:border-[#43978D]'
                    } rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#202B29] dark:text-[#EDF5F3] outline-none transition-all`}
                />
              </div>
              {errors.email && <span className="text-[10px] text-rose-500 mt-1 block">{errors.email}</span>}
            </div>


            {/* Password Field with Visibility Toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-[#586B67] dark:text-[#91A7A2] mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border ${errors.password ? 'border-rose-400' : 'border-[#DCE5E3] dark:border-[#243633] focus:border-[#43978D]'
                    } rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#202B29] dark:text-[#EDF5F3] outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#7D938F] hover:text-[#202B29] dark:hover:text-[#EDF5F3]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <span className="text-[10px] text-rose-500 mt-1 block">{errors.password}</span>}

              {/* Password Strength Feedback */}
              {password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[#7D938F]">Password Strength:</span>
                    <span className="font-bold text-[#202B29] dark:text-[#EDF5F3]">
                      {getStrengthLabel().text}
                    </span>
                  </div>
                  <div className="w-full bg-[#DCE5E3] dark:bg-[#243633] h-1 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${getStrengthLabel().color}`}
                      style={{ width: `${Math.min(100, (strengthScore / 4) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password Field with Visibility Toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-[#586B67] dark:text-[#91A7A2] mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-3" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border ${errors.confirmPassword ? 'border-rose-400' : 'border-[#DCE5E3] dark:border-[#243633] focus:border-[#43978D]'
                    } rounded-xl pl-10 pr-10 py-2.5 text-xs text-[#202B29] dark:text-[#EDF5F3] outline-none transition-all`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3 text-[#7D938F] hover:text-[#202B29] dark:hover:text-[#EDF5F3]"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="text-[10px] text-rose-500 mt-1 block">{errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#43978D] hover:bg-[#31786F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50 mt-2"
            >
              <span>{submitting ? 'Creating TrueMed Account...' : 'Complete Registration'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Switch to Login */}
        <p className="text-center text-xs text-[#586B67] dark:text-[#91A7A2]">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-[#43978D] font-bold hover:underline"
          >
            Sign In Here
          </button>
        </p>
      </div>

      {/* Footer */}
      <footer className="text-[11px] text-[#7D938F] dark:text-[#677E79] text-center pb-2">
        TrueMed Clinical Security Standard • HIPAA / GDPR Compliant Monograph Engine
      </footer>
    </div>
  );
};
