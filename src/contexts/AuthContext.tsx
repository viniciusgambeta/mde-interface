import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium: boolean;
  joinedAt: string;
  onboardingCompleted: boolean;
  phone?: string;
  bio?: string;
  instagram?: string;
  linkedin?: string;
  experienciaIa?: string;
  objetivoPrincipal?: string;
  tipoTrabalho?: string;
  porteNegocio?: string;
}

interface Assinatura {
  "ID da assinatura": string;
  "Nome do cliente": string;
  "Email do cliente": string;
  "Telefone do cliente"?: number;
  "Status da assinatura"?: string;
  "Data de criação"?: string;
  user_id?: string;
  avatar_usuario?: string;
  experiencia_ia?: string;
  objetivo_principal?: string;
  tipo_trabalho?: string;
  porte_negocio?: string;
  instagram?: string;
  linkedin?: string;
  bio?: string;
  phone_number?: string;
  is_premium?: boolean;
  onboarding_completed?: boolean;
  onboarding_data?: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  showOnboarding: boolean;
  completeOnboarding: () => Promise<void>;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<{ error: string | null }>;
  updateProfile: (data: Partial<Assinatura>) => Promise<boolean>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to convert any value to boolean
const toBool = (v: any): boolean => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'string') return ['true', 't', '1', 'yes', 'y'].includes(v.toLowerCase());
  if (typeof v === 'number') return v === 1;
  return false;
};

// Helper function to convert assinatura data to User
const convertAssinaturaToUser = (authUser: SupabaseUser, assinatura: Assinatura | null): User => {
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: assinatura?.["Nome do cliente"] || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
    avatar: assinatura?.avatar_usuario || authUser.user_metadata?.avatar_url || '/avatar1.png',
    isPremium: toBool(assinatura?.is_premium) || assinatura?.["Status da assinatura"] === 'active' || false,
    joinedAt: assinatura?.["Data de criação"] || authUser.created_at,
    onboardingCompleted: toBool(assinatura?.onboarding_completed),
    phone: assinatura?.phone_number || assinatura?.["Telefone do cliente"]?.toString() || '',
    bio: assinatura?.bio || '',
    instagram: assinatura?.instagram || '',
    linkedin: assinatura?.linkedin || '',
    experienciaIa: assinatura?.experiencia_ia || '',
    objetivoPrincipal: assinatura?.objetivo_principal || '',
    tipoTrabalho: assinatura?.tipo_trabalho || '',
    porteNegocio: assinatura?.porte_negocio || ''
  };
};

// Simple user data fetch - no abort, no retry, no timeout
const fetchUserData = async (authUser: SupabaseUser): Promise<User> => {
  try {
    const { data: assinatura, error } = await supabase
      .from('assinaturas')
      .select(`
        "ID da assinatura",
        "Nome do cliente",
        "Email do cliente", 
        "Telefone do cliente",
        "Status da assinatura",
        "Data de criação",
        user_id,
        avatar_usuario,
        experiencia_ia,
        objetivo_principal,
        tipo_trabalho,
        porte_negocio,
        instagram,
        linkedin,
        bio,
        phone_number,
        is_premium,
        onboarding_completed,
        onboarding_data
      `)
      .eq('user_id', authUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching assinatura:', error.message);
    }

    return convertAssinaturaToUser(authUser, assinatura);
  } catch (error) {
    console.error('Exception fetching user data:', error);
    return convertAssinaturaToUser(authUser, null);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Initialize auth and setup listener - run once only
  useEffect(() => {
    console.log('🚀 AuthProvider: useEffect started');
    let timeoutId: NodeJS.Timeout;
    
    // Check session immediately on mount
    const checkInitialSession = async () => {
      console.log('🔍 AuthProvider: Checking initial session...');
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('🔍 AuthProvider: Initial session result:', !!session);
        
        if (session?.user) {
          console.log('🔍 AuthProvider: Session found, loading user data...');
          const userData = await fetchUserData(session.user);
          console.log('🔍 AuthProvider: User data loaded:', userData.email);
          setUser(userData);
          setShowOnboarding(!userData.onboardingCompleted);
        } else {
          console.log('🔍 AuthProvider: No session found');
          setUser(null);
          setShowOnboarding(false);
        }
        console.log('🔍 AuthProvider: Setting loading to false (initial check)');
        setLoading(false);
      } catch (error) {
        console.error('❌ AuthProvider: Error checking initial session:', error);
        setUser(null);
        setShowOnboarding(false);
        console.log('🔍 AuthProvider: Setting loading to false (error)');
        setLoading(false);
      }
    };
    
    // Check session immediately
    console.log('🔍 AuthProvider: Starting initial session check...');
    checkInitialSession();
    
    // Safety timeout - ensure loading never stays true forever
    timeoutId = setTimeout(() => {
      console.warn('⏰ AuthProvider: Timeout reached, setting loading to false');
      setLoading(false);
    }, 5000);
    
    // Setup auth listener - Supabase automatically fires INITIAL_SESSION event
    console.log('🔍 AuthProvider: Setting up auth listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('🔄 AuthProvider: Auth state change:', event, 'hasSession:', !!session);
      
      // Clear timeout since we got an auth event
      if (timeoutId) {
        console.log('🔄 AuthProvider: Clearing timeout due to auth event');
        clearTimeout(timeoutId);
      }

      try {
        if (session?.user) {
          console.log('🔄 AuthProvider: Loading user data for auth event...');
          const userData = await fetchUserData(session.user);
          console.log('🔄 AuthProvider: User data loaded for auth event:', userData.email);
          setUser(userData);
          setShowOnboarding(!userData.onboardingCompleted);
        } else {
          console.log('🔄 AuthProvider: No session in auth event');
          setUser(null);
          setShowOnboarding(false);
          
          // Only redirect on actual logout, not initial load
          if (event === 'SIGNED_OUT') {
            console.log('🔄 AuthProvider: User signed out, redirecting...');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('❌ AuthProvider: Error in auth state change:', error);
        setUser(null);
        setShowOnboarding(false);
      } finally {
        // Set loading false after any auth state change
        console.log('🔄 AuthProvider: Setting loading to false (auth event)');
        setLoading(false);
      }
    }
    )
    // Cleanup on unmount
    return () => {
      console.log('🧹 AuthProvider: Cleaning up...');
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      subscription.unsubscribe();
      }
  }
  )

  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      return { user: null, error: null };
    } catch (error) {
      return { user: null, error: 'Erro inesperado durante o login' };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> => {
    try {
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

      if (data.user) {
        // Create assinatura record
        const assinaturaData = {
          "Nome do cliente": name,
          "Email do cliente": email,
          user_id: data.user.id,
          onboarding_completed: false,
          is_premium: false,
          cadastro_mde: true
        };

        const { error: assinaturaError } = await supabase
          .from('assinaturas')
          .insert([assinaturaData]);

        if (assinaturaError) {
          console.error('Error creating assinatura:', assinaturaError.message);
        }

        // Force logout to show success screen
        await supabase.auth.signOut();
        
        return { user: null, error: null };
      }

      return { user: null, error: 'Erro desconhecido' };
    } catch (error) {
      return { user: null, error: 'Erro inesperado durante o cadastro' };
    }
  };

  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        return { error: error.message };
      }
      
      return { error: null };
    } catch (error) {
      return { error: 'Erro inesperado durante o logout' };
    }
  };

  const updateProfile = async (data: Partial<Assinatura>): Promise<boolean> => {
    if (!user) {
      return false;
    }

    try {
      const { error } = await supabase
        .from('assinaturas')
        .upsert({ 
          user_id: user.id, 
          ...data 
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Profile update error:', error.message);
        return false;
      }

      // Refresh user data
      await refreshUser();
      
      return true;
    } catch (error) {
      console.error('Profile update exception:', error);
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        setUser(userData);
        setShowOnboarding(!userData.onboardingCompleted);
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    if (!user) {
      return;
    }

    try {
      const success = await updateProfile({ onboarding_completed: true });
      
      if (success) {
        setShowOnboarding(false);
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    showOnboarding,
    completeOnboarding,
    isAuthenticated: !loading && !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};