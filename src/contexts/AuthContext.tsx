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
  isLoadingInitial: boolean;
  isUserSessionRefreshing: boolean;
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
let currentFetchController: AbortController | null = null;
let isPageVisible = true;

// Track page visibility to prevent unnecessary requests
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    isPageVisible = !document.hidden;
    console.log('📱 Page visibility changed:', isPageVisible ? 'visible' : 'hidden');
  });
}

const fetchUserData = async (authUser: SupabaseUser, retryCount = 0): Promise<User> => {
  console.log('🔍 Fetching user data for:', authUser.email);
  
  // Don't fetch if page is not visible
  if (!isPageVisible && retryCount === 0) {
    console.log('📱 Page not visible, skipping user data fetch');
    return convertAssinaturaToUser(authUser, null);
  }
  
  // Cancel any previous fetch to avoid overlaps
  if (currentFetchController) {
    console.log('🚫 Cancelling previous fetch request');
    currentFetchController.abort('New fetch request initiated');
  }
  
  // Create new controller for this fetch
  currentFetchController = new AbortController();
  const controller = currentFetchController;
  
  try {
    // Set timeout for 15 seconds
    const timeoutId = setTimeout(() => controller.abort('Request timeout after 10 seconds'), 10000);
    
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
      .abortSignal(controller.signal)
      .maybeSingle();
    
    clearTimeout(timeoutId);
    
    // Clear controller reference if this is still the current one
    if (currentFetchController === controller) {
      currentFetchController = null;
    }

    if (error) {
      // Handle abort errors gracefully
      if (error.message?.includes('signal is aborted')) {
        console.warn('⚠️ Request was aborted:', error.message);
        return convertAssinaturaToUser(authUser, null);
      }
      
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
    // Clear controller reference if this is still the current one
    if (currentFetchController === controller) {
      currentFetchController = null;
    }
    
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.warn('⚠️ User data query was aborted:', error.message || 'No reason provided');
      
      // Retry with exponential backoff for transient errors
      if (retryCount < 2) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Retrying fetch in ${delay}ms (attempt ${retryCount + 1}/3)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchUserData(authUser, retryCount + 1);
      } else {
        console.warn('⚠️ Max retries reached for aborted request, returning fallback user');
        return convertAssinaturaToUser(authUser, null);
      }
    } else if (error.message?.includes('Failed to fetch') && retryCount < 2) {
      // Retry network errors
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(`🔄 Retrying fetch due to network error in ${delay}ms (attempt ${retryCount + 1}/3)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchUserData(authUser, retryCount + 1);
    } else {
      console.error('❌ Exception fetching user data:', error);
    }
    // Return user with auth data only if exception occurs
    return convertAssinaturaToUser(authUser, null);
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [isUserSessionRefreshing, setIsUserSessionRefreshing] = useState(false);
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

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (releaseTimerRef.current) {
        clearTimeout(releaseTimerRef.current);
      }
    };
  }, []);

  // Função para verificar se é rota protegida
  const isProtectedRoute = (path: string) => {
    const openRoutes = ['/registro', '/redefinir-senha', '/privacidade'];
    return !openRoutes.some(route => path.startsWith(route));
  };

  // Handle auth state changes (both initial and subsequent)
  const handleAuthStateChange = useCallback(async (event: AuthChangeEvent, session: Session | null) => {
    console.log('🔄 Handling auth state change:', { hasSession: !!session });
    
    // Only set session refreshing for non-initial events
    if (event !== 'INITIAL_SESSION') {
      // Prevent multiple simultaneous session refreshes
      if (isUserSessionRefreshing) {
        console.log('🚫 Session refresh already in progress, skipping');
        return;
      }
      setIsUserSessionRefreshing(true);
    }

    try {
      if (session?.user) {
        const userData = await fetchUserData(session.user);
        if (userData) {
          setUser(userData);
          setShowOnboarding(!userData.onboardingCompleted);
          console.log('✅ User data set successfully');

          // Só redireciona se suppressRedirects não estiver ativo
          if (!suppressRedirectsRef.current) {
            // Redirecionar para dashboard se estiver na página de login
            if (location.pathname === '/login' || location.pathname === '/register') {
              console.log('🔄 Redirecting to dashboard from auth page');
              navigate('/dashboard');
            }
          } else {
            console.log('🚫 Navigation suppressed, but user state updated');
          }
        }
      } else {
        console.log('❌ No session found, clearing user');
        setUser(null);
        setShowOnboarding(false);

        // Só redireciona se suppressRedirects não estiver ativo E não estivermos carregando
        if (!suppressRedirectsRef.current && !isLoadingInitial) {
          // Redirecionar para login se estiver em rota protegida
          const currentPath = location.pathname;
          const isCurrentlyProtected = isProtectedRoute(currentPath);
          
          if (isCurrentlyProtected) {
            console.log('🔄 Redirecting to home from protected route:', currentPath);
            navigate('/');
          } else {
            console.log('📍 On public route, no redirect needed:', currentPath);
          }
        } else if (suppressRedirectsRef.current) {
          console.log('🚫 Navigation suppressed, but user state cleared');
        } else {
          console.log('⏳ Still loading auth, deferring redirect decision');
        }
          }
      
    } catch (error) {
      console.error('❌ Error in auth state change:', error);
      setUser(null);
      setShowOnboarding(false);
    } finally {
      // Only clear initial loading on INITIAL_SESSION
      if (event === 'INITIAL_SESSION') {
        setIsLoadingInitial(false);
      } else {
        setIsUserSessionRefreshing(false);
      }
    }
  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🚀 Initializing auth...');
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting initial session:', error.message);
        } else {
          await handleAuthStateChange('INITIAL_SESSION', session);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
      } finally {
        setInitialized(true);
        console.log('✅ Auth initialization complete');
      }
    };

    initializeAuth();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    if (!initialized) return;

    // Don't setup listener if page is not visible
    if (typeof document !== 'undefined' && document.hidden) {
      console.log('📱 Page not visible, skipping auth listener setup');
      return;
    }

    console.log('👂 Setting up auth state listener...');
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    return () => {
      console.log('🧹 Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [initialized, handleAuthStateChange]);

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
      });

      if (error) {
        console.error('❌ Sign up error:', error.message);
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
      console.log('🔄 Refreshing user data...');
      
      // Don't refresh if page is not visible
      if (!isPageVisible) {
        console.log('📱 Page not visible, skipping user refresh');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      await handleAuthStateChange('TOKEN_REFRESHED', session);
      console.log('✅ User refresh complete');
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
    isLoadingInitial,
    isUserSessionRefreshing,
    showOnboarding,
    completeOnboarding,
    isAuthenticated: !isLoadingInitial && !!user,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshUser,
    suppressRedirects
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};