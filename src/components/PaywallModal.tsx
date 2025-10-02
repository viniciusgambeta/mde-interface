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
    { icon: Crown, text: 'Acesso completo a todos os vídeos premium' },
    { icon: Zap, text: 'Prompts exclusivos para IA' },
    { icon: Users, text: 'Comunidade VIP no Discord' },
    { icon: BookOpen, text: 'E-books e materiais complementares' },
    { icon: MessageCircle, text: 'Suporte prioritário' },
    { icon: Download, text: 'Downloads ilimitados' },
    { icon: Clock, text: 'Acesso antecipado a novos conteúdos' },
    { icon: Headphones, text: 'Lives exclusivas mensais' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-white">
              Desbloqueie este {getContentTypeLabel()}
            </h2>
            <p className="text-slate-400 mt-1">
              "{contentTitle}"
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main content */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left side - Image */}
          <div className="flex items-center justify-center">
            <img 
              src="/destaque1_modal.png" 
              alt="Destaque da comunidade" 
              className="w-full max-w-md rounded-lg shadow-lg"
            />
          </div>

          {/* Right side - Benefits and Plans */}
          <div className="space-y-6">
            {/* Benefits */}
            <div>
              <h3 className="text-xl font-bold text-white mb-4">
                O que você vai ter acesso:
              </h3>
              
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div 
                    key={index}
                    className="flex items-center space-x-3 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#ff7551]/20 flex items-center justify-center flex-shrink-0">
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