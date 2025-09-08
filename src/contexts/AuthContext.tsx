import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Simple User type using only auth.user data
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium?: boolean;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (updates: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Load user data from assinaturas table
const loadUserDataFromAssinaturas = async (authUser: SupabaseUser): Promise<User> => {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('"Nome do cliente", avatar_usuario, is_premium')
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error loading user data from assinaturas:', error);
      // Fallback to auth user data
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        avatar: authUser.user_metadata?.avatar_url || '/avatar1.png',
        isPremium: false,
        joinedAt: authUser.created_at
      };
    }

    if (data) {
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: data["Nome do cliente"] || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        avatar: data.avatar_usuario || authUser.user_metadata?.avatar_url || '/avatar1.png',
        isPremium: data.is_premium || false,
        joinedAt: authUser.created_at
      };
    } else {
      // No data found, use fallback
      return {
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
        avatar: authUser.user_metadata?.avatar_url || '/avatar1.png',
        isPremium: false,
        joinedAt: authUser.created_at
      };
    }
  } catch (error) {
    console.error('Exception loading user data from assinaturas:', error);
    // Fallback to auth user data
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
      avatar: authUser.user_metadata?.avatar_url || '/avatar1.png',
      isPremium: false,
      joinedAt: authUser.created_at
    };
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Check initial session
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          try {
            const userData = await loadUserDataFromAssinaturas(session.user);
            setUser(userData);
          } catch (error) {
            console.error('Error loading user data in checkSession:', error);
            // Fallback to basic user data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              avatar: session.user.user_metadata?.avatar_url || '/avatar1.png',
              isPremium: false,
              joinedAt: session.user.created_at
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    // Set timeout to ensure loading never stays true forever
    timeoutId = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Check session immediately
    checkSession();
    
    // Setup auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        // Clear timeout since we got an auth event
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (session?.user) {
          try {
            const userData = await loadUserDataFromAssinaturas(session.user);
            setUser(userData);
          } catch (error) {
            console.error('Error loading user data in auth state change:', error);
            // Fallback to basic user data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || '',
              avatar: session.user.user_metadata?.avatar_url || '/avatar1.png',
              isPremium: false,
              joinedAt: session.user.created_at
            });
          }
        } else {
          setUser(null);
          
          // Only redirect on actual logout
          if (event === 'SIGNED_OUT') {
            navigate('/');
          }
        }
        
        setLoading(false);
      }
    );
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: null, error: null };
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
        }
      }
    });

    if (error) {
      return { user: null, error: error.message };
    }

    return { user: null, error: null };
  };

  const signOut = async (): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  };

  const updateProfile = async (updates: any): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('assinaturas')
        .upsert({ 
          user_id: user.id, 
          ...updates 
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Reload user data after update
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const userData = await loadUserDataFromAssinaturas(authUser);
        setUser(userData);
      }

      return true;
    } catch (error) {
      console.error('Exception updating profile:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !loading && !!user,
    signIn,
    signUp,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};