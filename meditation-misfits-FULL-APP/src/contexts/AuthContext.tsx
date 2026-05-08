import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { extractOAuthProfile, isProfileComplete } from '@/lib/oauthProfile';


interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  emailVerified: boolean;
}

interface MeditationSession {
  id: string;
  userId: string;
  type: 'simple' | 'stack';
  duration: string;
  frequencies: string[];
  aim?: string;
  center?: string;
  mainLayer?: string;
  supportLayer?: string;
  timestamp: string;
  completed: boolean;
}

interface FavoriteStack {
  id: string;
  userId: string;
  name: string;
  mainLayer: string;
  supportLayer: string;
  mainVolume: number;
  supportVolume: number;
  duration: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  login: (email: string, password: string) => Promise<{ success: boolean; needsVerification?: boolean; error?: string }>;
  signup: (email: string, password: string, name: string) => Promise<{ success: boolean; needsVerification?: boolean; error?: string }>;
  logout: () => Promise<void>;
  resendVerificationEmail: () => Promise<{ success: boolean; error?: string }>;
  signInWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signInWithFacebook: () => Promise<{ success: boolean; error?: string }>;
  signInWithGitHub: () => Promise<{ success: boolean; error?: string }>;
  sessions: MeditationSession[];
  favoriteStacks: FavoriteStack[];
  addSession: (session: Omit<MeditationSession, 'id' | 'userId' | 'timestamp'>) => void;
  saveFavoriteStack: (stack: Omit<FavoriteStack, 'id' | 'userId' | 'createdAt'>) => void;
  deleteFavoriteStack: (id: string) => void;
  updateSession: (id: string, completed: boolean) => void;
  loading: boolean;
}


const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [sessions, setSessions] = useState<MeditationSession[]>([]);
  const [favoriteStacks, setFavoriteStacks] = useState<FavoriteStack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadUserProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user);
        loadUserProfile(session.user);
      } else {
        setSupabaseUser(null);
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    // If no profile exists (e.g., social auth user), create one with OAuth data
    if (!profile && supabaseUser.email) {
      const oauthData = extractOAuthProfile(supabaseUser);
      const provider = supabaseUser.app_metadata?.provider;
      
      // Create profile with OAuth data
      const newProfileData = {
        id: supabaseUser.id,
        username: oauthData.username || supabaseUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_'),
        full_name: oauthData.full_name || supabaseUser.email.split('@')[0],
        email: supabaseUser.email,
        avatar_url: oauthData.avatar_url || null
      };
      
      await supabase.from('profiles').insert(newProfileData);

      // Fetch the newly created profile
      const { data: newProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();
      
      profile = newProfile;

      // Add to email list if OAuth sign-in (with proper type checking)
      const validProviders = ['google', 'facebook', 'github'];
      if (provider && typeof provider === 'string' && validProviders.includes(provider)) {
        try {
          const nameParts = (oauthData.full_name || '').split(' ');
          await supabase.functions.invoke('add-to-constant-contact', {
            body: { 
              email: supabaseUser.email,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || ''
            }
          });
        } catch (err) {
          console.error('Failed to add to email list:', err);
        }
      }
    }


    if (profile) {
      setUser({
        id: profile.id,
        email: supabaseUser.email || '',
        name: profile.full_name || profile.username || 'User',
        createdAt: profile.created_at,
        emailVerified: supabaseUser.email_confirmed_at !== null
      });
    }
  };



  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user && !data.user.email_confirmed_at) {
        return { success: false, needsVerification: true };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          },
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;

      // Create profile
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          username: name.toLowerCase().replace(/\s+/g, '_'),
          full_name: name,
          email: email
        });

        // Add to Constant Contact
        try {
          const nameParts = name.split(' ');
          await supabase.functions.invoke('add-to-constant-contact', {
            body: { 
              email,
              firstName: nameParts[0] || '',
              lastName: nameParts.slice(1).join(' ') || ''
            }
          });
        } catch (err) {
          console.error('Failed to add to email list:', err);
        }
      }

      return { success: true, needsVerification: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
  };

  const resendVerificationEmail = async () => {
    try {
      if (!supabaseUser?.email) {
        return { success: false, error: 'No email found' };
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: supabaseUser.email,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const signInWithGitHub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/`
        }
      });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const addSession = (sessionData: Omit<MeditationSession, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) return;
    const newSession: MeditationSession = {
      ...sessionData,
      id: Date.now().toString(),
      userId: user.id,
      timestamp: new Date().toISOString()
    };
    const updatedSessions = [...sessions, newSession];
    setSessions(updatedSessions);
    localStorage.setItem('freqyn_sessions', JSON.stringify(updatedSessions));
  };

  const saveFavoriteStack = (stackData: Omit<FavoriteStack, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const newStack: FavoriteStack = {
      ...stackData,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString()
    };
    const updatedStacks = [...favoriteStacks, newStack];
    setFavoriteStacks(updatedStacks);
    localStorage.setItem('freqyn_stacks', JSON.stringify(updatedStacks));
  };

  const deleteFavoriteStack = (id: string) => {
    const updatedStacks = favoriteStacks.filter(stack => stack.id !== id);
    setFavoriteStacks(updatedStacks);
    localStorage.setItem('freqyn_stacks', JSON.stringify(updatedStacks));
  };

  const updateSession = (id: string, completed: boolean) => {
    const updatedSessions = sessions.map(session => 
      session.id === id ? { ...session, completed } : session
    );
    setSessions(updatedSessions);
    localStorage.setItem('freqyn_sessions', JSON.stringify(updatedSessions));
  };

  return (
    <AuthContext.Provider value={{
      user,
      supabaseUser,
      login,
      signup,
      logout,
      resendVerificationEmail,
      signInWithGoogle,
      signInWithFacebook,
      signInWithGitHub,
      sessions: user ? sessions.filter(s => s.userId === user.id) : [],
      favoriteStacks: user ? favoriteStacks.filter(s => s.userId === user.id) : [],
      addSession,
      saveFavoriteStack,
      deleteFavoriteStack,
      updateSession,
      loading
    }}>

      {children}
    </AuthContext.Provider>
  );
};
