import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  Loader2, 
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  AlertCircle
} from 'lucide-react';

interface AssinaturaData {
  'ID da assinatura': string;
  'Nome do cliente': string;
  'Email do cliente': string;
  'Status da assinatura': string;
  'Plano': string;
  'cadastro_mde': boolean;
}

interface FormData {
  email: string;
  name: string;
  password: string;
  confirmPassword: string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuth();
  
  // Form state
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<AssinaturaData | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [hasExistingAccount, setHasExistingAccount] = useState(false);

  const steps = ['email', 'details', 'password'];

  // Redirect authenticated users to homepage
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      console.log('🔒 Authenticated user trying to access registration, redirecting to home');
      navigate('/');
    }
  }, [loading, isAuthenticated, user, navigate]);

  // Check subscription when email changes (only on email step)
  useEffect(() => {
    if (currentStep !== 0) return; // Only check on email step
    
    const checkSubscription = async () => {
      if (!formData.email || formData.email.length < 3 || !formData.email.includes('@')) {
        setEmailValid(null);
        setSubscriptionData(null);
        return;
      }

      setIsCheckingEmail(true);

      try {
        console.log('🔍 Checking subscription for email:', formData.email);
        
        const { data, error } = await supabase
          .from('assinaturas')
          .select(`
            "ID da assinatura",
            "Nome do cliente", 
            "Email do cliente",
            "Status da assinatura",
            "Plano",
            cadastro_mde
          `)
          .eq('Email do cliente', formData.email.toLowerCase())
          .maybeSingle();

        console.log('📊 Subscription query result:', { data, error });

        if (error) {
          console.error('❌ Error checking subscription:', error);
          setEmailValid(false);
          setSubscriptionData(null);
        } else if (!data) {
          console.log('❌ No subscription found for email:', formData.email);
          setEmailValid(false);
          setSubscriptionData(null);
        } else {
          console.log('✅ Subscription found:', data);
          setEmailValid(true);
          setSubscriptionData(data);
          setHasExistingAccount(data.cadastro_mde || false);
          // Auto-fill name if available
          if (data["Nome do cliente"] && !formData.name) {
            setFormData(prev => ({ ...prev, name: data["Nome do cliente"] }));
          }
        }
      } catch (err) {
        console.error('💥 Exception checking subscription:', err);
        setEmailValid(false);
        setSubscriptionData(null);
      } finally {
        setIsCheckingEmail(false);
      }
    };

    const timeoutId = setTimeout(checkSubscription, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, currentStep]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleNext = () => {
    setError('');
    
    if (currentStep === 0) {
      // Email step validation
      if (!formData.email) {
        setError('Por favor, digite seu email');
        return;
      }
      if (!emailValid) {
        setError('Email não possui assinatura ativa ou não foi encontrado');
        return;
      }
      if (hasExistingAccount) {
        // Don't proceed if user already has an account
        return;
      }
    } else if (currentStep === 1) {
      // Details step validation
      if (!formData.name.trim()) {
        setError('Por favor, digite seu nome completo');
        return;
      }
    }
    
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Final validation
    if (!formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos de senha');
      setIsSubmitting(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📝 Starting registration process...');
      
      // Force logout any existing session
      await supabase.auth.signOut();

      // Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        console.log('✅ User created in auth.users, updating assinaturas...');
        
        // Update the existing assinaturas record with the new user_id
        if (subscriptionData) {
          const { error: updateError } = await supabase
            .from('assinaturas')
            .update({
              user_id: authData.user.id,
              "Nome do cliente": formData.name,
              "Email do cliente": formData.email,
              onboarding_completed: false,
              cadastro_mde: true
            })
            .eq("ID da assinatura", subscriptionData["ID da assinatura"]);

          if (updateError) {
            console.error('❌ Error updating existing assinatura record:', updateError);
          } else {
            console.log('✅ Assinatura record updated successfully');
          }
        } else {
          // Create a new assinatura record for free users
          const { error: insertError } = await supabase
            .from('assinaturas')
            .insert({
              user_id: authData.user.id,
              "Nome do cliente": formData.name,
              "Email do cliente": formData.email,
              "ID da assinatura": authData.user.id,
              "Status da assinatura": 'free',
              "Plano": 'Free Plan',
              "Data de criação": new Date().toISOString().split('T')[0],
              onboarding_completed: false,
              cadastro_mde: true
            });
            
          if (insertError) {
            console.error('❌ Error inserting new assinatura record:', insertError);
          } else {
            console.log('✅ New assinatura record created successfully');
          }
        }
        
        // Force logout and show success screen
        await supabase.auth.signOut();
        console.log('✅ Registration successful, showing success screen...');
        setShowSuccessScreen(true);
      }
    } catch (err: any) {
      console.error('❌ Registration error:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = async () => {
    console.log('🚪 Forcing logout before login redirect...');
    await supabase.auth.signOut();
    navigate('/?login=true');
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Email step
        return emailValid === true && !isCheckingEmail && !hasExistingAccount;
      case 1: // Details step
        return formData.name.trim().length > 0;
      case 2: // Password step
        return formData.password.length >= 6 && formData.password === formData.confirmPassword;
      default:
        return false;
    }
  };

  // Show loading while auth is initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin"></div>
          <span className="text-slate-400">Carregando...</span>
        </div>
      </div>
    );
  }

  // Success Screen Component
  const SuccessScreen = () => (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md">
        <div className="p-8 text-center">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-400" />
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-4">
            Conta Criada com Sucesso!
          </h1>
          
          <p className="text-slate-300 mb-6">
            Sua conta foi criada com sucesso! Para sua segurança, você precisa fazer login novamente para acessar a plataforma.
          </p>
          
          <button
            onClick={handleGoToLogin}
            className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium py-3 rounded-lg transition-colors mb-4"
          >
            Fazer Login
          </button>
          
          <p className="text-slate-400 text-sm">
            Use o email e senha que você acabou de criar para entrar na plataforma.
          </p>
        </div>
      </div>
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Email step
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Qual seu email?</h2>
              <p className="text-slate-400">Vamos verificar se você tem uma assinatura ativa</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all text-lg"
                  placeholder="seu@email.com"
                  disabled={isSubmitting || isCheckingEmail}
                  required
                />
                {isCheckingEmail && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                  </div>
                )}
                {emailValid === true && !isCheckingEmail && (
                  <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-400" />
                )}
              </div>
              
              {/* Email Validation Feedback */}
              {formData.email && emailValid === false && !isCheckingEmail && (
                <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-sm">
                      Este email não foi encontrado ou não possui assinatura ativa
                    </p>
                  </div>
                </div>
              )}
              
              {/* Existing Account Message */}
              {hasExistingAccount && emailValid === true && subscriptionData && !isCheckingEmail && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    <p className="text-blue-400 text-sm font-medium">
                      Você já possui uma conta cadastrada!
                    </p>
                  </div>
                  <p className="text-blue-300 text-xs mb-4">
                    Este email já tem uma senha cadastrada na plataforma. Faça login para acessar sua conta.
                  </p>
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    Ir para Login
                  </button>
                </div>
              )}
              
              {emailValid === true && subscriptionData && !isCheckingEmail && !hasExistingAccount && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <div>
                      <p className="text-green-400 text-sm font-medium">
                        ✓ Assinatura ativa encontrada!
                      </p>
                      <p className="text-green-300 text-xs mt-1">
                        Plano: {subscriptionData['Plano']}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 1: // Details step
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Seus dados</h2>
              <p className="text-slate-400">Como você gostaria de ser chamado?</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nome Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-4 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all text-lg"
                  placeholder="Seu nome completo"
                  disabled={isSubmitting}
                  required
                />
              </div>
            </div>

            {/* Email confirmation display */}
            <div className="p-4 bg-slate-700/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm">Email:</span>
                <span className="text-white font-medium">{formData.email}</span>
              </div>
            </div>
          </div>
        );

      case 2: // Password step
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Crie sua senha</h2>
              <p className="text-slate-400">Escolha uma senha segura para sua conta</p>
            </div>

            <div className="space-y-4">
              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all text-lg"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirmar Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-12 pr-12 py-4 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all text-lg"
                    placeholder="••••••••"
                    disabled={isSubmitting}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    disabled={isSubmitting}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Account summary */}
            <div className="p-4 bg-slate-700/20 rounded-lg space-y-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm">Nome:</span>
                <span className="text-white font-medium">{formData.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span className="text-slate-400 text-sm">Email:</span>
                <span className="text-white font-medium">{formData.email}</span>
              </div>
              {subscriptionData && (
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="text-slate-400 text-sm">Plano:</span>
                  <span className="text-green-400 font-medium">{subscriptionData['Plano']}</span>
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // Show success screen after registration
  if (showSuccessScreen) {
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30">
          <div className="text-center">
            <img
              src="/logo1_branco.png"
              alt="Me dá um Exemplo"
              className="h-16 w-auto mx-auto"
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="p-6">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          {renderStepContent()}
        </div>

        {/* Footer */}
            {/* Next/Submit Button */}
            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={!canProceed() || isSubmitting || isCheckingEmail || hasExistingAccount}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed text-lg"
              >
                <span>Continuar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting || hasExistingAccount}
                className="w-full flex items-center justify-center space-x-2 py-4 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed text-lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Criando conta...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    <span>Criar Conta</span>
                  </>
                )}
              </button>
            )}

            {/* Back Button - Only show for steps > 0 */}
            {currentStep > 0 && (
              <button
                onClick={handleBack}
                className="w-full flex items-center justify-center space-x-2 py-3 mt-4 text-slate-400 hover:text-white transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>
            )}
          </div>
        </div>

        <div className="text-center mt-6 px-6">
          <p className="text-slate-500 text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-[#ff7551] transition-colors"
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;