import React, { useState, useRef, useEffect } from 'react';
import { User, Mail, Camera, Save, Loader2, Upload, Shield, Calendar, Star, Phone, Instagram, Briefcase, Target, BarChart3, CheckCircle, Lock, Eye, EyeOff, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
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
  const [error, setError] = useState('');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [profileDisplayData, setProfileDisplayData] = useState<{
    name: string;
    email: string;
    joinedAt: string;
    isPremium: boolean;
    plan: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user data from assinaturas table
  useEffect(() => {
    const loadUserData = async () => {
      if (!user || initialDataLoaded) return;

      try {
        console.log('📊 ProfilePage: Loading user data for:', user.id);
        
        const { data, error } = await supabase
          .from('assinaturas')
          .select(`
            "Nome do cliente",
            "Plano",
            email_cliente,
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
            created_at_profile
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        console.log('📊 ProfilePage: User data loaded:', { hasData: !!data, error: error?.message });
        
        if (error) {
          console.error('Error loading user data:', error);
          setError('Erro ao carregar dados do perfil');
          return;
        }

        if (data) {
          console.log('📋 ProfilePage: Setting form data from database');
          const newFormData = {
            name: data["Nome do cliente"] || user.name || '',
            phone: data.phone_number || '',
            bio: data.bio || '',
            instagram: data.instagram || '',
            experiencia_ia: data.experiencia_ia || '',
            objetivo_principal: data.objetivo_principal || '',
            tipo_trabalho: data.tipo_trabalho || '',
            porte_negocio: data.porte_negocio || ''
          };
          
          setFormData(newFormData);
          
          // Set profile display data
          setProfileDisplayData({
            name: data["Nome do cliente"] || user.name || '',
            email: data.email_cliente || user.email || '',
            joinedAt: data.created_at_profile || user.joinedAt,
            isPremium: data.is_premium || false,
            plan: data["Plano"] || 'Plano não definido'
          });

          // Set current avatar
          if (data.avatar_usuario) {
            const presetAvatars = ['/avatar1.png', '/avatar2.png', '/avatar3.png'];
            if (presetAvatars.includes(data.avatar_usuario)) {
              setSelectedPresetAvatar(data.avatar_usuario);
              setAvatarMode('preset');
            } else {
              setAvatarPreview(data.avatar_usuario);
              setAvatarMode('upload');
            }
          }
          
          setInitialDataLoaded(true);
        } else {
          console.log('⚠️ ProfilePage: No user data found in assinaturas table');
          // Set default values from user object
          setFormData({
            name: user.name || '',
            phone: '',
            bio: '',
            instagram: '',
            experiencia_ia: '',
            objetivo_principal: '',
            tipo_trabalho: '',
            porte_negocio: ''
          });
          setInitialDataLoaded(true);
          
          // Set default profile display data
          setProfileDisplayData({
            name: user.name || '',
            email: user.email || '',
            joinedAt: user.joinedAt,
            isPremium: false,
            plan: 'Plano não definido'
          });
        }
      } catch (error) {
        console.error('Exception loading user data:', error);
        setError('Erro ao carregar dados do perfil');
        setInitialDataLoaded(true);
        
        // Set fallback profile display data
        setProfileDisplayData({
          name: user.name || '',
          email: user.email || '',
          joinedAt: user.joinedAt,
          isPremium: false,
          plan: 'Plano não definido'
        });
      }
    };

    loadUserData();
  }, [user, initialDataLoaded]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error when user starts typing
    setSuccess(false); // Clear success when user makes changes
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handlePresetAvatarSelect = (avatarPath: string) => {
    setSelectedPresetAvatar(avatarPath);
    setAvatarPreview(null);
    setAvatarMode('preset');
    setSuccess(false); // Clear success when user makes changes
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB.');
      return;
    }

    setIsUploadingAvatar(true);
    setError('');

    try {
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
        setSelectedPresetAvatar(null);
        setAvatarMode('upload');
        setSuccess(false); // Clear success when user makes changes
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
      setError('Erro ao fazer upload da imagem. Tente novamente.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);
    setError('');

    try {
      console.log('🔄 ProfilePage: Starting profile update...');
      console.log('🔄 ProfilePage: Form data:', formData);
      console.log('🔄 ProfilePage: Avatar data:', { avatarPreview, selectedPresetAvatar, avatarMode });
      
      // Prepare update data
      const updateData = {
        "Nome do cliente": formData.name.trim(),
        phone_number: formData.phone.trim(),
        bio: formData.bio.trim(),
        instagram: formData.instagram.trim(),
        avatar_usuario: avatarPreview || selectedPresetAvatar || user?.avatar || '/avatar1.png',
        experiencia_ia: formData.experiencia_ia,
        objetivo_principal: formData.objetivo_principal,
        tipo_trabalho: formData.tipo_trabalho,
        porte_negocio: formData.porte_negocio
      };

      console.log('📤 ProfilePage: Sending update data:', updateData);
      
      // Direct database update with better error handling
      const { error: updateError } = await supabase
        .from('assinaturas')
        .upsert({ 
          user_id: user.id, 
          ...updateData 
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        console.error('❌ ProfilePage: Database update error:', updateError);
        setError('Erro ao atualizar perfil. Tente novamente.');
        return;
      }

      console.log('✅ ProfilePage: Database updated successfully');
      
      console.log('✅ ProfilePage: Profile updated successfully');
      setSuccess(true);
      
      // Refresh the page after successful update
      setTimeout(() => {
        window.location.reload();
      }, 1500); // Small delay to show success message
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (error) {
      console.error('💥 ProfilePage: Exception during update:', error);
      setError('Erro inesperado ao atualizar perfil. Tente novamente.');
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
      console.log('🔐 ProfilePage: Updating password...');
      
      // Update password directly (Supabase handles current password verification)
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (updateError) {
        console.error('❌ ProfilePage: Password update error:', updateError);
        if (updateError.message.includes('Invalid login credentials')) {
          setPasswordError('Senha atual incorreta');
        } else {
          setPasswordError('Erro ao atualizar senha. Tente novamente.');
        }
        setPasswordLoading(false);
        return;
      }

      console.log('✅ ProfilePage: Password updated successfully');
      
      // Success
      setPasswordSuccess(true);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordSection(false);
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setPasswordSuccess(false), 5000);

    } catch (error) {
      console.error('💥 ProfilePage: Password update exception:', error);
      setPasswordError('Erro inesperado. Tente novamente.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Show loading while initial data is being loaded
  if (!user || !initialDataLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin"></div>
          <span className="text-slate-400">Carregando perfil...</span>
        </div>
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
    return user.avatar || '/avatar1.png';
  };

  const presetAvatars = [
    '/avatar1.png',
    '/avatar2.png', 
    '/avatar3.png'
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-4">Minha Conta</h1>
        <p className="text-slate-400 text-lg">
          Gerencie suas informações pessoais e configurações da conta
        </p>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-6 sm:space-y-0 sm:space-x-8">
          {/* Avatar Section */}
          <div className="relative">
            <img
              src={getCurrentAvatar()}
              alt={user.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-[#ff7551]/20"
            />
          </div>

          {/* User Info */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2">{profileDisplayData?.name || user.name}</h2>
            <p className="text-slate-400 mb-4 text-lg">{profileDisplayData?.email || user.email}</p>
            
            <div className="flex flex-wrap items-center gap-4">
              {/* Premium Status */}
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full font-medium ${
                profileDisplayData?.isPremium || user.isPremium
                  ? 'bg-[#ff7551]/20 text-[#ff7551] border border-[#ff7551]/30' 
                  : 'bg-slate-600/30 text-slate-400 border border-slate-600/30'
              }`}>
                <Shield className="w-4 h-4" />
                <span>{profileDisplayData?.plan || 'Free'}</span>
              </div>

              {/* Join Date */}
              <div className="flex items-center space-x-2 text-slate-400">
                <Calendar className="w-4 h-4" />
                <span>Membro desde {new Date(profileDisplayData?.joinedAt || user.joinedAt).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Subscription Management Section */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <h3 className="text-xl font-semibold text-white mb-3">Gerenciar Assinatura</h3>
            <p className="text-slate-400 max-w-2xl">
              A gestão da assinatura é feita através da Hubla. Por lá você pode alterar método de pagamento, cancelar ou modificar outras informações.
            </p>
          </div>
          
          <div className="flex-shrink-0">
            <a
              href="https://app.hub.la/user_subscriptions"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 px-6 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Gerenciar Assinatura</span>
            </a>
          </div>
        </div>
      </div>

      {/* Global Success Message */}
      {success && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 font-medium">Perfil atualizado com sucesso!</p>
          </div>
        </div>
      )}

      {/* Global Error Message */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Password Success Message */}
      {passwordSuccess && (
        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <p className="text-green-400 font-medium">Senha alterada com sucesso!</p>
          </div>
        </div>
      )}

      {/* Edit Profile Form */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <h3 className="text-xl font-semibold text-white mb-8">Editar Informações</h3>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Avatar Selection Section */}
          <div className="space-y-6">
            <h4 className="text-white font-medium text-lg">Foto do Perfil</h4>
            
            {/* Avatar Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl">
              {/* Preset Avatars */}
              {presetAvatars.map((avatar, index) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => handlePresetAvatarSelect(avatar)}
                  className={`relative group transition-all duration-200 w-24 h-24 rounded-2xl overflow-hidden border-2 ${
                    selectedPresetAvatar === avatar
                      ? 'border-[#ff7551] scale-105 shadow-lg'
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
              <div className="relative w-24 h-24">
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className={`w-full h-full rounded-2xl border-2 border-dashed transition-all duration-200 group ${
                    avatarPreview && avatarMode === 'upload'
                      ? 'border-[#ff7551] scale-105 bg-slate-600/30 shadow-lg'
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
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className="w-5 h-5 text-slate-400 group-hover:text-[#ff7551] transition-colors" />
                      <span className="text-xs text-slate-400 group-hover:text-[#ff7551] transition-colors mt-1 text-center leading-tight">
                        Upload
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
            <div className="text-left">
              <p className="text-slate-400">
                Escolha um dos avatares prontos ou faça upload da sua própria foto
              </p>
              <p className="text-slate-500 text-sm mt-1">
                Formatos aceitos: JPG, PNG, GIF (máx. 5MB)
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h4 className="text-white font-medium text-lg border-b border-slate-600/30 pb-3">Informações Pessoais</h4>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-400 placeholder-slate-400 cursor-not-allowed"
                    placeholder="seu@email.com"
                  />
                </div>
                <p className="text-slate-500 text-sm mt-1">
                  O email não pode ser alterado após o cadastro
                </p>
              </div>

              {/* Instagram Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Instagram
                </label>
                <div className="relative">
                  <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    name="instagram"
                    value={formData.instagram}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
            <h4 className="text-white font-medium text-lg border-b border-slate-600/30 pb-3">Informações Profissionais</h4>
            
            <div className="grid sm:grid-cols-2 gap-6">
              {/* Experience with AI */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Experiência com IA
                </label>
                <div className="relative">
                  <BarChart3 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="experiencia_ia"
                    value={formData.experiencia_ia}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                  <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="objetivo_principal"
                    value={formData.objetivo_principal}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="tipo_trabalho"
                    value={formData.tipo_trabalho}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <select
                    name="porte_negocio"
                    value={formData.porte_negocio}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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

          {/* Submit Button with Success Message */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            {/* Inline Success Message */}
            {success && (
              <div className="flex items-center space-x-2 text-green-400 animate-fade-in">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Salvo com sucesso!</span>
              </div>
            )}
            
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Password Section */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold text-white">Segurança</h3>
          {!showPasswordSection && (
            <button
              onClick={() => setShowPasswordSection(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-slate-600/30 hover:bg-slate-500/30 text-slate-300 hover:text-white rounded-lg transition-colors"
            >
              <Lock className="w-4 h-4" />
              <span>Alterar Senha</span>
            </button>
          )}
        </div>

        {showPasswordSection && (
          <form onSubmit={handlePasswordSubmit} className="space-y-6">
            {passwordError && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <p className="text-red-400">{passwordError}</p>
                </div>
              </div>
            )}

            <div className="grid sm:grid-cols-1 gap-6">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha Atual *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                    {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                    {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full pl-12 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Form Actions */}
            <div className="flex items-center justify-between pt-6">
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
                className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
                disabled={passwordLoading}
              >
                Cancelar
              </button>
              
              <div className="flex items-center space-x-4">
                {/* Inline Password Success Message */}
                {passwordSuccess && (
                  <div className="flex items-center space-x-2 text-green-400 animate-fade-in">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Senha alterada!</span>
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="flex items-center space-x-2 px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Alterando...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5" />
                      <span>Alterar Senha</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}

        {!showPasswordSection && (
          <div className="text-slate-400">
            Mantenha sua conta segura alterando sua senha regularmente.
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;