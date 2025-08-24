import React, { useState, useRef } from 'react';
import { Camera, Upload, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface OnboardingFlowProps {
  userId: string;
  userEmail: string;
  onComplete: () => void;
}

interface OnboardingData {
  avatar_url?: string;
  experiencia_ia?: string;
  objetivo_principal?: string;
  tipo_trabalho?: string;
  porte_negocio?: string;
  instagram?: string;
  linkedin?: string;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ userId, userEmail, onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({});

  const steps = [
    'avatar',
    'experiencia',
    'objetivo',
    'trabalho',
    'porte',
    'social'
  ];

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete existing avatar if it exists
      const { data: existingFiles } = await supabase.storage
        .from('avatars')
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        await supabase.storage
          .from('avatars')
          .remove([`${userId}/${existingFiles[0].name}`]);
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

      setOnboardingData(prev => ({ ...prev, avatar_url: publicUrl }));

    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Erro ao fazer upload da imagem. Tente novamente.');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipAvatar = () => {
    setOnboardingData(prev => ({ 
      ...prev, 
      avatar_url: 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'
    }));
    handleNext();
  };

  const handleComplete = async () => {
    setIsLoading(true);

    try {
      // Update subscription data with onboarding info
      const { error } = await supabase
        .from('assinaturas')
        .update({
          avatar_usuario: onboardingData.avatar_url || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg',
          experiencia_ia: onboardingData.experiencia_ia,
          objetivo_principal: onboardingData.objetivo_principal,
          tipo_trabalho: onboardingData.tipo_trabalho,
          porte_negocio: onboardingData.porte_negocio,
          instagram: onboardingData.instagram,
          linkedin: onboardingData.linkedin
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating onboarding data:', error);
        throw error;
      }

      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      alert('Erro ao salvar informações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    const step = steps[currentStep];

    switch (step) {
      case 'avatar':
        return (
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold text-white mb-2">Vamos personalizar seu perfil!</h2>
            <p className="text-slate-400 mb-8">Adicione uma foto para que outros possam te reconhecer</p>
            
            <div className="flex flex-col items-center space-y-6">
              <div className="relative">
                <img
                  src={avatarPreview || 'https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg'}
                  alt="Avatar preview"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#ff7551]/50"
                />
                <button 
                  onClick={handleAvatarClick}
                  disabled={isUploadingAvatar}
                  className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#ff7551] rounded-full flex items-center justify-center hover:bg-[#ff7551]/80 transition-colors disabled:opacity-50"
                >
                  {isUploadingAvatar ? (
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  ) : (
                    <Camera className="w-6 h-6 text-white" />
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
              
              <div className="text-center">
                <p className="text-slate-300 text-sm mb-2">Clique na câmera para adicionar sua foto</p>
                <p className="text-slate-500 text-xs">JPG, PNG ou GIF (máx. 5MB)</p>
              </div>
            </div>

            <div className="flex space-x-4 justify-center mt-8">
              <button
                onClick={handleSkipAvatar}
                className="px-6 py-3 text-slate-400 hover:text-white transition-colors"
              >
                Pular por agora
              </button>
              <button
                onClick={handleNext}
                disabled={isUploadingAvatar}
                className="flex items-center space-x-2 px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'experiencia':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Qual sua experiência com IA?</h2>
              <p className="text-slate-400">Isso nos ajuda a personalizar o conteúdo para você</p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'avancado', label: 'Avançado: já criei e gerencio automações complexas' },
                { value: 'intermediario', label: 'Intermediário: já uso ferramentas, mas quero melhorar' },
                { value: 'iniciante', label: 'Iniciante: estou começando agora' },
                { value: 'zero', label: 'Zero experiência: não faço ideia por onde começar' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setOnboardingData(prev => ({ ...prev, experiencia_ia: option.value }))}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    onboardingData.experiencia_ia === option.value
                      ? 'bg-[#ff7551] border-[#ff7551] text-white'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'objetivo':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">O que você espera conquistar?</h2>
              <p className="text-slate-400">Vamos focar no que mais importa para você</p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'monetizar', label: 'Monetizar com serviços de automação e IA' },
                { value: 'melhorar_processos', label: 'Melhorar processos do meu negócio' },
                { value: 'produtividade', label: 'Aumentar produtividade pessoal ou da equipe' },
                { value: 'aprender', label: 'Aprender por curiosidade / desenvolvimento pessoal' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setOnboardingData(prev => ({ ...prev, objetivo_principal: option.value }))}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    onboardingData.objetivo_principal === option.value
                      ? 'bg-[#ff7551] border-[#ff7551] text-white'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'trabalho':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Você trabalha em:</h2>
              <p className="text-slate-400">Queremos entender seu contexto profissional</p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'empresa_propria', label: 'Empresa própria (empreendedor(a))' },
                { value: 'agencia', label: 'Agência de marketing / consultoria' },
                { value: 'colaborador', label: 'Empresa como colaborador(a) (CLT/PJ)' },
                { value: 'autonomo', label: 'Profissional autônomo/freelancer' },
                { value: 'estudando', label: 'Ainda estudando / em transição de carreira' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setOnboardingData(prev => ({ ...prev, tipo_trabalho: option.value }))}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    onboardingData.tipo_trabalho === option.value
                      ? 'bg-[#ff7551] border-[#ff7551] text-white'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'porte':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Qual o porte do negócio?</h2>
              <p className="text-slate-400">Isso nos ajuda a sugerir conteúdo mais relevante</p>
            </div>
            
            <div className="space-y-3">
              {[
                { value: 'pequeno', label: 'Pequeno (até 10 pessoas)' },
                { value: 'medio', label: 'Médio (11 a 50 pessoas)' },
                { value: 'grande', label: 'Grande (mais de 50 pessoas)' },
                { value: 'sozinho', label: 'Trabalho sozinho(a)' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setOnboardingData(prev => ({ ...prev, porte_negocio: option.value }))}
                  className={`w-full text-left p-4 rounded-lg border transition-colors ${
                    onboardingData.porte_negocio === option.value
                      ? 'bg-[#ff7551] border-[#ff7551] text-white'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/30'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'social':
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Redes sociais (opcional)</h2>
              <p className="text-slate-400">Conecte-se com a comunidade</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Instagram (@)
                </label>
                <input
                  type="text"
                  value={onboardingData.instagram || ''}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, instagram: e.target.value }))}
                  placeholder="seu_usuario"
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  LinkedIn (URL completa)
                </label>
                <input
                  type="url"
                  value={onboardingData.linkedin || ''}
                  onChange={(e) => setOnboardingData(prev => ({ ...prev, linkedin: e.target.value }))}
                  placeholder="https://linkedin.com/in/seu-perfil"
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const canProceed = () => {
    const step = steps[currentStep];
    switch (step) {
      case 'avatar':
        return true; // Avatar is optional
      case 'experiencia':
        return !!onboardingData.experiencia_ia;
      case 'objetivo':
        return !!onboardingData.objetivo_principal;
      case 'trabalho':
        return !!onboardingData.tipo_trabalho;
      case 'porte':
        return !!onboardingData.porte_negocio;
      case 'social':
        return true; // Social media is optional
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30 text-center">
          <img
            src="/logo1_branco.png"
            alt="Me dá um Exemplo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <div className="flex items-center justify-center space-x-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-[#ff7551]' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
          <p className="text-slate-400 text-sm">
            Etapa {currentStep + 1} de {steps.length}
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {renderStep()}
        </div>

        {/* Footer */}
        {steps[currentStep] !== 'avatar' && (
          <div className="p-6 border-t border-slate-700/30 flex justify-between">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 px-6 py-3 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar</span>
            </button>
            
            <button
              onClick={handleNext}
              disabled={!canProceed() || isLoading}
              className="flex items-center space-x-2 px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finalizando...</span>
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Finalizar</span>
                </>
              ) : (
                <>
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;