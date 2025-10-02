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
    { icon: BookOpen, text: 'E-books e materiais complementares' },
    { icon: Headphones, text: 'Lives exclusivas mensais' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 rounded-xl max-w-5xl w-full max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 flex-shrink-0">
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors ml-auto"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Main content */}
        <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 overflow-hidden">
          {/* Left side - Image */}
          <div className="flex items-center justify-center overflow-hidden max-h-[40vh] lg:max-h-none">
            <img
              src="/destaque1_modal.png"
              alt="Destaque da comunidade"
              className="w-full h-auto max-h-[35vh] lg:max-h-[70vh] object-contain rounded-lg"
            />
          </div>

          {/* Right side - Benefits and Plans */}
          <div className="flex flex-col space-y-4 overflow-hidden">
            {/* Benefits */}
            <div>
              <h3 className="text-lg font-bold text-white mb-3">
                O que você vai ter acesso:
              </h3>

              <div className="space-y-2">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-2 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="w-5 h-5 rounded-full bg-[#ff7551]/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-3 h-3 text-[#ff7551]" />
                    </div>
                    <span className="text-slate-300 text-sm">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Plan Selection */}
            <div>
              <h4 className="text-base font-semibold text-white mb-3 text-left">
                Escolha seu plano:
              </h4>

              <div className="space-y-2">
                {/* Monthly Plan */}
                <button
                  onClick={() => setSelectedPlan('monthly')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                    selectedPlan === 'monthly'
                      ? 'border-[#ff7551] bg-[#ff7551]/10'
                      : 'border-slate-600/30 bg-slate-700/20 hover:border-slate-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-base">Plano Mensal</div>
                      <div className="text-slate-400 text-xs">Flexibilidade total</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        R$ <span className="text-[#ff7551]">67</span>
                      </div>
                      <div className="text-slate-400 text-xs">por mês</div>
                    </div>
                  </div>
                </button>

                {/* Annual Plan */}
                <button
                  onClick={() => setSelectedPlan('annual')}
                  className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left relative ${
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
                      <div className="text-white font-semibold text-base">Plano Anual</div>
                      <div className="text-slate-400 text-xs">Melhor custo-benefício</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-white">
                        R$ <span className="text-[#ff7551]">643</span>
                      </div>
                      <div className="text-slate-400 text-xs">por ano</div>
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
              className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-bold py-3 px-6 rounded-lg transition-colors text-base"
            >
              {selectedPlan === 'monthly' ? 'Assinar Plano Mensal' : 'Assinar Plano Anual'}
            </button>

            {/* Login link */}
            <div className="text-center">
              <button
                onClick={handleLogin}
                className="text-slate-400 hover:text-[#ff7551] text-xs transition-colors"
              >
                Já é assinante? Fazer login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;