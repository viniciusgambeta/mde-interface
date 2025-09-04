import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  suppressRedirects: (ms: number) => void;
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
  console.log('🔄 Converting assinatura to user:', { 
    authUser: authUser.email, 
    hasAssinatura: !!assinatura,
    onboardingCompleted: assinatura?.onboarding_completed
  });
  
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

// Helper function to fetch user data from assinaturas table
const fetchUserData = async (authUser: SupabaseUser): Promise<User> => {
  console.log('🔍 Fetching user data for:', authUser.email);
  
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
      console.error('❌ Error fetching assinatura:', error.message);
      // Return user with auth data only if assinaturas query fails
      return convertAssinaturaToUser(authUser, null);
    }

    console.log('📊 Assinatura data:', { 
      found: !!assinatura, 
      onboardingCompleted: assinatura?.onboarding_completed 
    });
    
    return convertAssinaturaToUser(authUser, assinatura);
    
  } catch (error) {
    console.error('❌ Exception fetching user data:', error);
    // Return user with auth data only if exception occurs
    return convertAssinaturaToUser(authUser, null);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [initialized, setInitialized] = useState(false);
  
  // 🔒 Supressor de redirecionamentos durante operações críticas
  const suppressRedirectsRef = React.useRef(false);
  const releaseTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  // Função para suprimir redirecionamentos por X milissegundos
  const suppressRedirects = (ms: number) => {
    console.log(`🔒 Suprimindo redirecionamentos por ${ms}ms`);
    if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    suppressRedirectsRef.current = true;
    releaseTimerRef.current = setTimeout(() => {
      suppressRedirectsRef.current = false;
      console.log('🔓 Redirecionamentos liberados');
    }, ms);
  };

  // Função para verificar se é rota protegida
  const isProtectedRoute = (path: string) => {
    const openRoutes = ['/registro', '/redefinir-senha', '/privacidade'];
    return !openRoutes.some(route => path.startsWith(route));
  };

  // Handle auth state changes (both initial and subsequent)
  const handleAuthStateChange = async (session: Session | null) => {
    console.log('🔄 Handling auth state change:', { hasSession: !!session, suppressActive: suppressRedirectsRef.current });
    
    // 🚫 Se estamos suprimindo redirecionamentos, não faz nada
    if (suppressRedirectsRef.current) {
      console.log('🔒 Redirecionamentos suprimidos, ignorando mudança de auth');
      return;
    }
    
    // 🚫 Se estamos suprimindo redirecionamentos, não faz nada
    if (suppressRedirectsRef.current) {
      console.log('🔒 Redirecionamentos suprimidos, ignorando mudança de auth');
      return;
    }
    
    if (session?.user) {
      try {
        const userData = await fetchUserData(session.user);
        setUser(userData);
        setShowOnboarding(!userData.onboardingCompleted);
        console.log('✅ User data set:', { 
          email: userData.email, 
          onboardingCompleted: userData.onboardingCompleted,
          showOnboarding: !userData.onboardingCompleted
        });
        
        // 🔄 Guard: redireciona usuário logado para home se estiver em rota de auth
        if (location.pathname === '/registro' || location.pathname === '/redefinir-senha') {
          console.log('🔄 Usuário logado em rota de auth, redirecionando para home');
          navigate('/');
        }
      } catch (error) {
        console.error('❌ Error handling auth state change:', error);
        setUser(null);
        setShowOnboarding(false);
      }
    } else {
      console.log('🚪 No session, clearing user data');
      setUser(null);
      setShowOnboarding(false);
      
      // 🔄 Guard: redireciona usuário não logado para home se estiver em rota protegida
      if (isProtectedRoute(location.pathname) && location.pathname !== '/') {
        console.log('🔄 Usuário não logado em rota protegida, redirecionando para home');
        navigate('/');
      }
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error.message);
        } else {
          await handleAuthStateChange(session);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
      } finally {
        setLoading(false);
        setInitialized(true);
        console.log('✅ Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    if (!initialized) return;

    console.log('👂 Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('🔄 Auth state changed:', event, 'suppressActive:', suppressRedirectsRef.current);
        
        // 🚫 Se estamos suprimindo redirecionamentos, não faz nada
        if (suppressRedirectsRef.current) {
          console.log('🔒 Redirecionamentos suprimidos, ignorando evento:', event);
          return;
        }
        
        // Handle all auth events through the same function
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await handleAuthStateChange(session);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setShowOnboarding(false);
          console.log('🚪 User signed out, state cleared');
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth listener');
      subscription.unsubscribe();
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
      }
    };
  }, [initialized]);

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

      console.log('✅ Sign in successful, auth state change will handle user data');
      return { user: null, error: null }; // User will be set by auth state change
    } catch (error) {
      console.error('💥 Exception during sign in:', error);
      return { user: null, error: 'Erro inesperado durante o login' };
    }
  };

  const signUp = async (email: string, password: string, name: string): Promise<{ user: User | null; error: string | null }> => {
    try {
      console.log('📝 Attempting sign up for:', email);
      
      // 🔒 Suprime redirecionamentos por 10 segundos durante o signup
      suppressRedirects(10000);
      
      // 🔒 Suprime redirecionamentos por 5 segundos durante o signup
      suppressRedirects(5000);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
        
        // 🚪 Força logout e show success screen
        console.log('🚪 Forçando logout após signup para mostrar tela de sucesso');
        await supabase.auth.signOut();
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
        suppressRedirectsRef.current = false; // Libera redirecionamentos em caso de erro
        suppressRedirectsRef.current = false; // Libera redirecionamentos em caso de erro
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

        console.log('📝 Creating assinatura record');

        const { error: assinaturaError } = await supabase
          .from('assinaturas')
          .insert([assinaturaData]);

        if (assinaturaError) {
          console.error('❌ Error creating assinatura:', assinaturaError.message);
        } else {
          console.log('✅ Assinatura record created successfully');
        }

        // 🚪 Força logout imediato para evitar auto-login
        console.log('🚪 Forçando logout após signup para mostrar tela de sucesso');
        await supabase.auth.signOut();
        
        console.log('✅ Sign up successful, auth state change will handle user data');
        return { user: null, error: null };
      }

      return { user: null, error: 'Erro desconhecido' };
    } catch (error) {
      console.error('💥 Exception during sign up:', error);
      suppressRedirectsRef.current = false; // Libera redirecionamentos em caso de exceção
      suppressRedirectsRef.current = false; // Libera redirecionamentos em caso de exceção
      return { user: null, error: 'Erro inesperado durante o cadastro' };
    }
  };

  const signOut = async (): Promise<{ error: string | null }> => {
    try {
      console.log('🚪 Signing out...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Error signing out:', error.message);
        return { error: error.message };
      }
      
      console.log('✅ Sign out successful, auth state change will handle cleanup');
      return { error: null };
    } catch (error) {
      console.error('❌ Exception during sign out:', error);
      return { error: 'Erro inesperado durante o logout' };
    }
  };

  const updateProfile = async (data: Partial<Assinatura>): Promise<boolean> => {
    if (!user) {
      console.error('❌ No user found for profile update');
      return false;
    }

    try {
      console.log('🔄 Updating profile for user:', user.id);
      console.log('📤 Update data:', data);

      const { error } = await supabase
        .from('assinaturas')
        .upsert({ 
          user_id: user.id, 
          ...data 
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('❌ Profile update error:', error.message);
        return false;
      }

      console.log('✅ Profile updated successfully');
      
      // Refresh user data
      await refreshUser();
      
      return true;
    } catch (error) {
      console.error('❌ Profile update exception:', error);
      return false;
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const userData = await fetchUserData(authUser);
        setUser(userData);
        setShowOnboarding(!userData.onboardingCompleted);
        console.log('🔄 User data refreshed');
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
      
      const success = await updateProfile({ onboarding_completed: true });
      
      if (success) {
        setShowOnboarding(false);
        console.log('✅ Onboarding completed successfully');
      } else {
        console.error('❌ Failed to complete onboarding');
      }
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
    refreshUser,
    suppressRedirects
    suppressRedirects
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};