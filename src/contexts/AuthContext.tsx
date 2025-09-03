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
    // Fetch user's consolidated profile/subscription data from 'assinaturas' table
    const { data: assinaturaData, error } = await supabase
      .from('assinaturas')
      .select(`
        "Nome do cliente",
        "Email do cliente",
        "Status da assinatura",
        avatar_usuario
      `)
      .eq('user_id', supabaseUser.id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching user assinatura data:', error);
    }

    const name = assinaturaData?.["Nome do cliente"] || supabaseUser.email?.split('@')[0] || 'Usuário';
    const avatar = assinaturaData?.avatar_usuario || '/src/images/avatar.jpg';
    const isPremium = assinaturaData?.["Status da assinatura"] === 'active';

    return {
      id: supabaseUser.id,
      name: name,
      email: supabaseUser.email || assinaturaData?.["Email do cliente"] || '',
      avatar: avatar,
      isPremium: isPremium,
      joinedAt: supabaseUser.created_at || new Date().toISOString() // Use Supabase user's created_at
    };
  };

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) setIsLoading(false);
          return;
        }

        if (session?.user && mounted) {
          const convertedUser = await fetchAndConvertUser(session.user);
          if (mounted) setUser(convertedUser);
        }
      } catch (error) {
        console.error('💥 Error initializing auth:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const convertedUser = await fetchAndConvertUser(session.user);
          if (mounted) setUser(convertedUser);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          // Clear user state and any onboarding flags
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          if (!user) {
            const convertedUser = convertUser(session.user);
            setUser(convertedUser);
          }
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      }
    );

    return () => {
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
      // Update the 'assinaturas' table directly
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
        })
        .eq('user_id', user.id);

      // Also update auth.users metadata if name/avatar are changed, for immediate reflection
      const authUpdateData: { data?: { name?: string; avatar_url?: string } } = {};
      if (data["Nome do cliente"]) authUpdateData.data = { ...authUpdateData.data, name: data["Nome do cliente"] };
      if (data.avatar_usuario) authUpdateData.data = { ...authUpdateData.data, avatar_url: data.avatar_usuario };

      if (Object.keys(authUpdateData).length > 0) {
        const { error: authError } = await supabase.auth.updateUser(authUpdateData);
        if (authError) {
          console.error('❌ Auth user metadata update error:', authError);
          // Don't return false, as the main 'assinaturas' update might have succeeded
        }
      }

      if (error) {
        console.error('❌ Assinaturas profile update error:', error);
        return false;
      }

      // Re-fetch user data to update context
      const updatedUser = await fetchAndConvertUser(await supabase.auth.getUser().then(res => res.data.user!));
      setUser(updatedUser);

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
      });

      if (error) {
        console.error('❌ Profile update error:', error);
        return false;
      }

      // Update local user state
      setUser(prev => prev ? { ...prev, ...data } : null);
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
    needsOnboarding,
    completeOnboarding
  };

  return (
    <AuthContext.Provider value={value}>
      {needsOnboarding && user ? (
        <OnboardingFlow 
          userId={user.id}
          userEmail={user.email}
          onComplete={completeOnboarding}
        />
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};