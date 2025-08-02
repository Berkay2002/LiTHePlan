// lib/auth-context.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/utils/supabase/client';
import type { AuthResponse } from '@supabase/supabase-js';

interface AuthUser {
  sub: string;
  email?: string;
  username?: string;
  aud: string;
  role: string;
  iat: number;
  exp: number;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string, username?: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to fetch user profile data including username
  const fetchUserProfile = async (userId: string): Promise<{ username?: string }> => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .single();
      
      if (error || !data) {
        console.warn('Could not fetch user profile:', error);
        return {};
      }
      
      return { username: data.username };
    } catch (err) {
      console.warn('Error fetching user profile:', err);
      return {};
    }
  };

  useEffect(() => {
    // ✨ Ultra-fast auth check using new JWT signing keys (2-3ms)
    const checkAuth = async () => {
      const startTime = Date.now();
      
      const supabase = createClient();
      const { data: claims } = await supabase.auth.getClaims();
      console.log(`Auth check completed in ${Date.now() - startTime}ms`); // Should be 2-3ms!
      
      if (claims?.claims.sub) {
        // Set user immediately with basic info to stop loading
        setUser({
          ...claims.claims as AuthUser,
          username: undefined // Will be set async
        });
        setLoading(false);
        
        // Fetch username from profile async (don't block UI)
        fetchUserProfile(claims.claims.sub).then(profile => {
          setUser({
            ...claims.claims as AuthUser,
            username: profile.username
          });
        }).catch(error => {
          console.warn('Failed to fetch user profile:', error);
          // User is still valid, just no username
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event, session ? 'Session exists' : 'No session');
        
        if (session) {
          const supabase = createClient();
          const { data: claims } = await supabase.auth.getClaims();
          console.log('👤 User claims:', claims?.claims);
          
          if (claims?.claims.sub) {
            // Set loading to false immediately with basic user info
            setUser({
              ...claims.claims as AuthUser,
              username: undefined // Will be set async
            });
            setLoading(false);
            
            // Fetch username from profile async (don't block UI)
            fetchUserProfile(claims.claims.sub).then(profile => {
              setUser({
                ...claims.claims as AuthUser,
                username: profile.username
              });
            }).catch(error => {
              console.warn('Failed to fetch user profile:', error);
              // User is still valid, just no username
            });
          } else {
            setUser(null);
            setLoading(false);
          }
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const supabase = createClient();
    return await supabase.auth.signInWithPassword({ email, password });
  };

  const signUp = async (email: string, password: string, username?: string): Promise<AuthResponse> => {
    const supabase = createClient();
    return await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          username: username || null
        }
      }
    });
  };

  const signOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}