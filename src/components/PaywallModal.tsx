import React, { useState } from 'react';
import { X, Check, Crown, Shield, Star, Users, Clock, Download, MessageCircle, Zap, BookOpen, Headphones } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentTitle: string;
  contentType: 'video' | 'prompt' | 'live';
}

const PaywallModal: React.FC<PaywallModalProps> = ({ isOpen, onClose, contentTitle, contentType }) => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>('monthly');

  const handleLogin = () => {
    onClose();
    navigate('/?login=true');
  };

  const handleSubscribe = () => {
    // Open subscription link in new tab based on selected plan
    const subscriptionUrl = selectedPlan === 'monthly' 
      ? 'https://pay.hub.la/3KzbFzhm4Lb56jJcDqut'
      : 'https://pay.hub.la/a5RfC0GNmxTyy5CGekcT';
    
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

  const benefits = [
    { icon: Star, text: 'Acesso completo a todas as aulas' },
    { icon: Download, text: 'Downloads de materiais e recursos' },
    { icon: Users, text: 'Acesso à comunidade exclusiva' },
    { icon: Clock, text: 'Conteúdo novo toda semana' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto animate-fade-in">
        {/* Header */}
        <div className="relative p-6 border-b border-slate-700/30">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-[#ff7551]/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-[#ff7551]" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              Desbloqueie o {getContentTypeLabel()}
            </h1>
            <h2 className="text-lg text-[#ff7551] font-semibold">
              "{contentTitle}"
            </h2>
          {/* Already a subscriber link */}
          <div className="text-center mt-4">
            <button
              onClick={handleLogin}
              className="text-slate-400 hover:text-[#ff7551] text-sm transition-colors"
            >
              Já é assinante? Fazer login
            </button>
                      <benefit.icon className="w-4 h-4 text-[#ff7551]" />
                    </div>
                    <span className="text-slate-300 text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Selection */}
            <div className="mb-8">
              <h4 className="text-lg font-semibold text-white mb-4 text-left">
                Escolha seu plano:
              </h4>
              
              <div className="space-y-3">
                {/* Monthly Plan */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedPlan === 'monthly'
                      ? 'border-[#ff7551] bg-[#ff7551]/10'
                      : 'border-slate-600/30 bg-slate-700/20 hover:border-slate-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-lg">Plano Mensal</div>
                      <div className="text-slate-400 text-sm">Flexibilidade total</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        R$ <span className="text-[#ff7551]">67</span>
                      </div>
                      <div className="text-slate-400 text-sm">por mês</div>
                    </div>
                  </div>
                </button>

                {/* Annual Plan */}
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left relative ${
                    selectedPlan === 'annual'
                      ? 'border-[#ff7551] bg-[#ff7551]/10'
                      : 'border-slate-600/30 bg-slate-700/20 hover:border-slate-500/50'
                  }`}
                >
                  {/* Discount Badge */}
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                    Economize 20%
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-lg">Plano Anual</div>
                      <div className="text-slate-400 text-sm">Melhor custo-benefício</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-white">
                        R$ <span className="text-[#ff7551]">643</span>
                      </div>
                      <div className="text-slate-400 text-sm">por ano</div>
                      <div className="text-green-400 text-xs font-medium">
                        ~R$ 53,58/mês
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Subscribe Button */}
            <button
              onClick={handleSubscribe}
              className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-bold py-4 px-6 rounded-lg transition-colors text-lg mb-6"
            >
              {selectedPlan === 'monthly' ? 'Assinar Plano Mensal' : 'Assinar Plano Anual'}
            </button>

            {/* Already a subscriber section */}
            <div className="text-center p-4 bg-slate-700/20 rounded-lg border border-slate-600/20">
              <h4 className="text-white font-semibold mb-2">Já é assinante?</h4>
              <p className="text-slate-400 mb-4 text-sm">
                Se você já tem uma assinatura ativa, faça login para acessar todo o conteúdo.
              </p>
              
              <button
                onClick={handleLogin}
                className="px-6 py-2 bg-slate-600/30 hover:bg-slate-500/30 text-white font-medium rounded-lg transition-colors"
              >
                Fazer Login
              </button>
            </div>

            {/* Trust indicators */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-6 text-slate-400 text-sm">
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
    </div>
  );
};

export default PaywallModal;