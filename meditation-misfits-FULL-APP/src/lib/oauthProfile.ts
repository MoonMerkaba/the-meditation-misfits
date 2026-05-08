import type { User as SupabaseUser } from '@supabase/supabase-js';

export interface OAuthProfileData {
  full_name?: string;
  avatar_url?: string;
  email?: string;
  username?: string;
  provider?: string;
}

/**
 * Extract profile data from OAuth provider metadata
 */
export const extractOAuthProfile = (supabaseUser: SupabaseUser): OAuthProfileData => {
  const metadata = supabaseUser.user_metadata || {};
  const provider = supabaseUser.app_metadata?.provider;
  
  let profile: OAuthProfileData = {
    email: supabaseUser.email,
    provider: provider
  };

  // Google OAuth
  if (provider === 'google') {
    profile.full_name = metadata.full_name || metadata.name;
    profile.avatar_url = metadata.avatar_url || metadata.picture;
    profile.email = metadata.email || supabaseUser.email;
  }
  
  // Facebook OAuth
  else if (provider === 'facebook') {
    profile.full_name = metadata.full_name || metadata.name;
    profile.avatar_url = metadata.avatar_url || metadata.picture?.data?.url;
    profile.email = metadata.email || supabaseUser.email;
  }
  
  // GitHub OAuth
  else if (provider === 'github') {
    profile.full_name = metadata.full_name || metadata.name || metadata.user_name;
    profile.avatar_url = metadata.avatar_url;
    profile.email = metadata.email || supabaseUser.email;
  }

  // Generate username from email or name
  if (profile.email && !profile.username) {
    profile.username = profile.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
  } else if (profile.full_name && !profile.username) {
    profile.username = profile.full_name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
  }

  return profile;
};

/**
 * Check if profile is complete
 */
export const isProfileComplete = (profile: any): boolean => {
  return !!(
    profile?.full_name &&
    profile?.username &&
    profile?.email
  );
};
