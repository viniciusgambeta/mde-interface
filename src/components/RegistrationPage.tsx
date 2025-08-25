import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Navigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import OnboardingFlow from './OnboardingFlow';

interface SubscriptionData {
  'ID da assinatura': string;
  'Status da assinatura': string;
  'Email do cliente': string;
  'Nome do cliente': string;
  cadastro_mde?: boolean;
}

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  
  // Get data from URL parameters
  const urlName = searchParams.get('name') || '';
  const urlEmail = searchParams.get('email') || '';
  
  const [formData, setFormData] = useState({
    name: urlName,
    email: urlEmail,
    password: '',
    confirmPassword: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validatingEmail, setValidatingEmail] = useState(false);
  const [emailValid, setEmailValid] = useState<boolean | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);

  // Debug function to test subscription query
  const debugSubscriptionQuery = async () => {
    console.log('🔍 Debug: Testing subscription query...');
    
    try {
      // Test 1: Get all subscriptions
      const { data: allSubs, error: allError } = await supabase
        .from('assinaturas')
        .select('*')
        .limit(5);
      
      console.log('📊 All subscriptions (first 5):', { data: allSubs, error: allError });
      
      // Test 2: Search by email with different approaches
      if (formData.email) {
        const testEmail = formData.email.trim();
        
        // Exact match
        const { data: exact, error: exactError } = await supabase
          .from('assinaturas')
          .select('*')
          .eq('Email do cliente', testEmail);
        
        console.log('📧 Exact email match:', { data: exact, error: exactError, email: testEmail });
        
        // Case insensitive match
        const { data: ilike, error: ilikeError } = await supabase
          .from('assinaturas')
          .select('*')
          .ilike('Email do cliente', testEmail);
        
        console.log('📧 Case insensitive match:', { data: ilike, error: ilikeError, email: testEmail });
        
        // Lowercase match
        const { data: lower, error: lowerError } = await supabase
          .from('assinaturas')
          .select('*')
          .eq('Email do cliente', testEmail.toLowerCase());
        
        console.log('📧 Lowercase match:', { data: lower, error: lowerError, email: testEmail.toLowerCase() });
      }
    } catch (error) {
      console.error('Debug query error:', error);
    }
  };

  // Redirect if user is already authenticated
  if (isAuthenticated && user) {
    console.log('User is already authenticated, redirecting to home');
    return <Navigate to="/" replace />;
  }

  // Validate email against subscriptions table when email changes
  useEffect(() => {
    const validateEmail = async () => {
      if (!formData.email || formData.email.length < 3) {
        setEmailValid(null);
        setSubscriptionData(null);
        return;
      }

      setValidatingEmail(true);
      setError('');

      try {
        console.log('🔍 Validating email:', formData.email);
        
        // Try different query approaches to debug the issue
        const { data, error } = await supabase
          .from('assinaturas')
          .select(`
            "ID da assinatura",
            "Status da assinatura", 
            "Email do cliente",
            "Nome do cliente",
            cadastro_mde,
            user_id
          `)
          .ilike('Email do cliente', formData.email.trim())
          .limit(1);

        console.log('📊 Query result:', { data, error, email: formData.email });

        if (error) {
          console.error('Error validating email:', error);
          setEmailValid(false);
          setError('Erro ao validar email. Tente novamente.');
          return;
        }

        // Get the first result if any
        const subscription = data && data.length > 0 ? data[0] : null;
        
        console.log('📋 Subscription found:', subscription);
        
        if (subscription) {
          const status = subscription['Status da assinatura'];
          const isActive = status === 'Ativo' || status === 'ativo' || status === 'ATIVO';
          
          console.log('📊 Subscription status check:', { 
            status, 
            isActive, 
            cadastro_mde: subscription.cadastro_mde 
          });
          
          if (isActive) {
          // Check if user already registered
            if (subscription.cadastro_mde) {
            console.log('User already has an account, redirecting to login');
            setEmailValid(false);
            setError('Este email já possui uma conta ativa.');
            setSubscriptionData(null);
            
            // Redirect to login after 2 seconds
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } else {
            console.log('Email is valid and can register');
            setEmailValid(true);
            setSubscriptionData(subscription);
            // Auto-fill name if available and not already filled
            if (subscription['Nome do cliente'] && !formData.name) {
              setFormData(prev => ({ ...prev, name: subscription['Nome do cliente'] }));
            }
          }
          } else {
          console.log('Email found but subscription not active');
          setEmailValid(false);
          setError(`Sua assinatura está como "${status}". Entre em contato com o suporte.`);
          setSubscriptionData(null);
          }
        } else {
          console.log('Email not found or subscription not active');
          setEmailValid(false);
          setError('Email não encontrado ou assinatura não está ativa.');
          setSubscriptionData(null);
        }
      } catch (error) {
        console.error('Exception validating email:', error);
        setEmailValid(false);
        setError(`Erro ao validar email: ${error.message}. Tente novamente.`);
      } finally {
        setValidatingEmail(false);
      }
    };

    const debounceTimer = setTimeout(validateEmail, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Por favor, preencha todos os campos');
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

    if (!emailValid || !subscriptionData) {
      setError('Email não é válido ou não possui assinatura ativa');
      setIsSubmitting(false);
      return;
    }

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            avatar_url: '/src/images/avatar.jpg',
            is_premium: true, // Since they have an active subscription
          },
        },
      });

      if (authError) {
        console.error('Registration error:', authError);
        if (authError.message.includes('already registered')) {
          setError('Este email já possui uma conta cadastrada.');
        } else {
          setError('Erro ao criar conta: ' + authError.message);
        }
        setIsSubmitting(false);
        return;
      }

      if (!authData.user) {
        setError('Erro ao criar conta. Tente novamente.');
        setIsSubmitting(false);
        return;
      }

      // Update subscription record to mark as registered
      const { error: updateError } = await supabase
        .from('assinaturas')
        .update({ 
          cadastro_mde: true,
          user_id: authData.user.id
        })
        .eq('Email do cliente', formData.email.trim());

      if (updateError) {
        console.error('Error updating subscription:', updateError);
        // Try to continue anyway, but log the error
        console.warn('Could not update subscription record, but user was created successfully');
      }

      // Success - show onboarding
      console.log('Registration successful, logging out and redirecting to login');
      
      // Logout the user immediately after registration
      await supabase.auth.signOut();
      
      // Redirect to login with success message
      navigate('/?registered=true&email=' + encodeURIComponent(formData.email));

    } catch (error) {
      console.error('Registration exception:', error);
      setError('Erro inesperado ao criar conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30 text-center">
          <img
            src="/logo1_branco.png"
            alt="Me dá um Exemplo"
            className="h-16 w-auto mx-auto mb-4"
          />
          <h2 className="text-2xl font-semibold text-white mb-2">Criar Conta</h2>
          <p className="text-slate-400 text-sm">
            Crie sua conta para acessar todo o conteúdo premium
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
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
                className={`w-full pl-10 pr-12 py-3 bg-slate-700/30 border rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all ${
                  emailValid === true 
                    ? 'border-green-500/50' 
                    : emailValid === false 
                    ? 'border-red-500/50' 
                    : 'border-slate-600/30'
                }`}
                placeholder="seu@email.com"
                disabled={isSubmitting}
                required
              />
              
              {/* Email validation indicator */}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {validatingEmail ? (
                  <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
                ) : emailValid === true ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : emailValid === false ? (
                  <AlertCircle className="w-4 h-4 text-red-400" />
                ) : null}
              </div>
            </div>
            
            {emailValid === true && subscriptionData && (
              <p className="text-green-400 text-xs mt-1">
                ✓ Email válido com assinatura ativa
              </p>
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

          {/* Debug Button - Remove this after testing */}
          <button
            type="button"
            onClick={debugSubscriptionQuery}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors text-sm"
          >
            🔍 Debug: Testar Consulta
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