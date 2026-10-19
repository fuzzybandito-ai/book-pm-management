import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import supabase from '../lib/supabaseClient';

const AuthContext = createContext(null);

/**
 * Auth provider: holds the current session/user and exposes sign-up, sign-in,
 * and sign-out. Email/password only. Email confirmation stays off.
 */
export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial load
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      setLoading(false);
    });

    // Subscribe to auth changes. Wrap async work to avoid the onAuthStateChange
    // deadlock documented in the bolt-database skill.
    const { subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      (async () => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      })();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { error };
    // Email confirmation is off, so a session is returned immediately.
    return { data };
  }, []);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };
    return { data };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = { session, user, loading, signUp, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
