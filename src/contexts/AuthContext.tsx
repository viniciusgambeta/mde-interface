import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Assinatura } from '../lib/database';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isPremium: boolean;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Assinatura>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Convert Supabase user to our User type
  const fetchAndConvertUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    console.log('🔍 fetchAndConvertUser called for user:', supabaseUser.id, supabaseUser.email);
    
    try {
      console.log('📊 Starting assinaturas query...');
      
      // Create timeout promise to prevent infinite hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Query timeout')), 5000);
      });

      // Try to query assinaturas with timeout
      console.log('🔍 Querying assinaturas table with timeout...');
      
      try {
        const queryPromise = supabase
          .from('assinaturas')
          .select(`
            "Nome do cliente",
            "Email do cliente", 
            "Status da assinatura",
            "Telefone do cliente",
            avatar_usuario,
            "Data de criação",
            bio,
            score,
            instagram,
            linkedin,
            experiencia_ia,
            objetivo_principal,
            tipo_trabalho,
            porte_negocio,
            onboarding_completed,
            onboarding_data,
            phone_number,
            is_premium,
            created_at_profile,
            updated_at_profile
          `)
          .eq('user_id', supabaseUser.id)
          .maybeSingle();

        const { data: assinaturaData, error: queryError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]) as any;

        console.log('📊 Assinaturas query result:', { 
          hasData: !!assinaturaData, 
          error: queryError?.message || 'none',
          userId: supabaseUser.id
        });

        if (queryError) {
          console.error('❌ Query error:', queryError);
          throw queryError;
        }

        if (assinaturaData) {
          console.log('📋 Assinatura data found:', assinaturaData);
          
          const convertedUser = {
            id: supabaseUser.id,
            name: assinaturaData["Nome do cliente"] || supabaseUser.email?.split('@')[0] || 'Usuário',
            email: supabaseUser.email || assinaturaData["Email do cliente"] || '',
            avatar: assinaturaData.avatar_usuario || '/avatar1.png',
            isPremium: assinaturaData.is_premium || assinaturaData["Status da assinatura"] === 'active',
            joinedAt: assinaturaData["Data de criação"] || supabaseUser.created_at || new Date().toISOString()
          };
          
          console.log('👤 User conversion completed successfully:', convertedUser);
          return convertedUser;
        } else {
          console.log('⚠️ No assinatura record found for user');
          throw new Error('No assinatura record found');
        }

      } catch (queryError: any) {
        console.error('❌ Error or timeout in assinaturas query:', queryError.message);
        
        // If it's a timeout or RLS error, use fallback
        if (queryError.message === 'Query timeout' || queryError.code === '42501') {
          console.log('🆘 Using fallback due to timeout or RLS error');
        } else {
          console.log('🆘 Using fallback due to other error');
        }
        
        // Return fallback user data immediately
        const fallbackUser = {
          id: supabaseUser.id,
          name: supabaseUser.email?.split('@')[0] || 'Usuário',
          email: supabaseUser.email || '',
          avatar: '/avatar1.png',
          isPremium: false,
          joinedAt: supabaseUser.created_at || new Date().toISOString()
        };
        
        console.log('👤 Returning fallback user:', fallbackUser);
        return fallbackUser;
      }
      
    } catch (error) {
      console.error('💥 Exception in fetchAndConvertUser:', error);
      
      // Return fallback user data to prevent infinite loading
      const fallbackUser = {
        id: supabaseUser.id,
        name: supabaseUser.email?.split('@')[0] || 'Usuário',
        email: supabaseUser.email || '',
        avatar: '/avatar1.png',
        isPremium: false,
        joinedAt: supabaseUser.created_at || new Date().toISOString()
      };
      
      console.log('🆘 Returning fallback user data:', fallbackUser);
      return fallbackUser;
    }
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      setIsLoading(true);
      
      try {
        // Force clear any existing session first
        console.log('🧹 Clearing existing session...');
        
        console.log('📋 Session check result:', { hasSession: !!session, hasUser: !!session?.user, error: error?.message });
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            console.log('🔄 Setting user to null and loading to false (session error)');
            setUser(null);
            setIsLoading(false);
          }
          return;
        }

        if (session?.user && mounted) {
          console.log('👤 Converting user from session...');
          try {
            const convertedUser = await fetchAndConvertUser(session.user);
            console.log('✅ User converted successfully:', convertedUser);
            if (mounted) {
              console.log('🔄 Setting converted user and loading to false');
              setUser(convertedUser);
              setIsLoading(false);
            }
          } catch (convertError) {
            console.error('❌ Error converting user:', convertError);
            if (mounted) {
              console.log('🔄 Setting user to null and loading to false (convert error)');
              setUser(null);
              setIsLoading(false);
            }
          }
        } else {
          console.log('👤 No session found, setting user to null');
          if (mounted) {
            console.log('🔄 Setting user to null and loading to false (no session)');
            setUser(null);
            setIsLoading(false);
          }
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
        if (mounted) {
          console.log('🔄 Setting user to null and loading to false (init error)');
          setUser(null);
          setIsLoading(false);
        }
      } finally {
        console.log('🏁 Auth initialization complete');
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state change:', event, { hasSession: !!session, hasUser: !!session?.user });
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          console.log('✅ User signed in, converting user data...');
          try {
            const convertedUser = await fetchAndConvertUser(session.user);
            console.log('✅ User converted in auth change:', convertedUser);
            if (mounted) {
              console.log('🔄 Setting user from auth change');
              setUser(convertedUser);
              setIsLoading(false);
            }
          } catch (convertError) {
            console.error('❌ Error converting user on sign in:', convertError);
            if (mounted) {
              console.log('🔄 Setting user to null from auth change (error)');
              setUser(null);
              setIsLoading(false);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          if (mounted) {
            console.log('🔄 Setting user to null from sign out');
            setUser(null);
            setIsLoading(false);
          }
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        return false;
      }

      return !!data?.user;
    } catch (error) {
      console.error('💥 Login exception:', error);
      return false;
    }
  };

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        // No user_metadata here, profile data will be handled in 'assinaturas'
        // options: {
        //   data: {
        //     name: name,
        //   },
        // },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        return false;
      }

      return !!data?.user;
    } catch (error) {
      console.error('💥 Registration exception:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
      }
    } catch (error) {
      console.error('💥 Logout exception:', error);
    }
  };

  const updateProfile = async (data: Partial<Assinatura>): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      // Update the 'assinaturas' table with all user data
      const { error } = await supabase
        .from('assinaturas')
        .update({
          "Nome do cliente": data["Nome do cliente"],
          "Telefone do cliente": data["Telefone do cliente"],
          avatar_usuario: data.avatar_usuario,
          bio: data.bio,
          score: data.score,
          instagram: data.instagram,
          linkedin: data.linkedin,
          experiencia_ia: data.experiencia_ia,
          objetivo_principal: data.objetivo_principal,
          tipo_trabalho: data.tipo_trabalho,
          porte_negocio: data.porte_negocio,
          onboarding_completed: data.onboarding_completed,
          onboarding_data: data.onboarding_data,
          phone_number: data.phone_number,
          is_premium: data.is_premium
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        return false;
      }

      // Re-fetch user data to update context
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        try {
          const updatedUser = await fetchAndConvertUser(currentUser);
          setUser(updatedUser);
        } catch (error) {
          console.error('❌ Error re-fetching user after profile update:', error);
        }
      }

      return true;
    } catch (error) {
      console.error('💥 Profile update exception:', error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin"></div>
            <span className="text-slate-400">Carregando autenticação...</span>
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};