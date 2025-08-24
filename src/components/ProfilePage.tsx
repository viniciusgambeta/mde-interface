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

        </div>

      </div>

      {/* Edit Profile Form */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Editar Informações</h3>
          
          {/* Avatar Upload Section */}
          <div className="flex flex-col items-center space-y-2">
            <div className="relative group">
              <img
                src={currentAvatar}
                alt={user.name}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-slate-600/50 group-hover:border-[#ff7551]/50 transition-colors cursor-pointer"
                onClick={handleAvatarClick}
              />
              <div 
                className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={handleAvatarClick}
              >
                {isUploadingAvatar ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Camera className="w-6 h-6 text-white" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <button
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="text-xs text-slate-400 hover:text-[#ff7551] transition-colors disabled:opacity-50"
              >
                {isUploadingAvatar ? 'Enviando...' : 'Alterar foto'}
              </button>
              <p className="text-slate-500 text-xs mt-1">
                JPG, PNG, GIF (máx. 5MB)
              </p>
            </div>
          </div>
        </div>

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
    </div>
  );
};

export default ProfilePage;