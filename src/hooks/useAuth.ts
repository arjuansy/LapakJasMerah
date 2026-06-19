import { useEffect, useState } from 'react';
import { supabase } from '../config/supabaseClient';
import { authService } from '../services/authService';
import { AuthState, Profile } from '../types/auth';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    async function loadSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (session && session.user) {
          if (session.user.email && !session.user.email.toLowerCase().endsWith("@webmail.umm.ac.id")) {
            await authService.logout();
            if (mounted) {
              setAuthState({ user: null, profile: null, session: null, loading: false });
            }
            return;
          }

          const profile = await authService.getProfile(session.user.id);
          if (mounted) {
            setAuthState({ user: session.user, profile, session, loading: false });
            // Clean URL hash after successful login from OAuth
            if (window.location.hash.includes('access_token')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }
        } else {
          if (mounted) {
            setAuthState({ user: null, profile: null, session: null, loading: false });
          }
        }
      } catch (error) {
        console.error('Error loading session:', error);
        if (mounted) {
          setAuthState({ user: null, profile: null, session: null, loading: false });
        }
      }
    }

    loadSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        try {
          const profile = await authService.getProfile(session.user.id);
          if (mounted) {
            setAuthState({ user: session.user, profile, session, loading: false });
            // Clean URL hash after successful login from OAuth
            if (window.location.hash.includes('access_token')) {
              window.history.replaceState(null, '', window.location.pathname);
            }
          }
        } catch (err) {
          console.error("Failed to load profile on auth state change", err);
          if (mounted) {
            setAuthState({ user: session.user, profile: null, session, loading: false });
          }
        }
      } else {
        if (mounted) {
          setAuthState({ user: null, profile: null, session: null, loading: false });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (session && session.user) {
        const profile = await authService.getProfile(session.user.id);
        setAuthState({ user: session.user, profile, session, loading: false });
      } else {
        setAuthState({ user: null, profile: null, session: null, loading: false });
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  return { ...authState, refreshSession };
}
