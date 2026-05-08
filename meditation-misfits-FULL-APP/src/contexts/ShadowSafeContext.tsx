import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ShadowSafeContextType {
  isShadowSafeMode: boolean;
  toggleShadowSafeMode: () => void;
  enableShadowSafeMode: () => void;
  disableShadowSafeMode: () => void;
}

const ShadowSafeContext = createContext<ShadowSafeContextType | null>(null);

const STORAGE_KEY = 'freqyn_shadow_safe_mode';

export function ShadowSafeProvider({ children }: { children: ReactNode }) {
  const [isShadowSafeMode, setIsShadowSafeMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored === 'true';
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isShadowSafeMode));
    
    // Apply visual changes when shadow safe mode is active
    if (isShadowSafeMode) {
      document.documentElement.classList.add('shadow-safe-mode');
    } else {
      document.documentElement.classList.remove('shadow-safe-mode');
    }
  }, [isShadowSafeMode]);

  const toggleShadowSafeMode = () => setIsShadowSafeMode(prev => !prev);
  const enableShadowSafeMode = () => setIsShadowSafeMode(true);
  const disableShadowSafeMode = () => setIsShadowSafeMode(false);

  return (
    <ShadowSafeContext.Provider value={{
      isShadowSafeMode,
      toggleShadowSafeMode,
      enableShadowSafeMode,
      disableShadowSafeMode
    }}>
      {children}
    </ShadowSafeContext.Provider>
  );
}

export function useShadowSafe() {
  const context = useContext(ShadowSafeContext);
  if (!context) {
    throw new Error('useShadowSafe must be used within ShadowSafeProvider');
  }
  return context;
}
