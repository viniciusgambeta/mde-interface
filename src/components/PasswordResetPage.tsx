import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PasswordResetPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  
  // Form states
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'loading' | 'request' | 'update' | 'success'>('loading');
  const [isValidatingToken, setIsValidatingToken] = useState(false);
  const hashProcessedRef = useRef(false);

  // Handle password reset tokens from URL hash - only run once
  useEffect(() => {
    // Prevent multiple executions
    if (hashProcessedRef.current) {
      return;
    }
    
    const handlePasswordResetFromHash = async () => {
      hashProcessedRef.current = true;
      
      // Check if there are parameters in the hash
      const hash = window.location.hash;
      if (!hash || hash.length <= 1) {
        console.log('🔍 No hash found, setting step to request');
        setStep('request');
        return;
      }

      console.log('🔑 Password reset hash found:', hash);
      setIsValidatingToken(true);
      
      try {
        // Parse hash parameters (remove the # and parse as URLSearchParams)
        const hashParams = new URLSearchParams(hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('📋 Hash parameters:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });

        if (accessToken && type === 'recovery') {
          console.log('🔐 Valid recovery token found, setting session...');
          
          // Set the session with the tokens from the hash
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('❌ Error setting session:', error);
            setError('Link de redefinição inválido ou expirado. Solicite um novo link.');
            setStep('request');
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            return;
          }

          if (data.session) {
            console.log('✅ Session set successfully, switching to update step');
            setStep('update');
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
          } else {
            console.error('❌ No session created');
            setError('Link de redefinição inválido. Solicite um novo link.');
            setStep('request');
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
            
            // Clear the hash from URL
            window.history.replaceState(null, '', window.location.pathname);
          }
        } else {
          console.log('⚠️ Invalid or missing recovery parameters in hash');
          setStep('request');
        }
      } catch (error) {
        console.error('💥 Exception handling password reset hash:', error);
        setError('Erro ao processar link de redefinição. Tente novamente.');
        setStep('request');
        
        // Clear the hash from URL
        window.history.replaceState(null, '', window.location.pathname);
      }
    };

    handlePasswordResetFromHash();
  }, []);

  // Redirect if user is already authenticated and not updating password
  useEffect(() => {
    // Only redirect if we've processed the hash and we're not in update mode
    if (!authLoading && isAuthenticated && hashProcessedRef.current && step === 'request') {
      console.log('🔒 Authenticated user on request step, redirecting to home');
      navigate('/');
    }
  }, [authLoading, isAuthenticated, step, navigate]);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!email) {
      setError('Por favor, digite seu email');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📧 Requesting password reset for:', email);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/redefinir-senha`
      });

      if (error) {
        console.error('❌ Password reset request error:', error);
        setError('Erro ao enviar email de redefinição. Verifique se o email está correto.');
      } else {
        console.log('✅ Password reset email sent successfully');
        setSuccess(true);
        setStep('success');
      }
    } catch (error) {
      console.error('💥 Password reset request exception:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Validation
    if (!newPassword || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      setIsSubmitting(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem');
      setIsSubmitting(false);
      return;
    }

    if (newPassword.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('🔐 Updating password...');
      
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('❌ Password update error:', error);
        setError('Erro ao atualizar senha. Tente novamente.');
      } else {
        console.log('✅ Password updated successfully');
        setSuccess(true);
        setStep('success');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/?login=true');
        }, 3000);
      }
    } catch (error) {
      console.error('💥 Password update exception:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRequestForm = () => (
    <form onSubmit={handleRequestReset} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Email da sua conta
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
            placeholder="seu@email.com"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Enviando...</span>
          </>
        ) : (
          <>
            <Mail className="w-5 h-5" />
            <span>Enviar Link de Redefinição</span>
          </>
        )}
      </button>

      <div className="p-4 bg-slate-700/20 rounded-lg">
        <p className="text-slate-400 text-sm text-center">
          Você receberá um email com instruções para redefinir sua senha.
        </p>
      </div>
    </form>
  );

  const renderUpdateForm = () => (
    <form onSubmit={handleUpdatePassword} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nova Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showNewPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
            placeholder="••••••••"
            disabled={isSubmitting}
            required
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
            disabled={isSubmitting}
          >
            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Confirmar Nova Senha
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full pl-12 pr-12 py-4 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
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

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium py-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Atualizando...</span>
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            <span>Atualizar Senha</span>
          </>
        )}
      </button>
    </form>
  );

  const renderSuccessMessage = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {step === 'success' && step === 'update' ? 'Senha Atualizada!' : 'Email Enviado!'}
        </h2>
        <p className="text-slate-400">
          {step === 'success' && step === 'update'
            ? 'Sua senha foi atualizada com sucesso. Você será redirecionado para o login em instantes.'
            : 'Verifique sua caixa de entrada e clique no link para redefinir sua senha.'
          }
        </p>
      </div>

      {step === 'success' && step !== 'update' && (
        <div className="p-4 bg-slate-700/20 rounded-lg">
          <p className="text-slate-400 text-sm">
            Não recebeu o email? Verifique sua pasta de spam ou tente novamente.
          </p>
        </div>
      )}

      <button
        onClick={() => navigate('/?login=true')}
        className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium py-4 rounded-lg transition-colors"
      >
        {step === 'success' && step === 'update' ? 'Ir para Login' : 'Voltar ao Login'}
      </button>
    </div>
  );

  // Show loading while auth is initializing or validating token
  if (authLoading || step === 'loading' || isValidatingToken) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center p-4">
        <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md">
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-[#ff7551]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-[#ff7551] animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Validando Link
            </h2>
            <p className="text-slate-400">
              Verificando o link de redefinição de senha...
            </p>
            <span className="text-slate-400">
              {isValidatingToken ? 'Validando link...' : 'Carregando...'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-slate-700/30">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </button>
            <img
              src="/logo1_branco.png"
              alt="Me dá um Exemplo"
              className="h-12 w-auto"
            />
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-white mb-2">
              {step === 'update' ? 'Nova Senha' : step === 'success' ? 'Concluído' : 'Esqueci a Senha'}
            </h1>
            <p className="text-slate-400 text-sm">
              {step === 'update' 
                ? 'Digite sua nova senha abaixo'
                : step === 'success' 
                ? 'Processo concluído com sucesso'
                : 'Digite seu email para receber o link de redefinição'
              }
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'request' && renderRequestForm()}
          {step === 'update' && renderUpdateForm()}
          {step === 'success' && renderSuccessMessage()}
        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="p-6 border-t border-slate-700/30 text-center">
            <p className="text-slate-400 text-sm">
              Lembrou da senha?{' '}
              <button
                onClick={() => navigate('/?login=true')}
                className="text-[#ff7551] hover:text-[#ff7551]/80 font-medium transition-colors"
              >
                Fazer login
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PasswordResetPage;