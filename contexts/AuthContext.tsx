import { Session } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRedirectUrl, supabase } from '../lib/supabase';

// Handle auth state changes when the app returns from the browser
WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  session: Session | null;
  loading: boolean;
  signInWithProvider: (provider: 'google' | 'apple' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  signInWithProvider: async () => {},
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
    // Use Expo's scheme for deep linking
    const redirectTo = getRedirectUrl();

    console.log('Redirecting to:', redirectTo);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      console.error('Sign in error:', error);
      throw error;
    }

    if (data?.url) {
      await WebBrowser.openBrowserAsync(data.url);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, signInWithProvider, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
