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
  ArrowLeft
} from 'lucide-react';

interface AssinaturaData {
  'ID da assinatura': string;
  'Nome do cliente': string;
  'Email do cliente': string;
  'Status da assinatura': string;
  'Plano': string;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<AssinaturaData | null>(null);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false); // This will trigger the onboarding flow

  // Check subscription when email changes
  useEffect(() => {
    const checkSubscription = async () => {
      if (!formData.email || formData.email.length < 3 || !formData.email.includes('@')) {
        setEmailValid(null);
        setSubscriptionData(null);
        return;
      }

      try {
        console.log('🔍 Checking subscription for email:', formData.email);
        
        const { data, error } = await supabase
          .from('assinaturas') // Assuming 'assinaturas' now holds all user profile data
          .select(`
            "ID da assinatura",
            "Nome do cliente", 
            "Email do cliente",
            "Status da assinatura",
            "Plano"
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
        }
      } catch (err) {
        console.error('💥 Exception checking subscription:', err);
        setEmailValid(false);
        setSubscriptionData(null);
      }
    };

    const timeoutId = setTimeout(checkSubscription, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!emailValid) {
      setError('Email não possui assinatura ativa');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Force logout any existing session
      await supabase.auth.signOut();

      // Create new user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        // No user_metadata here, profile data will be handled in 'assinaturas'
      });

      if (authError) {
        throw authError;
      }

      // If user is created in auth.users, then create/update their record in 'assinaturas'
      if (authData.user) {
        // Update the existing assinaturas record with the new user_id
        if (subscriptionData) {
          const { error: updateError } = await supabase
            .from('assinaturas')
            .update({
              user_id: authData.user.id,
              "Nome do cliente": formData.name,
              "Email do cliente": formData.email,
              onboarding_completed: false
            })
            .eq("ID da assinatura", subscriptionData["ID da assinatura"]);

          if (updateError) {
            console.error('Error updating existing assinatura record:', updateError);
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
              onboarding_completed: false
            });
            
          if (insertError) {
            console.error('Error inserting new assinatura record:', insertError);
          }
        }
        
        // Force logout after successful registration
        console.log('✅ Registration successful, forcing logout...');
        await supabase.auth.signOut();
        
        setShowSuccessScreen(true);
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            Sua conta foi criada com sucesso! Agora faça login para continuar.
          </p>
          
          <button
            onClick={() => navigate('/')}
            className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium py-3 rounded-lg transition-colors"
          >
            Fazer Login
          </button>
        </div>
      </div>
    </div>
  );

  // Show success screen after registration
  if (showSuccessScreen) {
    // Auto redirect after 3 seconds
    setTimeout(() => {
      navigate('/');
    }, 3000);
    
    return <SuccessScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/')}
              className="text-slate-400 hover:text-white transition-colors mr-3"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
          </div>
          <p className="text-slate-400">
            Crie sua conta para acessar o conteúdo exclusivo
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nome Completo
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
                disabled={isSubmitting}
                required
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
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                placeholder="seu@email.com"
                disabled={isSubmitting}
                required
              />
              {emailValid === true && (
                <CheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-green-400" />
              )}
            </div>
            
            {/* Email Validation Feedback */}
            {formData.email && emailValid === false && (
              <p className="text-red-400 text-xs mt-1">
                Este email não foi encontrado ou não possui assinatura ativa
              </p>
            )}
            {emailValid === true && subscriptionData && (
              <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                <p className="text-green-400 text-xs">
                  ✓ Assinatura ativa encontrada: {subscriptionData['Plano']}
                </p>
              </div>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full pl-10 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !emailValid}
            className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Criando conta...</span>
              </>
            ) : (
              <span>Criar Conta</span>
            )}
          </button>

          {/* Info */}
          <div className="p-3 bg-slate-700/20 rounded-lg">
            <p className="text-slate-400 text-xs text-center">
              Apenas usuários com assinatura ativa podem criar uma conta.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/30 text-center">
          <p className="text-slate-400 text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={() => navigate('/')}
              className="text-[#ff7551] hover:text-[#ff7551]/80 font-medium transition-colors"
            >
              Entrar
            </button>
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => navigate('/redefinir-senha')}
              className="text-slate-400 hover:text-[#ff7551] text-sm transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;