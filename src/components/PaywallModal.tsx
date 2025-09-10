import React from 'react';
import { X, Check, Crown, Shield, Star, Users, Clock, Download, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  contentType: 'video' | 'prompt' | 'live';
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, contentTitle, contentType }) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/?login=true');
  };

  const handleRegister = () => {
    onClose();
    navigate('/registro');
  };

  const handleSubscribe = (plan: 'monthly' | 'annual') => {
    // Open subscription link in new tab
    const subscriptionUrl = plan === 'monthly' 
      ? 'https://pay.hub.la/checkout/3KzbFzhm4Lb56jJcDqut/mensal'
      : 'https://pay.hub.la/checkout/3KzbFzhm4Lb56jJcDqut/anual';
    
    window.open(subscriptionUrl, '_blank', 'noopener,noreferrer');
  };

  const getContentTypeLabel = () => {
    switch (contentType) {
      case 'video': return 'vídeo';
      case 'prompt': return 'prompt';
      case 'live': return 'live';
      default: return 'conteúdo';
    }
  };

  const features = [
    { icon: Star, text: 'Acesso completo a todas as aulas' },
    { icon: Download, text: 'Downloads de materiais e recursos' },
    { icon: MessageCircle, text: 'Participação em comentários e discussões' },
    { icon: Users, text: 'Acesso à comunidade exclusiva' },
    { icon: Clock, text: 'Conteúdo novo toda semana' },
    { icon: Shield, text: 'Suporte prioritário' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="relative p-8 text-center border-b border-slate-700/30">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="w-16 h-16 bg-[#ff7551]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-[#ff7551]" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Desbloqueie o {getContentTypeLabel()}
          </h1>
          <h2 className="text-xl text-[#ff7551] font-semibold mb-4">
            "{contentTitle}"
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Para acessar este conteúdo exclusivo e toda nossa biblioteca de aulas, 
            você precisa ser um membro da comunidade Me dá um Exemplo.
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Features Grid */}
          <div className="mb-12">
            <h3 className="text-xl font-semibold text-white mb-8 text-center">
              O que você ganha como membro:
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-4 bg-slate-700/20 rounded-lg border border-slate-600/20"
                >
                  <div className="w-10 h-10 bg-[#ff7551]/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <feature.icon className="w-5 h-5 text-[#ff7551]" />
                  </div>
                  <span className="text-slate-300 font-medium">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Plans */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {/* Monthly Plan */}
            <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8 relative">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Plano Mensal</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  R$ <span className="text-[#ff7551]">67</span>
                </div>
                <p className="text-slate-400">por mês</p>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Acesso completo à plataforma</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Todas as aulas e materiais</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Suporte prioritário</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Cancele quando quiser</span>
                </div>
              </div>
              
              <button
                onClick={() => handleSubscribe('monthly')}
                className="w-full bg-slate-600/30 hover:bg-slate-500/30 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                Escolher Mensal
              </button>
            </div>

            {/* Annual Plan */}
            <div className="bg-slate-700/30 border-2 border-[#ff7551] rounded-xl p-8 relative">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-[#ff7551] text-white px-6 py-2 rounded-full text-sm font-semibold">
                  Mais Popular
                </div>
              </div>
              
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Plano Anual</h3>
                <div className="text-4xl font-bold text-white mb-2">
                  R$ <span className="text-[#ff7551]">647</span>
                </div>
                <p className="text-slate-400">por ano</p>
                <div className="mt-2">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    Economize R$ 157
                  </span>
                </div>
              </div>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Acesso completo à plataforma</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Todas as aulas e materiais</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">Suporte prioritário</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-slate-300 text-sm">2 meses grátis</span>
                </div>
              </div>
              
              <button
                onClick={() => handleSubscribe('annual')}
                className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-semibold py-4 rounded-lg transition-colors"
              >
                Escolher Anual
              </button>
            </div>
          </div>

          {/* Already a subscriber section */}
          <div className="text-center p-6 bg-slate-700/20 rounded-xl border border-slate-600/20">
            <h3 className="text-white font-semibold mb-3">Já é assinante?</h3>
            <p className="text-slate-400 mb-6">
              Se você já tem uma assinatura ativa, faça login para acessar todo o conteúdo.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleLogin}
                className="px-8 py-3 bg-slate-600/30 hover:bg-slate-500/30 text-white font-medium rounded-lg transition-colors"
              >
                Fazer Login
              </button>
              
              <button
                onClick={handleRegister}
                className="px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors"
              >
                Criar Conta
              </button>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center space-x-8 text-slate-400 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Pagamento Seguro</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>+1000 Membros</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4" />
                <span>Cancele Quando Quiser</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;