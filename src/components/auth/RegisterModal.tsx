import React, { useState } from 'react';
import { X, Eye, EyeOff, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModal: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Registration form submitted with:', { name, email, hasPassword: !!password });
    setError('');
    setIsSubmitting(true);

    if (!name || !email || !password || !confirmPassword) {
      console.log('❌ Registration validation failed: missing fields');
      setError('Por favor, preencha todos os campos');
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Registration validation failed: passwords do not match');
      setError('As senhas não coincidem');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      console.log('❌ Registration validation failed: password too short');
      setError('A senha deve ter pelo menos 6 caracteres');
      setIsSubmitting(false);
      return;
    }

    try {
      console.log('📤 Calling register function...');
      const result = await signUp(email, password, name);
      console.log('📥 Registration result:', result);
      
      if (!result.error) {
        console.log('✅ Registration successful, closing modal');
        setShowSuccess(true);
      } else {
        console.log('❌ Registration failed, showing error');
        setError(result.error || 'Erro ao criar conta. Tente novamente.');
      }
    } catch (error) {
      console.error('💥 Registration exception in component:', error);
      setError('Erro ao criar conta. Tente novamente.');
    } finally {
      console.log('🔄 Setting isSubmitting to false');
      setIsSubmitting(false);
    }
  };

  const handleGoToLogin = async () => {
    console.log('🚪 Going to login, forcing logout first...');
    
    try {
      // Force logout to ensure clean state
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Error during forced logout:', error);
      }
    } catch (error) {
      console.error('💥 Exception during forced logout:', error);
    }
    
    // Reset modal state
    setShowSuccess(false);
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    
    // Switch to login modal
    onSwitchToLogin();
  };

  // Success Screen Component
  const SuccessScreen = () => (
    <div className="text-center space-y-6 p-6">
      <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-10 h-10 text-green-400" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Conta Criada com Sucesso!
        </h2>
        <p className="text-slate-400">
          Sua conta foi criada com sucesso! Para sua segurança, você precisa fazer login para acessar a plataforma.
        </p>
      </div>
      
      <button
        onClick={handleGoToLogin}
        className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium py-4 rounded-lg transition-colors"
      >
        Fazer Login
      </button>
      
      <p className="text-slate-400 text-sm">
        Use o email e senha que você acabou de criar para entrar na plataforma.
      </p>
    </div>
  );
  if (!isOpen) return null;

  // Show success screen if registration was successful
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md animate-fade-in">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
            <h2 className="text-xl font-semibold text-white">Registro Concluído</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
            >
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          
          <SuccessScreen />
        </div>
      </div>
    );
  }
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
          <h2 className="text-xl font-semibold text-white">Criar Conta</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                placeholder="Seu nome completo"
                disabled={isSubmitting}
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

          {/* Confirm Password Field */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Confirmar Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                placeholder="••••••••"
                disabled={isSubmitting}
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
            disabled={isSubmitting}
            className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
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
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700/30 text-center">
          <p className="text-slate-400 text-sm">
            Já tem uma conta?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-[#ff7551] hover:text-[#ff7551]/80 font-medium transition-colors"
            >
              Entrar
            </button>
          </p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => {
                onClose();
                window.location.href = '/redefinir-senha';
              }}
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

export default RegisterModal;