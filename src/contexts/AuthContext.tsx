```typescript
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

// Helper function to fetch user data from assinaturas and convert to User interface
const fetchUserData = async (authUser: SupabaseUser): Promise<User> => {
  console.log('🔍 fetchUserData: Fetching user data for authUser ID:', authUser.id);

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
      console.error('❌ fetchUserData: Error fetching assinatura:', error.message);
      // Proceed with partial user data if there's an error fetching from 'assinaturas'
    }

    const convertedUser: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: assinatura?.["Nome do cliente"] || authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
      avatar: assinatura?.avatar_usuario || authUser.user_metadata?.avatar_url || '/avatar1.png',
      isPremium: toBool(assinatura?.is_premium) || assinatura?.["Status da assinatura"] === 'active',
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
    console.log('✅ fetchUserData: Converted user data:', convertedUser);
    return convertedUser;

  } catch (error) {
    console.error('💥 fetchUserData: Exception fetching user data:', error);
    // Fallback to basic user data if any exception occurs
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || '',
      avatar: authUser.user_metadata?.avatar_url || '/avatar1.png',
      isPremium: false,
      joinedAt: authUser.created_at,
      onboardingCompleted: false,
      phone: '', bio: '', instagram: '', linkedin: '', experienciaIa: '',
      objetivoPrincipal: '', tipoTrabalho: '', porteNegocio: ''
    };
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Effect for initial session check and auth state changes
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    const handleAuthStateChange = async (event: AuthChangeEvent, session: Session | null) => {
      if (!isMounted) return;

      console.log(`🔄 AuthProvider: Auth state changed: ${event}`);

      if (session?.user) {
        // User is signed in or session is initialized
        try {
          const fetchedUser = await fetchUserData(session.user);
          if (isMounted) {
            setUser(fetchedUser);
            setShowOnboarding(!fetchedUser.onboardingCompleted);
            console.log(`✅ AuthProvider: User set: ${fetchedUser.email}, Onboarding needed: ${!fetchedUser.onboardingCompleted}`);
          }
        } catch (error) {
          console.error('❌ AuthProvider: Error fetching user data on auth change:', error);
          if (isMounted) {
            setUser(null); // Clear user if data fetch fails
            setShowOnboarding(false);
          }
        }
      } else {
        // User is signed out or no session
        if (isMounted) {
          setUser(null);
          setShowOnboarding(false);
          console.log('🚪 AuthProvider: User signed out or no session.');
        }
      }
      // Always set loading to false after initial session check or any auth change
      if (isMounted && loading) { // Only set loading to false if it's currently true
        setLoading(false);
        console.log('🏁 AuthProvider: Loading set to false.');
      }
    };

    // Initial session check
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ AuthProvider: Error getting initial session:', error.message);
      }
      handleAuthStateChange('INITIAL_SESSION', session); // Manually trigger handler for initial state
    });

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Cleanup subscription on unmount
    return () => {
      isMounted = false;
      subscription.unsubscribe();
      console.log('🧹 AuthProvider: Auth subscription unsubscribed.');
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  const signIn = async (email: string, password: string): Promise<{ user: User | null; error: string | null }> => {
    console.log('🔐 signIn: Attempting sign in for:', email);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error('❌ signIn: Sign in error:', error.message);
      return { user: null, error: error.message };
    }
    // The onAuthStateChange listener will handle updating the user state
    return { user: null, error: null };
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> => {
    console.log('📝 signUp: Attempting sign up for:', email);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) {
      console.error('❌ signUp: Sign up error:', error.message);
      return { user: null, error: error.message };
    }
    // The onAuthStateChange listener will handle updating the user state
    return { user: null, error: null };
  };

  const signOut = async (): Promise<{ error: string | null }> => {
    console.log('🚪 signOut: Signing out...');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ signOut: Sign out error:', error.message);
      return { error: error.message };
    }
    // The onAuthStateChange listener will handle clearing the user state
    return { error: null };
  };

  const updateProfile = async (data: Partial<Assinatura>): Promise<boolean> => {
    if (!user) {
      console.error('❌ updateProfile: No user found for profile update.');
      return false;
    }
    console.log('🔄 updateProfile: Starting profile update for user ID:', user.id, 'with data:', data);

    try {
      const updatePayload: Partial<Assinatura> = { user_id: user.id };

      // Map incoming data to Assinatura table columns
      if (data["Nome do cliente"] !== undefined) updatePayload["Nome do cliente"] = data["Nome do cliente"];
      if (data["Telefone do cliente"] !== undefined) updatePayload["Telefone do cliente"] = data["Telefone do cliente"];
      if (data.phone_number !== undefined) updatePayload.phone_number = data.phone_number;
      if (data.avatar_usuario !== undefined) updatePayload.avatar_usuario = data.avatar_usuario;
      if (data.bio !== undefined) updatePayload.bio = data.bio;
      if (data.instagram !== undefined) updatePayload.instagram = data.instagram;
      if (data.linkedin !== undefined) updatePayload.linkedin = data.linkedin;
      if (data.experiencia_ia !== undefined) updatePayload.experiencia_ia = data.experiencia_ia;
      if (data.objetivo_principal !== undefined) updatePayload.objetivo_principal = data.objetivo_principal;
      if (data.tipo_trabalho !== undefined) updatePayload.tipo_trabalho = data.tipo_trabalho;
      if (data.porte_negocio !== undefined) updatePayload.porte_negocio = data.porte_negocio;
      if (data.onboarding_completed !== undefined) updatePayload.onboarding_completed = data.onboarding_completed;
      if (data.onboarding_data !== undefined) updatePayload.onboarding_data = data.onboarding_data;
      if (data.is_premium !== undefined) updatePayload.is_premium = data.is_premium;

      console.log('📋 updateProfile: Final payload for upsert:', updatePayload);

      const { error } = await supabase
        .from('assinaturas')
        .upsert(updatePayload, { onConflict: 'user_id' });

      if (error) {
        console.error('❌ updateProfile: Profile upsert error:', error.message);
        return false;
      }

      console.log('✅ updateProfile: Profile updated successfully. Refreshing user data...');
      await refreshUser(); // Refresh local user state after successful update
      return true;
    } catch (error) {
      console.error('💥 updateProfile: Exception during profile update:', error);
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    console.log('🔄 refreshUser: Refreshing user session and data.');
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const fetchedUser = await fetchUserData(authUser);
        setUser(fetchedUser);
        setShowOnboarding(!fetchedUser.onboardingCompleted);
        console.log('✅ refreshUser: User data refreshed.');
      } else {
        setUser(null);
        setShowOnboarding(false);
        console.log('🚪 refreshUser: No authenticated user found.');
      }
    } catch (error) {
      console.error('❌ refreshUser: Error refreshing user data:', error);
      setUser(null);
      setShowOnboarding(false);
    }
  };

  const completeOnboarding = async (): Promise<void> => {
    console.log('✅ completeOnboarding: Attempting to complete onboarding.');
    if (!user) {
      console.error('❌ completeOnboarding: No user found to complete onboarding.');
      return;
    }
    const success = await updateProfile({ onboarding_completed: true });
    if (success) {
      console.log('✅ completeOnboarding: Onboarding marked as complete.');
      // The updateProfile call already triggers refreshUser, which updates showOnboarding
    } else {
      console.error('❌ completeOnboarding: Failed to mark onboarding as complete.');
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
```