import { Session } from '@supabase/supabase-js';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

WebBrowser.maybeCompleteAuthSession();
const REDIRECT_URL = Linking.createURL('auth/callback');

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'apple' | 'github') => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<{ action: string }>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signInWithProvider: async () => {},
  signUpWithEmail: async () => ({ action: 'confirm_email' }),
  signInWithEmail: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithProvider = async (provider: 'google' | 'apple' | 'github') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: REDIRECT_URL,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    // Open in-app browser instead of external browser
    if (data?.url) {
      const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URL);

      if (result.type === 'success') {
        const url = result.url;
        const { params } = QueryParams.getQueryParams(url);

        if (params.access_token && params.refresh_token) {
          await supabase.auth.setSession({
            access_token: params.access_token,
            refresh_token: params.refresh_token,
          });
        }
      }
    }
  };

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: REDIRECT_URL,
      },
    });

    // If Supabase errors, fallback to magic link
    if (error) {
      console.warn('Sign up failed, falling back to magic link:', error.message);

      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: REDIRECT_URL,
        },
      });

      if (otpError) {
        console.error('Magic link error:', otpError);
        throw otpError;
      }

      return { action: 'magic_link' as const };
    }

    // Email confirmation required (expected for new users)
    if (data.user && !data.session) {
      return { action: 'confirm_email' as const };
    }

    // Rare case: auto signed in
    if (data.session) {
      return { action: 'signed_in' as const };
    }

    // Final fallback (should not happen, but keeps UI stable)
    return { action: 'check_email' as const };
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    console.log('Sign in success:', data);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, loading, signInWithProvider, signUpWithEmail, signInWithEmail, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
