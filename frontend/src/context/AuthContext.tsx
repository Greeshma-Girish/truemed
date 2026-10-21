import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, Medicine } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string, role: string) => Promise<void>;
  logout: () => void;
  savedMedications: Medicine[];
  saveMedication: (med: Medicine) => void;
  removeSavedMedication: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [savedMedications, setSavedMedications] = useState<Medicine[]>([]);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('truemed_token');
      if (token) {
        try {
          const u = await api.getMe();
          if (u) {
            setUser(u);
          } else {
            const storedUser = localStorage.getItem('truemed_user_profile');
            if (storedUser) setUser(JSON.parse(storedUser));
          }
        } catch (e) {
          const storedUser = localStorage.getItem('truemed_user_profile');
          if (storedUser) setUser(JSON.parse(storedUser));
        }
      }
      const storedMeds = localStorage.getItem('truemed_saved_meds');
      if (storedMeds) {
        try { setSavedMedications(JSON.parse(storedMeds)); } catch (e) {}
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    const u = await api.login(email, pass);
    setUser(u);
    localStorage.setItem('truemed_user_profile', JSON.stringify(u));
  };

  const register = async (name: string, email: string, pass: string, role: string) => {
    const u = await api.register(name, email, pass, role);
    setUser(u);
    localStorage.setItem('truemed_user_profile', JSON.stringify(u));
  };

  const logout = () => {
    localStorage.removeItem('truemed_token');
    localStorage.removeItem('truemed_user_profile');
    setUser(null);
  };

  const saveMedication = (med: Medicine) => {
    setSavedMedications(prev => {
      if (prev.some(m => m.name === med.name)) return prev;
      const updated = [...prev, med];
      localStorage.setItem('truemed_saved_meds', JSON.stringify(updated));
      return updated;
    });
  };

  const removeSavedMedication = (id: string) => {
    setSavedMedications(prev => {
      const updated = prev.filter(m => m.id !== id && m._id !== id);
      localStorage.setItem('truemed_saved_meds', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      logout,
      savedMedications,
      saveMedication,
      removeSavedMedication
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
