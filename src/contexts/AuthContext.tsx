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
    
    // Fetch user's consolidated data from 'assinaturas' table
    const { data: assinaturaData, error } = await supabase
      .from('assinaturas')
      .select(`
        "Nome do cliente",
        "Email do cliente",
        "Status da assinatura",
        avatar_usuario,
        "Data de criação"
      `)
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    console.log('📊 Assinatura query result:', { data: assinaturaData, error: error?.message });

    if (error) {
      console.error('Error fetching user assinatura data:', error);
    }

    // If no assinatura record exists, create a basic one
    if (!assinaturaData) {
      console.log('⚠️ No assinatura record found, creating basic record for user:', supabaseUser.id);
      
      const defaultName = supabaseUser.email?.split('@')[0] || 'Usuário';
      
      try {
        const { error: insertError } = await supabase
          .from('assinaturas')
          .insert({
            user_id: supabaseUser.id,
            "Nome do cliente": defaultName,
            "Email do cliente": supabaseUser.email,
            "ID da assinatura": supabaseUser.id,
            "Status da assinatura": 'free',
            "Plano": 'Free Plan',
            "Data de criação": new Date().toISOString().split('T')[0],
            avatar_usuario: '/avatar1.png',
            onboarding_completed: false
          });
          
        if (insertError) {
          console.error('❌ Error creating default assinatura record:', insertError);
        } else {
          console.log('✅ Created default assinatura record');
        }
      } catch (createError) {
        console.error('💥 Exception creating default assinatura record:', createError);
      }
    }

    const name = assinaturaData?.["Nome do cliente"] || supabaseUser.email?.split('@')[0] || 'Usuário';
    const avatar = assinaturaData?.avatar_usuario || '/avatar1.png';
    const isPremium = assinaturaData?.["Status da assinatura"] === 'active';
    const joinedAt = assinaturaData?.["Data de criação"] || supabaseUser.created_at || new Date().toISOString();

    console.log('👤 Converted user data:', { name, avatar, isPremium, joinedAt });
    return {
      id: supabaseUser.id,
      name: name,
      email: supabaseUser.email || assinaturaData?.["Email do cliente"] || '',
      avatar: avatar,
      isPremium: isPremium,
      joinedAt: joinedAt
    };
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      console.log('🚀 Initializing auth...');
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        console.log('📋 Session check result:', { hasSession: !!session, hasUser: !!session?.user, error: error?.message });
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (session?.user && mounted) {
          console.log('👤 Converting user from session...');
          const convertedUser = await fetchAndConvertUser(session.user);
          console.log('✅ User converted successfully:', convertedUser);
          if (mounted) setUser(convertedUser);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
      } finally {
        if (mounted) {
          console.log('🏁 Auth initialization complete, setting loading to false');
          setIsLoading(false);
        }
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
          const convertedUser = await fetchAndConvertUser(session.user);
          if (mounted) setUser(convertedUser);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          // Clear user state and any onboarding flags
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          console.log('🔄 Token refreshed');
          if (!user) {
            const convertedUser = await fetchAndConvertUser(session.user);
            setUser(convertedUser);
          }
          setIsLoading(false);
        } else {
          console.log('⏹️ Other auth event, setting loading to false');
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      mounted = false;
      subscription.unsubscribe();
    };
  }, [user]);

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
          avatar_usuario: data.avatar_usuario,
          bio: data.bio,
          score: data.score,
          instagram: data.instagram,
          "Telefone do cliente": data["Telefone do cliente"],
          experiencia_ia: data.experiencia_ia,
          objetivo_principal: data.objetivo_principal,
          tipo_trabalho: data.tipo_trabalho,
          porte_negocio: data.porte_negocio,
          onboarding_completed: data.onboarding_completed,
          onboarding_data: data.onboarding_data
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Profile update error:', error);
        return false;
      }

      // Re-fetch user data to update context
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const updatedUser = await fetchAndConvertUser(currentUser);
        setUser(updatedUser);
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