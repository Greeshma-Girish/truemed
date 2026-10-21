import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginScreen } from './pages/LoginScreen';
import { RegisterScreen } from './pages/RegisterScreen';
import { HomeScreen } from './pages/HomeScreen';
import { ScanScreen } from './pages/ScanScreen';
import { PrescriptionScreen } from './pages/PrescriptionScreen';
import { ProfileScreen } from './pages/ProfileScreen';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [currentTab, setCurrentTab] = useState<'home' | 'scan' | 'prescriptions' | 'profile'>('home');

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F9F7] dark:bg-[#111B1A] flex items-center justify-center p-4">
        <div className="text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-[#E5F3F0] dark:bg-[#162C29] border border-[#43978D]/30 text-[#43978D] flex items-center justify-center mx-auto shadow-xs">
            <ShieldCheck className="w-6 h-6 stroke-[2.3] animate-pulse" />
          </div>
          <div className="w-6 h-6 border-2 border-[#43978D] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-[#586B67] dark:text-[#91A7A2] tracking-wide">
            Initializing TrueMed Clinical Verification...
          </p>
        </div>
      </div>
    );
  }

  // Auth Guard: If user not logged in
  if (!user) {
    return authMode === 'login' ? (
      <LoginScreen onSwitchToRegister={() => setAuthMode('register')} />
    ) : (
      <RegisterScreen onSwitchToLogin={() => setAuthMode('login')} />
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9F7] dark:bg-[#111B1A] text-[#202B29] dark:text-[#EDF5F3] flex flex-col transition-colors duration-150">
      {/* Top Clinical Navigation Bar */}
      <Navbar currentTab={currentTab} onSelectTab={setCurrentTab} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        {currentTab === 'home' && (
          <HomeScreen
            onNavigateToScan={() => setCurrentTab('scan')}
            onNavigateToDetails={() => setCurrentTab('prescriptions')}
          />
        )}
        {currentTab === 'scan' && <ScanScreen />}
        {currentTab === 'prescriptions' && <PrescriptionScreen />}
        {currentTab === 'profile' && <ProfileScreen />}
      </main>

      {/* Mobile Floating Bottom Dock (Hidden on md and larger) */}
      <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
