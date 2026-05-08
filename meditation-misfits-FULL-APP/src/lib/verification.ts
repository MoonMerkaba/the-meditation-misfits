import { verificationStorage, VerificationData } from './storage';

// Generate a random verification token
export const generateToken = (): string => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

// Send verification email
export const sendVerificationEmail = async (email: string): Promise<{ success: boolean; error?: string }> => {
  const token = generateToken();
  const tokenExpiry = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
  const verifyUrl = `${window.location.origin}/verify?token=${token}`;
  
  // Store token locally
  const verificationData: VerificationData = {
    email,
    verified: false,
    token,
    tokenExpiry,
    sentAt: Date.now()
  };
  verificationStorage.set(verificationData);
  
  // Try to send via API if endpoint exists
  const endpoint = import.meta.env.VITE_CONTACT_POST_URL;
  if (endpoint) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, verifyUrl, type: 'verification' })
      });
      
      if (response.ok) {
        return { success: true };
      }
    } catch (error) {
      console.error('Failed to send verification email:', error);
    }
  }
  
  // Fallback: show verification link in console (for development)
  console.log('Verification link:', verifyUrl);
  return { success: true };
};

// Verify token
export const verifyToken = (token: string): { success: boolean; error?: string } => {
  const data = verificationStorage.get();
  
  if (!data) {
    return { success: false, error: 'No verification data found' };
  }
  
  if (data.verified) {
    return { success: true };
  }
  
  if (data.token !== token) {
    return { success: false, error: 'Invalid verification token' };
  }
  
  if (verificationStorage.isTokenExpired()) {
    return { success: false, error: 'Verification link has expired' };
  }
  
  verificationStorage.setVerified(data.email);
  return { success: true };
};
