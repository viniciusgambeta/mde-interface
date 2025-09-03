import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session, AuthChangeEvent } from '@supabase/supabase-js';
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
  signOut: () => Promise<void>;
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

// Helper function to convert assinatura data to User
const convertAssinaturaToUser = (authUser: SupabaseUser, assinatura: Assinatura | null): User => {
  console.log('🔄 Converting assinatura to user:', { authUser: authUser.email, assinatura });
  console.log('🎯 DEBUG onboarding_completed from DB:', assinatura?.onboarding_completed, 'type:', typeof assinatura?.onboarding_completed);
  
  return {
    id: authUser.id,
    email: authUser.email || '',
    name: assinatura?.["Nome do cliente"] || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
    avatar: assinatura?.avatar_usuario || authUser.user_metadata?.avatar_url || '/avatar1.png',
    isPremium: assinatura?.is_premium || assinatura?.["Status da assinatura"] === 'active' || false,
    joinedAt: assinatura?.["Data de criação"] || authUser.created_at,
    onboardingCompleted: assinatura?.onboarding_completed === true,
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

// Helper function to fetch user data from assinaturas
const fetchAndConvertUser = async (authUser: SupabaseUser): Promise<User> => {
  console.log('🔍 Fetching user data for:', authUser.email);
  
  try {
    console.log('🔍 Querying assinaturas table for user_id:', authUser.id);
    
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
      console.error('❌ Error in assinaturas query:', error.message);
      console.log('🔄 Continuing with auth data only due to query error');
      return convertAssinaturaToUser(authUser, null);
    }

    console.log('📊 Assinatura data found:', !!assinatura, 'onboarding_completed:', assinatura?.onboarding_completed);
    return convertAssinaturaToUser(authUser, assinatura);
    
  } catch (error) {
    console.error('❌ Exception in assinaturas query:', error instanceof Error ? error.message : 'Unknown error');
    // Return user with auth data only if assinaturas query fails
    return convertAssinaturaToUser(authUser, null);
  }
};
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  

  // Initialize auth state
  const initializeAuth = async () => {
    try {
      console.log('🚀 Initializing auth...');
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error getting session:', error.message);
        return;
      }

      if (session?.user) {
        console.log('✅ Session found, fetching user data...');
        const userData = await fetchAndConvertUser(session.user);
        setUser(userData);
        setShowOnboarding(userData.onboardingCompleted === false);
        console.log('✅ User data set:', userData.email);
        console.log('🎯 showOnboarding set to:', userData.onboardingCompleted === false);
      } else {
      }
    } catch (error) {
      console.error('💥 Error initializing auth:', error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, session: Session | null) => {
      console.log('🔄 Auth state changed:', event);
      
      // Prevent double execution in StrictMode
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = await fetchAndConvertUser(session.user);
        setUser(userData);
        setShowOnboarding(userData.onboardingCompleted === false);
        console.log('🎯 Auth change - showOnboarding set to:', userData.onboardingCompleted === false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setShowOnboarding(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      console.log('🔐 Attempting sign in for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Sign in error:', error.message);
        return { user: null, error: error.message };
      }

      if (data.user) {
        const userData = await fetchAndConvertUser(data.user);
        setUser(userData);
        setShowOnboarding(userData.onboardingCompleted === false);
        console.log('✅ Sign in successful for:', userData.email);
        console.log('🎯 Sign in - showOnboarding set to:', userData.onboardingCompleted === false);
        return { user: userData, error: null };
      }

      return { user: null, error: 'Erro desconhecido' };
    } catch (error) {
      console.error('💥 Exception during sign in:', error);
      return { user: null, error: 'Erro inesperado durante o login' };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      console.log('📝 Attempting sign up for:', email);
      
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
        console.error('❌ Sign up error:', error.message);
        return { user: null, error: error.message };
      }

      if (data.user) {
        // Create assinatura record with cadastro_mde = true
        const assinaturaData = {
          "Nome do cliente": name,
          "Email do cliente": email,
          user_id: data.user.id,
          onboarding_completed: false,
          is_premium: false,
          cadastro_mde: true
        };

        console.log('📝 Creating assinatura record:', assinaturaData);

        const { error: assinaturaError } = await supabase
          .from('assinaturas')
          .insert([assinaturaData]);

        if (assinaturaError) {
          console.error('❌ Error creating assinatura:', assinaturaError.message);
        } else {
          console.log('✅ Assinatura record created successfully');
        }

        const userData = await fetchAndConvertUser(data.user);
        setUser(userData);
        setShowOnboarding(userData.onboardingCompleted === false);
        console.log('✅ Sign up successful for:', userData.email);
        console.log('🎯 Sign up - showOnboarding set to:', userData.onboardingCompleted === false);
        return { user: userData, error: null };
      }

      return { user: null, error: 'Erro desconhecido' };
    } catch (error) {
      console.error('💥 Exception during sign up:', error);
      return { user: null, error: 'Erro inesperado durante o cadastro' };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      console.log('🚪 Signing out...');
      await supabase.auth.signOut();
      setUser(null);
      console.log('✅ Sign out successful');
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  };

  const updateProfile = async (data: Partial<Assinatura>): Promise<boolean> => {
    if (!user) {
      console.error('❌ No user found for profile update');
      return false;
    }

    try {
      console.log('🔄 Starting profile update for user:', user.id);
      console.log('📤 Update data received:', data);

      // Prepare the update data using exact field names from assinaturas table
      const updateData: any = {};

      // Map the fields correctly
      if (data["Nome do cliente"] !== undefined) {
        updateData["Nome do cliente"] = data["Nome do cliente"];
      }
      
      if (data["Telefone do cliente"] !== undefined) {
        updateData["Telefone do cliente"] = data["Telefone do cliente"];
      }
      
      if (data.phone_number !== undefined) {
        updateData.phone_number = data.phone_number;
      }
      
      if (data.avatar_usuario !== undefined) {
        updateData.avatar_usuario = data.avatar_usuario;
      }
      
      if (data.bio !== undefined) {
        updateData.bio = data.bio;
      }
      
      if (data.instagram !== undefined) {
        updateData.instagram = data.instagram;
      }
      
      if (data.linkedin !== undefined) {
        updateData.linkedin = data.linkedin;
      }
      
      if (data.experiencia_ia !== undefined) {
        updateData.experiencia_ia = data.experiencia_ia;
      }
      
      if (data.objetivo_principal !== undefined) {
        updateData.objetivo_principal = data.objetivo_principal;
      }
      
      if (data.tipo_trabalho !== undefined) {
        updateData.tipo_trabalho = data.tipo_trabalho;
      }
      
      if (data.porte_negocio !== undefined) {
        updateData.porte_negocio = data.porte_negocio;
      }
      
      if (data.onboarding_completed !== undefined) {
        updateData.onboarding_completed = data.onboarding_completed;
      }
      
      if (data.onboarding_data !== undefined) {
        updateData.onboarding_data = data.onboarding_data;
      }
      
      if (data.is_premium !== undefined) {
        updateData.is_premium = data.is_premium;
      }

      console.log('📋 Final update payload:', updateData);

      // Use upsert instead of update/insert pattern
      const { error } = await supabase
        .from('assinaturas')
        .upsert({ 
          user_id: user.id, 
          ...updateData 
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Profile upsert error:', error.message);
        throw error;
      }

      console.log('✅ Profile updated successfully');

      // Refresh user data
      await refreshUser();
      
      return true;
    } catch (error) {
      console.error('❌ Profile update error:', error instanceof Error ? error.message : 'Unknown error');
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const userData = await fetchAndConvertUser(authUser);
        setUser(userData);
        setShowOnboarding(userData.onboardingCompleted === false);
        console.log('🎯 Refresh - showOnboarding set to:', userData.onboardingCompleted === false);
      }
    } catch (error) {
      console.error('❌ Error refreshing user:', error);
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    if (!user) {
      console.error('❌ No user found for onboarding completion');
      return;
    }

    try {
      console.log('✅ Completing onboarding for user:', user.id);
      
      const { error } = await supabase
        .from('assinaturas')
        .upsert({ 
          user_id: user.id,
          onboarding_completed: true 
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Error completing onboarding:', error.message);
        throw error;
      }

      setShowOnboarding(false);
      await refreshUser();
      console.log('✅ Onboarding completed successfully');
    } catch (error) {
      console.error('❌ Error completing onboarding:', error);
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