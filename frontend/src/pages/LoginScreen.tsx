import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldCheck, Mail, Lock, AlertCircle, ArrowRight,
  Eye, EyeOff, Sun, Moon, CheckCircle2, X
} from 'lucide-react';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const { login } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Forgot password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
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
      await login(email, password);
    } catch (err: any) {
      setErrors({ general: err.message || 'Invalid email or password' });
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    setEmail('user.demo@truemed.io');
    setPassword('password123');
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotSent(true);
    setTimeout(() => {
      setForgotSent(false);
      setShowForgotPassword(false);
      setForgotEmail('');
    }, 2500);
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
            Sign In to TrueMed
          </h1>
          <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
            Access clinical medicine verification and digital prescriptions
          </p>
        </div>

        <div className="bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] rounded-3xl p-6 sm:p-7 shadow-sm space-y-4">
          {errors.general && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-2 text-rose-700 dark:text-rose-300 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errors.general}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
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
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-[#586B67] dark:text-[#91A7A2]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[10px] text-[#43978D] font-semibold hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#7D938F] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
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
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-[#DCE5E3] text-[#43978D] focus:ring-[#43978D]"
              />
              <label htmlFor="remember" className="text-[11px] text-[#586B67] dark:text-[#91A7A2] cursor-pointer">
                Remember this workstation for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#43978D] hover:bg-[#31786F] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-xs disabled:opacity-50"
            >
              <span>{submitting ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Access */}
          <div className="pt-3 border-t border-[#DCE5E3] dark:border-[#243633]">
            <button
              type="button"
              onClick={() => {
                setEmail('alex.patient@truemed.io');
                setPassword('password123');
              }}
              className="w-full py-2 px-3 bg-[#F0F4F2] dark:bg-[#1D2C2A] hover:bg-black/5 dark:hover:bg-white/5 text-[#586B67] dark:text-[#91A7A2] rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#43978D]" />
              <span>Fill Quick Demo Credentials</span>
            </button>
          </div>

        </div>

        {/* Switch to Signup */}
        <p className="text-center text-xs text-[#586B67] dark:text-[#91A7A2]">
          Need an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-[#43978D] font-bold hover:underline"
          >
            Create a TrueMed Account
          </button>
        </p>
      </div>

      {/* Footer Disclaimer */}
      <footer className="text-[11px] text-[#7D938F] dark:text-[#677E79] text-center pb-2">
        TrueMed Platform • Secure Healthcare Authentication
      </footer>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-xl animate-fadeIn">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#202B29] dark:text-[#EDF5F3]">Reset Password</h3>
              <button onClick={() => setShowForgotPassword(false)} className="text-[#7D938F]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotSent ? (
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">Reset Link Dispatched</p>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Check your inbox for password instructions.</p>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-3 text-xs">
                <p className="text-xs text-[#586B67] dark:text-[#91A7A2]">
                  Enter your registered email address to receive password reset instructions.
                </p>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-[#F0F4F2] dark:bg-[#1D2C2A] border border-[#DCE5E3] dark:border-[#243633] rounded-xl px-3 py-2 text-xs outline-none focus:border-[#43978D]"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#43978D] hover:bg-[#31786F] text-white font-bold rounded-xl"
                >
                  Send Reset Link
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
