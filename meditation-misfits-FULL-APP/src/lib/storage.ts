// LocalStorage helpers
export const storage = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch { return null; }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { console.error('Storage error:', e); }
  },
  remove: (key: string) => localStorage.removeItem(key)
};

// Email verification helpers
export interface VerificationData {
  email: string;
  verified: boolean;
  token?: string;
  tokenExpiry?: number;
  sentAt?: number;
}

export const verificationStorage = {
  get: (): VerificationData | null => storage.get('mm.verification'),
  
  set: (data: VerificationData) => storage.set('mm.verification', data),
  
  setVerified: (email: string) => {
    const current = verificationStorage.get();
    if (current) {
      storage.set('mm.verification', { ...current, verified: true, token: undefined, tokenExpiry: undefined });
    }
  },
  
  isTokenExpired: (): boolean => {
    const data = verificationStorage.get();
    if (!data?.tokenExpiry) return true;
    return Date.now() > data.tokenExpiry;
  },
  
  clear: () => storage.remove('mm.verification')
};
