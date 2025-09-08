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

        console.log('🔐 Auth state change event:', event, 'Session exists:', !!session);

        console.log('🔐 Auth state change event:', event, 'Session exists:', !!session);

        if (session?.user) {
          setUser(convertSupabaseUser(session.user));
          
          // Check onboarding status only on SIGNED_IN event
          if (event === 'SIGNED_IN') {
            console.log('✅ User signed in, checking onboarding status...');
            
            // Small delay to ensure user state is updated
            setTimeout(async () => {
              try {
                console.log('🔍 Querying onboarding status for user:', session.user.id);
                
                const { data: assinaturaData, error } = await supabase
                  .from('assinaturas')
                  .select('onboarding_completed')
                  .eq('user_id', session.user.id)
                  .maybeSingle();

                if (error) {
                  console.error('❌ Error checking onboarding status:', error);
                  return;
                }

                console.log('📊 Onboarding data:', assinaturaData);
                
                const onboardingCompleted = assinaturaData?.onboarding_completed;
                console.log('🎯 Onboarding completed:', onboardingCompleted);
                
                if (!onboardingCompleted) {
                  console.log('🚀 Redirecting to onboarding...');
                  navigate('/onboarding');
                } else {
                  console.log('✅ Onboarding already completed, user can continue');
                }
              } catch (error) {
                console.error('💥 Exception checking onboarding status:', error);
              }
            }, 100);
          }
          
          // Check onboarding status only on SIGNED_IN event
          if (event === 'SIGNED_IN') {
            console.log('✅ User signed in, checking onboarding status...');
            
            // Small delay to ensure user state is updated
            setTimeout(async () => {
              try {
                console.log('🔍 Querying onboarding status for user:', session.user.id);
                
                const { data: assinaturaData, error } = await supabase
                  .from('assinaturas')
                  .select('onboarding_completed')
                  .eq('user_id', session.user.id)
                  .maybeSingle();

                if (error) {
                  console.error('❌ Error checking onboarding status:', error);
                  return;
                }

                console.log('📊 Onboarding data:', assinaturaData);
                
                const onboardingCompleted = assinaturaData?.onboarding_completed;
                console.log('🎯 Onboarding completed:', onboardingCompleted);
                
                if (!onboardingCompleted) {
                  console.log('🚀 Redirecting to onboarding...');
                  navigate('/onboarding');
                } else {
                  console.log('✅ Onboarding already completed, user can continue');
                }
              } catch (error) {
                console.error('💥 Exception checking onboarding status:', error);
              }
            }, 100);
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