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

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Função para verificar status do onboarding
  const checkOnboardingStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('assinaturas')
        .select('onboarding_completed')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking onboarding status:', error);
        return true; // Em caso de erro, não redireciona
      }

      // Se não encontrou registro OU onboarding_completed é false, precisa fazer onboarding
      if (!data || !data.onboarding_completed) {
        console.log('🔄 User needs to complete onboarding');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Exception checking onboarding:', error);
      return true; // Em caso de erro, não redireciona
    }
  };

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
          const convertedUser = convertSupabaseUser(session.user);
          setUser(convertedUser);
          
          // Verificar onboarding apenas em login bem-sucedido (não em page refresh)
          if (event === 'SIGNED_IN') {
            console.log('🔍 Checking onboarding status for user:', convertedUser.id);
            const hasCompletedOnboarding = await checkOnboardingStatus(convertedUser.id);
            
            if (!hasCompletedOnboarding) {
              console.log('➡️ Redirecting to onboarding');
              // Pequeno delay para garantir que o estado foi atualizado
              setTimeout(() => {
                navigate('/onboarding');
              }, 100);
            }
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