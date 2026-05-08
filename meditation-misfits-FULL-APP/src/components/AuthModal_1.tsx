import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useAuth } from '../contexts/AuthContext';
import { Alert, AlertDescription } from './ui/alert';
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
// Social auth disabled until providers are configured
// import { SocialAuthButtons } from './SocialAuthButtons';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ email: '', password: '', name: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const { login, signup, resendVerificationEmail } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    const result = await login(loginForm.email, loginForm.password);
    if (result.success) {
      onClose();
      setLoginForm({ email: '', password: '' });
    } else if (result.needsVerification) {
      setNeedsVerification(true);
      setVerificationEmail(loginForm.email);
      setError('Please verify your email before logging in.');
    } else {
      setError(result.error || 'Invalid email or password');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }
    if (signupForm.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }
    const result = await signup(signupForm.email, signupForm.password, signupForm.name);
    if (result.success) {
      setNeedsVerification(true);
      setVerificationEmail(signupForm.email);
      setSuccess('Account created! Please check your email to verify your account.');
      setSignupForm({ email: '', password: '', name: '', confirmPassword: '' });
    } else {
      setError(result.error || 'Signup failed. Please try again.');
    }
    setLoading(false);
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setError('');
    setSuccess('');
    const result = await resendVerificationEmail();
    if (result.success) {
      setSuccess('Verification email sent! Please check your inbox.');
    } else {
      setError(result.error || 'Failed to resend verification email');
    }
    setResendLoading(false);
  };

  const inputClass = "pl-10 bg-black/50 border-[#444343] text-white placeholder:text-[#444343] focus:border-[#FF00BF]";

  if (needsVerification) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md bg-[#444343] border-[#444343]">
          <DialogHeader>
            <DialogTitle className="text-center text-white text-xl">Verify Your Email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-[#FF00BF]/20 p-3">
                <Mail className="h-8 w-8 text-[#FF00BF]" />
              </div>
            </div>
            <div className="text-center space-y-2">
              <p className="text-sm text-[#A2A1A3]">We've sent a verification email to:</p>
              <p className="font-semibold text-white">{verificationEmail}</p>
              <p className="text-sm text-[#A2A1A3]">Click the link in the email to verify your account.</p>
            </div>
            {success && (
              <Alert className="border-green-500/30 bg-green-500/10">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <AlertDescription className="text-green-300">{success}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="border-red-500/30 bg-red-500/10">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Button onClick={handleResendVerification} variant="outline" className="w-full border-[#FF00BF]/30 text-[#FF00BF] hover:bg-[#FF00BF]/10" disabled={resendLoading}>
                {resendLoading ? 'Sending...' : 'Resend Verification Email'}
              </Button>
              <Button onClick={() => { setNeedsVerification(false); setError(''); setSuccess(''); onClose(); }} variant="ghost" className="w-full text-[#A2A1A3] hover:text-white hover:bg-[#444343]/30">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-[#444343] border-[#444343]">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl text-white">Join The Meditation Misfits</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black/50">
            <TabsTrigger value="login" className="data-[state=active]:bg-[#FF00BF]/20 data-[state=active]:text-[#FF00BF]">Login</TabsTrigger>
            <TabsTrigger value="signup" className="data-[state=active]:bg-[#FF00BF]/20 data-[state=active]:text-[#FF00BF]">Sign Up</TabsTrigger>
          </TabsList>
          {error && (
            <Alert variant="destructive" className="mt-4 border-red-500/30 bg-red-500/10">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mt-4 border-green-500/30 bg-green-500/10">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <AlertDescription className="text-green-300">{success}</AlertDescription>
            </Alert>
          )}
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email" className="text-[#A2A1A3]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6683A0]" />
                  <Input id="login-email" type="email" placeholder="Enter your email" className={inputClass} value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="text-[#A2A1A3]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6683A0]" />
                  <Input id="login-password" type="password" placeholder="Enter your password" className={inputClass} value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
                </div>
              </div>
              <Button type="submit" className="w-full bg-[#FF00BF] hover:bg-[#FF00BF]/90 text-white" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            {/* <SocialAuthButtons /> */}
          </TabsContent>
          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-name" className="text-[#A2A1A3]">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#6683A0]" />
                  <Input id="signup-name" type="text" placeholder="Enter your name" className={inputClass} value={signupForm.name} onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email" className="text-[#A2A1A3]">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-[#6683A0]" />
                  <Input id="signup-email" type="email" placeholder="Enter your email" className={inputClass} value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password" className="text-[#A2A1A3]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6683A0]" />
                  <Input id="signup-password" type="password" placeholder="Create a password" className={inputClass} value={signupForm.password} onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password" className="text-[#A2A1A3]">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-[#6683A0]" />
                  <Input id="confirm-password" type="password" placeholder="Confirm your password" className={inputClass} value={signupForm.confirmPassword} onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })} required />
                </div>
              </div>
              <p className="text-xs text-[#A2A1A3]/60 text-center">
                By signing up, you agree to our{' '}
                <a href="/terms" target="_blank" className="text-[#FF00BF] hover:text-[#FF00BF]/80 underline">Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" target="_blank" className="text-[#FF00BF] hover:text-[#FF00BF]/80 underline">Privacy Policy</a>
              </p>
              <Button type="submit" className="w-full bg-[#FF00BF] hover:bg-[#FF00BF]/90 text-white" disabled={loading}>
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>
            {/* <SocialAuthButtons /> */}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
