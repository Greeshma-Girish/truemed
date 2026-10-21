import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  ShieldCheck, Sun, Moon, LogOut,
  Pill, FileText, User as UserIcon,
  Menu, X, Sparkles, Home, ChevronDown, Check, Clock
} from 'lucide-react';

interface NavbarProps {
  currentTab: 'home' | 'scan' | 'prescriptions' | 'profile' | 'history';
  onSelectTab: (tab: 'home' | 'scan' | 'prescriptions' | 'profile' | 'history') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onSelectTab }) => {
  const { user, logout } = useAuth();
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  interface NavItem {
    id: 'home' | 'scan' | 'prescriptions' | 'profile';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }

  const navItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'scan', label: 'Medicine & Catalog', icon: Pill },
    { id: 'prescriptions', label: 'Prescriptions', icon: FileText },
    { id: 'profile', label: 'Profile & Settings', icon: UserIcon },
    { id: 'history', label: 'History & Settings', icon: Clock },
  ];

  const handleNavClick = (tab: 'home' | 'scan' | 'prescriptions' | 'profile'|'history') => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF]/90 dark:bg-[#192624]/90 backdrop-blur-md border-b border-[#DCE5E3] dark:border-[#243633] transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Medical Identity */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="flex items-center gap-3 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E5F3F0] dark:bg-[#132724] border border-[#43978D]/30 text-[#43978D] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
                <ShieldCheck className="w-6 h-6 stroke-[2.3]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-extrabold tracking-tight text-[#202B29] dark:text-[#EDF5F3]">
                    TrueMed
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#43978D]"></span>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#586B67] dark:text-[#91A7A2]">
                  Clinical Verification
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-150 ${isActive
                      ? 'bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] shadow-xs'
                      : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3] hover:bg-black/5 dark:hover:bg-white/5'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#43978D] stroke-[2.5]' : 'stroke-2'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#43978D]/15 dark:bg-[#43978D]/30 text-[#31786F] dark:text-[#E5F3F0] font-bold">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#43978D] rounded-full"></span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Theme Toggle & User Menu */}
          <div className="flex items-center gap-2.5">
            {/* Theme Toggle Button */}
            <div className="relative">
              <button
                onClick={toggleTheme}
                aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Currently in ${resolvedTheme} mode. Click to toggle.`}
                className="w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[#DCE5E3] dark:border-[#243633] text-[#202B29] dark:text-[#EDF5F3] flex items-center justify-center transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#43978D]/30"
              >
                {resolvedTheme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 stroke-[2.2]" />
                ) : (
                  <Moon className="w-4 h-4 text-[#31786F] stroke-[2.2]" />
                )}
              </button>
            </div>

            {/* User Profile Pill & Dropdown (Desktop) */}
            {user && (
              <div className="relative hidden sm:block">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 pl-2.5 pr-2 py-1.5 rounded-xl bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 border border-[#DCE5E3] dark:border-[#243633] transition-all focus:outline-none"
                >
                  <div className="w-6 h-6 rounded-lg bg-[#43978D] text-white font-bold text-xs flex items-center justify-center ring-1 ring-[#43978D]/40 shrink-0 select-none">
                    {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-bold leading-tight text-[#202B29] dark:text-[#EDF5F3]">
                      {user.name.split(' ')[0]}
                    </p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-[#7D938F] dark:text-[#677E79]" />
                </button>

                {/* User Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-[#FFFFFF] dark:bg-[#192624] border border-[#DCE5E3] dark:border-[#243633] shadow-lg shadow-black/10 py-1.5 z-50 animate-fadeIn">
                    <div className="px-3.5 py-2.5 border-b border-[#DCE5E3] dark:border-[#243633]">
                      <p className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3] truncate">{user.name}</p>
                      <p className="text-[10px] text-[#586B67] dark:text-[#91A7A2] truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3] text-[9px] font-bold uppercase tracking-wider">
                        TrueMed Account
                      </span>
                    </div>

                    <button
                      onClick={() => handleNavClick('profile')}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-[#202B29] dark:text-[#EDF5F3] hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#43978D]" />
                      <span>Account Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 border-t border-[#DCE5E3] dark:border-[#243633]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-xl bg-black/5 dark:bg-white/5 border border-[#DCE5E3] dark:border-[#243633] text-[#202B29] dark:text-[#EDF5F3] flex items-center justify-center focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#DCE5E3] dark:border-[#243633] bg-[#FFFFFF] dark:bg-[#192624] px-4 pt-2 pb-5 space-y-1.5 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${isActive
                    ? 'bg-[#E5F3F0] dark:bg-[#162C29] text-[#31786F] dark:text-[#EDF5F3]'
                    : 'text-[#586B67] dark:text-[#91A7A2] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#43978D]' : ''}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[#43978D]/20 text-[#31786F] dark:text-[#E5F3F0] font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {user && (
            <div className="pt-3 mt-2 border-t border-[#DCE5E3] dark:border-[#243633] space-y-2">
              <div className="flex items-center gap-2.5 px-3 py-1">
                <div className="w-8 h-8 rounded-lg bg-[#43978D] text-white font-bold text-sm flex items-center justify-center ring-1 ring-[#43978D]/40 shrink-0 select-none">
                  {user.name ? user.name.trim().charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-[#202B29] dark:text-[#EDF5F3]">{user.name}</p>
                  <p className="text-[10px] text-[#586B67] dark:text-[#91A7A2]">{user.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
