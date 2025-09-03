import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { X, Eye, EyeOff, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const { signIn } = useAuth();

  // Check for registration success message
  React.useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      setSuccess('Conta criada com sucesso! Faça login para continuar.');
      const email = searchParams.get('email');
      if (email) {
        setEmail(email);
      }
    } else if (searchParams.get('message') === 'account_exists') {
      setError('Este email já possui uma conta ativa. Faça login para continuar.');
      const email = searchParams.get('email');
      if (email) {
        setEmail(email);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Login form submitted with:', { email, hasPassword: !!password });
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    if (!email || !password) {
      console.log('❌ Login validation failed: missing fields');
      setError('Por favor, preencha todos os campos');
      setIsSubmitting(false);
      return;
    }

    console.log('📤 Calling login function...');
    const result = await signIn(email, password);
    console.log('📥 Login result:', result);
    
    if (result.user && !result.error) {
      console.log('✅ Login successful, closing modal');
      onClose();
      // Clear form
      setEmail('');
      setPassword('');
      setError('');
      setSuccess('');
    } else {
      console.log('❌ Login failed, showing error');
      setError(result.error || 'Email ou senha incorretos');
    }
    
    console.log('🔄 Setting isSubmitting to false');
    setIsSubmitting(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
          <h2 className="text-xl font-semibold text-white">Entrar</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {success && (
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

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
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                placeholder="seu@email.com"
                disabled={isSubmitting}
              />
            </div>
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isSubmitting}
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>

          {/* Demo Credentials */}
          <div className="p-3 bg-slate-700/20 rounded-lg">
            <p className="text-slate-400 text-xs mb-1">Primeira vez? Crie sua conta gratuitamente!</p>
            <p className="text-slate-300 text-xs">Acesso completo a todos os recursos da plataforma.</p>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={() => {
                onClose();
                // Navigate to password reset page
                window.location.href = '/redefinir-senha';
              }}
              className="text-slate-400 hover:text-[#ff7551] text-sm transition-colors"
            >
              Esqueci minha senha
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/30 text-center">
          <p className="text-slate-400 text-sm">
            Não tem uma conta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-[#ff7551] hover:text-[#ff7551]/80 font-medium transition-colors"
            >
              Criar conta
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;