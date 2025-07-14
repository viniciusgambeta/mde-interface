import React, { useState, useRef } from 'react';
import { User, Mail, Camera, Save, Loader2, Upload, Shield, Calendar, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploadingAvatar(true);

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(user.id);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove([`${user.id}/${existingFiles[0].name}`]);
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile with new avatar URL
      await updateProfile({ avatar: publicUrl });

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    const updated = await updateProfile({ name });
    
    if (updated) {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }
    
    setIsLoading(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-20">
        <User className="w-16 h-16 text-slate-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">Acesso Restrito</h3>
        <p className="text-slate-400 text-center max-w-md">
          Você precisa estar logado para acessar esta página.
        </p>
      </div>
    );
  }

  const currentAvatar = avatarPreview || user.avatar || '/src/images/avatar.jpg';

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-4">Minha Conta</h1>
        <p className="text-slate-400 text-sm sm:text-base">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          {/* Avatar Section */}
          <div className="relative">
            <img
              src={currentAvatar}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-full object-cover border-2 sm:border-4 border-[#ff7551]/50"
            />
            <button 
              onClick={handleAvatarClick}
              disabled={isUploadingAvatar}
              className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-[#ff7551] rounded-full flex items-center justify-center hover:bg-[#ff7551]/80 transition-colors disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 text-white animate-spin" />
              ) : (
                <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white mb-1 sm:mb-2">{user.name}</h2>
            <p className="text-slate-400 mb-2 sm:mb-4 text-sm sm:text-base">{user.email}</p>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {/* Premium Status */}
              <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
                user.isPremium 
                  ? 'bg-[#ff7551]/20 text-[#ff7551] border border-[#ff7551]/30' 
                  : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
              }`}>
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">{user.isPremium ? 'Premium' : 'Free'}</span>
              </div>

              {/* Join Date */}
              <div className="flex items-center space-x-1 sm:space-x-2 text-slate-400 text-xs sm:text-sm">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Membro desde </span>
                <span>{new Date(user.joinedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>

          {/* Upgrade Button */}
          {!user.isPremium && (
            <div className="flex-shrink-0 w-full sm:w-auto">
              <button className="flex items-center justify-center space-x-2 w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors text-sm">
                <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Upgrade</span>
              </button>
            </div>
          )}
        </div>

        {/* Upload Instructions */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-600/20 rounded-lg">
          <div className="flex items-center space-x-2 text-slate-400 text-xs sm:text-sm">
            <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Clique na câmera para alterar sua foto de perfil</span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
          </p>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 lg:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">Editar Informações</h3>

        {success && (
          <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
            <p className="text-green-400 text-sm">Perfil atualizado com sucesso!</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                  placeholder="Seu nome completo"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-400 placeholder-slate-400 cursor-not-allowed"
                  placeholder="seu@email.com"
                />
              </div>
              <p className="text-slate-500 text-xs mt-1">
                O email não pode ser alterado após o cadastro
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Account Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-blue-400" />
          </div>
          <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Aulas Assistidas</h4>
          <p className="text-xl sm:text-2xl font-bold text-blue-400">24</p>
          <p className="text-slate-400 text-sm">Este mês</p>
        </div>

        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-green-400" />
          </div>
          <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Tempo Total</h4>
          <p className="text-xl sm:text-2xl font-bold text-green-400">18h</p>
          <p className="text-slate-400 text-sm">De aprendizado</p>
        </div>

        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 text-center">
          <div className="w-12 h-12 bg-[#ff7551]/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-[#ff7551]" />
          </div>
          <h4 className="text-white font-semibold mb-1 text-sm sm:text-base">Aulas Salvas</h4>
          <p className="text-xl sm:text-2xl font-bold text-[#ff7551]">12</p>
          <p className="text-slate-400 text-sm">Para assistir depois</p>
        </div>
      </div>

      {/* Premium Benefits */}
      {!user.isPremium && (
        <div className="bg-gradient-to-r from-[#ff7551]/10 to-[#ff7551]/5 border border-[#ff7551]/20 rounded-xl p-4 sm:p-6 lg:p-8">
          <div className="text-center">
            <Star className="w-12 h-12 text-[#ff7551] mx-auto mb-4" />
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Upgrade para Premium</h3>
            <p className="text-slate-300 mb-4 sm:mb-6 max-w-2xl mx-auto text-sm sm:text-base">
              Desbloqueie acesso completo a todas as aulas, downloads offline, certificados e suporte prioritário.
            </p>
            
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {[
                'Acesso a todas as aulas',
                'Downloads para offline',
                'Certificados oficiais',
                'Suporte prioritário'
              ].map((benefit, index) => (
                <div key={index} className="flex items-center space-x-2 text-slate-300 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-[#ff7551] rounded-full"></div>
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
            
            <button className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-semibold rounded-lg transition-colors text-sm sm:text-base">
              Fazer Upgrade Agora
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;