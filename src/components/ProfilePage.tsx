import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Camera, Save, Loader2, Upload, Shield, Calendar, Star, Phone, Instagram, Briefcase, Target, BarChart3, CheckCircle, Lock, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: '',
    bio: '',
    instagram: '',
    experiencia_ia: '',
    objetivo_principal: '',
    tipo_trabalho: '',
    porte_negocio: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedPresetAvatar, setSelectedPresetAvatar] = useState<string | null>(null);
  const [avatarMode, setAvatarMode] = useState<'preset' | 'upload'>('preset');
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data from assinaturas table
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('assinaturas')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading user data:', error);
          return;
        }

        if (data) {
          setFormData({
            name: data['Nome do cliente'] || user.name || '',
            phone: data['Telefone do cliente']?.toString() || '',
            bio: data.bio || '',
            instagram: data.instagram || '',
            experiencia_ia: data.experiencia_ia || '',
            objetivo_principal: data.objetivo_principal || '',
            tipo_trabalho: data.tipo_trabalho || '',
            porte_negocio: data.porte_negocio || ''
          });

          // Set current avatar
          if (data.avatar_usuario) {
            const presetAvatars = ['/src/images/avatar1.png', '/src/images/avatar2.png', '/src/images/avatar3.png'];
            if (presetAvatars.includes(data.avatar_usuario)) {
              setSelectedPresetAvatar(data.avatar_usuario);
              setAvatarMode('preset');
            } else {
              setAvatarPreview(data.avatar_usuario);
              setAvatarMode('upload');
            }
          }
        }
      } catch (error) {
        console.error('Exception loading user data:', error);
      }
    };

    loadUserData();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePresetAvatarSelect = (avatarPath: string) => {
    setSelectedPresetAvatar(avatarPath);
    setAvatarPreview(null);
    setAvatarMode('preset');
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
        setSelectedPresetAvatar(null);
        setAvatarMode('upload');
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

      setAvatarPreview(publicUrl);

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

    try {
      // Determine final avatar URL
      let finalAvatarUrl = user?.avatar || '/src/images/avatar.jpg';
      
      if (avatarMode === 'preset' && selectedPresetAvatar) {
        finalAvatarUrl = selectedPresetAvatar;
      } else if (avatarMode === 'upload' && avatarPreview) {
        finalAvatarUrl = avatarPreview;
      }

      // Update user profile in auth
      const authUpdateData: any = {
        name: formData.name,
        avatar_url: finalAvatarUrl
      };

      const { error: authError } = await supabase.auth.updateUser({
        data: authUpdateData
      });

      if (authError) {
        console.error('Error updating auth profile:', authError);
        throw authError;
      }

      // Update assinaturas table
      const { error: subscriptionError } = await supabase
        .from('assinaturas')
        .update({
          'Nome do cliente': formData.name,
          'Telefone do cliente': formData.phone ? parseInt(formData.phone) : null,
          avatar_usuario: finalAvatarUrl,
          experiencia_ia: formData.experiencia_ia,
          objetivo_principal: formData.objetivo_principal,
          tipo_trabalho: formData.tipo_trabalho,
          porte_negocio: formData.porte_negocio,
          instagram: formData.instagram
        })
        .eq('user_id', user?.id);

      if (subscriptionError) {
        console.error('Error updating subscription data:', subscriptionError);
        // Don't throw error, just log it
      }

      // Update local auth context
      await updateProfile({ 
        name: formData.name, 
        avatar: finalAvatarUrl 
      });

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);

    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Erro ao atualizar perfil. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);
    setPasswordLoading(true);

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Por favor, preencha todos os campos');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('As senhas não coincidem');
      setPasswordLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('A nova senha deve ter pelo menos 6 caracteres');
      setPasswordLoading(false);
      return;
    }

    try {
      // First verify current password by trying to sign in
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user!.email,
        password: passwordData.currentPassword
      });

      if (verifyError) {
        setPasswordError('Senha atual incorreta');
        setPasswordLoading(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        setPasswordError('Erro ao atualizar senha. Tente novamente.');
        setPasswordLoading(false);
        return;
      }

      // Success
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
      
      setTimeout(() => setPasswordSuccess(false), 3000);

    } catch (error) {
      console.error('Error changing password:', error);
      setPasswordError('Erro inesperado. Tente novamente.');
    } finally {
      setPasswordLoading(false);
    }
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

  const getCurrentAvatar = () => {
    if (avatarMode === 'preset' && selectedPresetAvatar) {
      return selectedPresetAvatar;
    }
    if (avatarMode === 'upload' && avatarPreview) {
      return avatarPreview;
    }
    return user.avatar || '/src/images/avatar.jpg';
  };

  const presetAvatars = [
    '/src/images/avatar1.png',
    '/src/images/avatar2.png', 
    '/src/images/avatar3.png'
  ];

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
              src={getCurrentAvatar()}
              alt={user.name}
              className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-2xl object-cover"
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

      {/* Subscription Management Section */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Gerenciar Assinatura</h3>
            <p className="text-slate-400 text-sm max-w-2xl">
              A gestão da assinatura é feita através da Hubla. Por lá você pode alterar método de pagamento, cancelar ou modificar outras informações.
            </p>
          </div>
          
          <div className="mt-4 lg:mt-0">
            <a
              href="https://app.hub.la/user_subscriptions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-4 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors text-sm"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Gerenciar Assinatura</span>
            </a>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm">Perfil atualizado com sucesso!</p>
          </div>
        </div>
      )}

      {/* Password Success Message */}
      {passwordSuccess && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 text-sm">Senha alterada com sucesso!</p>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 lg:p-8">
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-6">Editar Informações</h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selection Section */}
          <div className="space-y-4">
            <h4 className="text-white font-medium text-left">Foto do Perfil</h4>
            
            {/* Avatar Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              {/* Preset Avatars */}
              {[
                '/avatar1.png',
                '/avatar2.png',
                '/avatar3.png'
              ].map((avatar, index) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handlePresetAvatarSelect(avatar)}
                  className={`relative group transition-all duration-200 w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 ${
                    selectedPresetAvatar === avatar
                      ? 'border-[#ff7551] scale-105'
                      : 'border-transparent hover:scale-105 hover:border-slate-500/50'
                  }`}
                >
                  <img
                    src={avatar}
                    alt={`Avatar ${index + 1}`}
                    className="w-full h-full rounded-xl object-cover group-hover:opacity-80 transition-opacity"
                  />
                </button>
              ))}
              
              {/* Upload Option */}
              <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className={`w-full h-full rounded-2xl border-2 border-dashed transition-all duration-200 group ${
                    avatarPreview && avatarMode === 'upload'
                      ? 'border-[#ff7551] scale-105 bg-slate-600/30'
                      : 'border-slate-600/50 hover:border-[#ff7551]/50 bg-slate-700/30 hover:bg-slate-600/30 hover:scale-105'
                  }`}
                >
                  {avatarPreview && avatarMode === 'upload' ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar personalizado"
                      className="w-full h-full rounded-xl object-cover"
                    />
                  ) : isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  ) : (
                    <div className="flex flex-col items-center justify-center">
                      <Upload className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 group-hover:text-[#ff7551] transition-colors" />
                      <span className="text-xs text-slate-400 group-hover:text-[#ff7551] transition-colors mt-1 text-center leading-tight">
                        Fazer Upload
                      </span>
                    </div>
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
            </div>
            
            {/* Upload Instructions */}
            <div className="text-left mt-8">
              <p className="text-slate-400 text-sm">
                Escolha um dos avatares prontos ou faça upload da sua própria foto
              </p>
              <p className="text-slate-500 text-xs mt-1">
                Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h4 className="text-white font-medium border-b border-slate-600/30 pb-2">Informações Pessoais</h4>
            
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    placeholder="Seu nome completo"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Telefone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    placeholder="(11) 99999-9999"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field (Read-only) */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-400 placeholder-slate-400 cursor-not-allowed"
                    placeholder="seu@email.com"
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1">
                  O email não pode ser alterado após o cadastro
                </p>
              </div>

              {/* Instagram Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    placeholder="@seu_usuario"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Bio Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all resize-none"
                  placeholder="Conte um pouco sobre você..."
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-6">
            <h4 className="text-white font-medium border-b border-slate-600/30 pb-2">Informações Profissionais</h4>
            
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Experience with AI */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Experiência com IA
                </label>
                <div className="relative">
                  <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="experiencia_ia"
                    value={formData.experiencia_ia}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    disabled={isLoading}
                  >
                    <option value="">Selecione...</option>
                    <option value="avancado">Avançado</option>
                    <option value="intermediario">Intermediário</option>
                    <option value="iniciante">Iniciante</option>
                    <option value="zero">Zero experiência</option>
                  </select>
                </div>
              </div>

              {/* Main Objective */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Objetivo Principal
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="objetivo_principal"
                    value={formData.objetivo_principal}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    disabled={isLoading}
                  >
                    <option value="">Selecione...</option>
                    <option value="monetizar">Monetizar com serviços de automação e IA</option>
                    <option value="melhorar_processos">Melhorar processos do meu negócio</option>
                    <option value="produtividade">Aumentar produtividade pessoal ou da equipe</option>
                    <option value="aprender">Aprender por curiosidade / desenvolvimento pessoal</option>
                  </select>
                </div>
              </div>

              {/* Work Type */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Tipo de Trabalho
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="tipo_trabalho"
                    value={formData.tipo_trabalho}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    disabled={isLoading}
                  >
                    <option value="">Selecione...</option>
                    <option value="empresa_propria">Empresa própria (empreendedor)</option>
                    <option value="agencia">Agência de marketing / consultoria</option>
                    <option value="colaborador">Empresa como colaborador (CLT/PJ)</option>
                    <option value="autonomo">Profissional autônomo/freelancer</option>
                    <option value="estudando">Ainda estudando / em transição de carreira</option>
                  </select>
                </div>
              </div>

              {/* Business Size */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Porte do Negócio
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    name="porte_negocio"
                    value={formData.porte_negocio}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    disabled={isLoading}
                  >
                    <option value="">Selecione...</option>
                    <option value="pequeno">Pequeno (até 10 pessoas)</option>
                    <option value="medio">Médio (11 a 50 pessoas)</option>
                    <option value="grande">Grande (mais de 50 pessoas)</option>
                    <option value="sozinho">Trabalho sozinho(a)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
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

        {/* Password Section */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-4 sm:p-6 lg:p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg sm:text-xl font-semibold text-white">Segurança</h3>
          {!showPasswordSection && (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600/30 hover:bg-slate-500/30 text-slate-300 hover:text-white rounded-lg transition-colors text-sm"
            >
              <Lock className="w-4 h-4" />
              <span>Alterar Senha</span>
            </button>
          )}
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {passwordError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm">{passwordError}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-1 gap-4 sm:gap-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha Atual *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={passwordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    disabled={passwordLoading}
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={passwordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    disabled={passwordLoading}
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-10 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    placeholder="••••••••"
                    disabled={passwordLoading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    disabled={passwordLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordSection(false);
                  setPasswordData({
                    currentPassword: '',
                    newPassword: '',
                    confirmPassword: ''
                  });
                  setPasswordError('');
                }}
                className="px-6 py-2.5 text-slate-300 hover:text-white transition-colors"
                disabled={passwordLoading}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={passwordLoading}
                className="flex items-center space-x-2 px-6 sm:px-8 py-2.5 sm:py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {passwordLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Alterando...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Alterar Senha</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {!showPasswordSection && (
          <div className="text-slate-400 text-sm">
            Mantenha sua conta segura alterando sua senha regularmente.
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ProfilePage;