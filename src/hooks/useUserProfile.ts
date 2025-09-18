import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar?: string;
  instagram?: string;
  linkedin?: string;
  experiencia_ia?: string;
  objetivo_principal?: string;
  tipo_trabalho?: string;
  porte_negocio?: string;
  is_premium: boolean;
  onboarding_completed: boolean;
  subscription_status?: string;
  subscription_plan?: string;
  created_at?: string;
}

export const useUserProfile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    if (!user || !isAuthenticated) {
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('assinaturas')
        .select(`
          id_assinatura,
          "Nome do cliente",
          "Telefone do cliente",
          avatar_usuario,
          bio,
          instagram,
          linkedin,
          experiencia_ia,
          objetivo_principal,
          tipo_trabalho,
          porte_negocio,
          phone_number,
          is_premium,
          onboarding_completed,
          onboarding_data,
          "Status da assinatura",
          "Plano",
          "Data de criação"
        `)
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error loading user profile:', fetchError);
        setError('Erro ao carregar perfil');
        return;
      }

      if (data) {
        const userProfile: UserProfile = {
          id: user.id,
          name: data["Nome do cliente"] || user.name,
          email: user.email,
          phone: data.phone_number || data["Telefone do cliente"]?.toString(),
          bio: data.bio,
          avatar: data.avatar_usuario || user.avatar,
          instagram: data.instagram,
          linkedin: data.linkedin,
          experiencia_ia: data.experiencia_ia,
          objetivo_principal: data.objetivo_principal,
          tipo_trabalho: data.tipo_trabalho,
          porte_negocio: data.porte_negocio,
          is_premium: data.is_premium || false,
          onboarding_completed: data.onboarding_completed || false,
          subscription_status: data["Status da assinatura"],
          subscription_plan: data["Plano"],
          created_at: data["Data de criação"]
        };
        
        setProfile(userProfile);
      } else {
        // No profile data found, create basic profile from auth user
        const basicProfile: UserProfile = {
          id: user.id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          is_premium: false,
          onboarding_completed: false
        };
        
        setProfile(basicProfile);
      }
    } catch (error) {
      console.error('Exception loading user profile:', error);
      setError('Erro inesperado ao carregar perfil');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;

    try {
      const updateData: any = {};
      
      if (updates.name) updateData["Nome do cliente"] = updates.name;
      if (updates.phone) updateData.phone_number = updates.phone;
      if (updates.bio !== undefined) updateData.bio = updates.bio;
      if (updates.avatar) updateData.avatar_usuario = updates.avatar;
      if (updates.instagram !== undefined) updateData.instagram = updates.instagram;
      if (updates.linkedin !== undefined) updateData.linkedin = updates.linkedin;
      if (updates.experiencia_ia) updateData.experiencia_ia = updates.experiencia_ia;
      if (updates.objetivo_principal) updateData.objetivo_principal = updates.objetivo_principal;
      if (updates.tipo_trabalho) updateData.tipo_trabalho = updates.tipo_trabalho;
      if (updates.porte_negocio) updateData.porte_negocio = updates.porte_negocio;
      if (updates.onboarding_completed !== undefined) updateData.onboarding_completed = updates.onboarding_completed;

      const { error } = await supabase
        .from('assinaturas')
        .upsert({ 
          user_id: user.id, 
          ...updateData 
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error updating profile:', error);
        return false;
      }

      // Reload profile after update
      await loadProfile();
      return true;
    } catch (error) {
      console.error('Exception updating profile:', error);
      return false;
    }
  };

  const refreshProfile = () => {
    loadProfile();
  };

  // Load profile when user changes
  useEffect(() => {
    loadProfile();
  }, [user?.id, isAuthenticated]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    refreshProfile
  };
};