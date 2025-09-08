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
  joinedAt: string;
  isPremium?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Convert Supabase user to our User type
const convertSupabaseUser = (authUser: SupabaseUser): User => {
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
    avatar: authUser.user_metadata?.avatar_url || '/avatar1.png',
    joinedAt: authUser.created_at
  };
};

// Function to load user data from assinaturas table
const loadUserDataFromAssinaturas = async (userId: string): Promise<Partial<User>> => {
  try {
    const { data, error } = await supabase
      .from('assinaturas')
      .select('"Nome do cliente", avatar_usuario, is_premium')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading user data from assinaturas:', error);
      return {};
    }

    if (data) {
      return {
        name: data["Nome do cliente"] || undefined,
        avatar: data.avatar_usuario || undefined,
        isPremium: data.is_premium || false
      };
    }

    return {};
  } catch (error) {
    console.error('Exception loading user data from assinaturas:', error);
    return {};
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
          setUser(convertSupabaseUser(session.user));
        } else {
          setUser(null);
        }
        const baseUser = convertSupabaseUser(session.user);
        
        // Load additional data from assinaturas table
        const additionalData = await loadUserDataFromAssinaturas(session.user.id);
        
        // Merge the data, keeping base user data as fallback
        const enrichedUser = {
          ...baseUser,
          name: additionalData.name || baseUser.name,
          avatar: additionalData.avatar || baseUser.avatar,
          isPremium: additionalData.isPremium || false
        };
        
        setUser(enrichedUser);
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
          const baseUser = convertSupabaseUser(session.user);
          
          // Load additional data from assinaturas table
          const additionalData = await loadUserDataFromAssinaturas(session.user.id);
          
          // Merge the data, keeping base user data as fallback
          const enrichedUser = {
            ...baseUser,
            name: additionalData.name || baseUser.name,
            avatar: additionalData.avatar || baseUser.avatar,
            isPremium: additionalData.isPremium || false
          };
          
          setUser(enrichedUser);
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

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !loading && !!user,
    signIn,
    signUp,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};