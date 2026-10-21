import React from 'react';
import { Home, Pill, FileText, User as UserIcon } from 'lucide-react';

interface BottomNavProps {
  currentTab: 'home' | 'scan' | 'prescriptions' | 'profile';
  onSelectTab: (tab: 'home' | 'scan' | 'prescriptions' | 'profile') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'scan' as const, label: 'Identify', icon: Pill, isPrimary: true },
    { id: 'prescriptions' as const, label: 'Rx & Meds', icon: FileText },
    { id: 'profile' as const, label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[94%] max-w-sm bg-[#FFFFFF]/95 dark:bg-[#192624]/95 backdrop-blur-xl border border-[#DCE5E3] dark:border-[#243633] shadow-lg shadow-black/10 rounded-2xl px-2 py-1 flex items-center justify-around transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        if (tab.isPrimary) {
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className="relative -top-3.5 flex flex-col items-center justify-center focus:outline-none group active:scale-95 transition-transform"
              aria-label={tab.label}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-all duration-150 ${
                  isActive
                    ? 'bg-[#43978D] text-white shadow-[#43978D]/30 ring-3 ring-[#F7F9F7] dark:ring-[#111B1A]'
                    : 'bg-[#43978D] text-white hover:bg-[#31786F] shadow-[#43978D]/20 ring-3 ring-[#F7F9F7] dark:ring-[#111B1A]'
                }`}
              >
                <Icon className="w-5 h-5 stroke-[2.4]" />
              </div>
              <span className={`text-[10px] font-bold tracking-tight mt-0.5 ${isActive ? 'text-[#43978D]' : 'text-[#586B67] dark:text-[#91A7A2]'}`}>
                {tab.label}
              </span>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center py-1.5 px-3 rounded-xl transition-all duration-150 active:scale-95 ${
              isActive
                ? 'text-[#43978D] font-bold'
                : 'text-[#586B67] dark:text-[#91A7A2] hover:text-[#202B29] dark:hover:text-[#EDF5F3]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[10px] tracking-tight mt-0.5 font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
