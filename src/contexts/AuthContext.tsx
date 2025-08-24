import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { profileService, type Profile } from '../lib/database';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isPremium: boolean;
  phoneNumber?: string;
  bio?: string;
  score: number;
  joinedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
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

  // Convert Supabase user + profile to our User type
  const convertUser = (supabaseUser: SupabaseUser, profile?: Profile | null): User => {
    return {
      id: supabaseUser.id,
      name: profile?.name || supabaseUser.email?.split('@')[0] || 'Usuário',
      email: supabaseUser.email || '',
      avatar: profile?.avatar_url || '/src/images/avatar.jpg',
      isPremium: profile?.is_premium || false,
      phoneNumber: profile?.phone_number,
      bio: profile?.bio,
      score: profile?.score || 0,
      joinedAt: supabaseUser.created_at || new Date().toISOString()
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
          // Get profile data
          const profile = await profileService.getProfile(session.user.id);
          const convertedUser = convertUser(session.user, profile);
          setUser(convertedUser);
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
          // Get profile data
          const profile = await profileService.getProfile(session.user.id);
          const convertedUser = convertUser(session.user, profile);
          setUser(convertedUser);
          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsLoading(false);
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          if (!user) {
            // Get profile data
            const profile = await profileService.getProfile(session.user.id);
            const convertedUser = convertUser(session.user, profile);
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
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        return false;
      }

      // Profile will be created automatically by the database trigger
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

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      // Prepare profile update data
      const profileUpdateData: any = {};
      
      if (data.name !== undefined) profileUpdateData.name = data.name;
      if (data.avatar !== undefined) profileUpdateData.avatar_url = data.avatar;
      if (data.isPremium !== undefined) profileUpdateData.is_premium = data.isPremium;
      if (data.phoneNumber !== undefined) profileUpdateData.phone_number = data.phoneNumber;
      if (data.bio !== undefined) profileUpdateData.bio = data.bio;
      if (data.score !== undefined) profileUpdateData.score = data.score;

      // Update profile in database
      const success = await profileService.updateProfile(user.id, profileUpdateData);

      if (!success) {
        console.error('❌ Profile update failed');
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
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};