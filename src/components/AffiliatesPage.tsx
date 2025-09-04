import React from 'react';
import { DollarSign, Users, TrendingUp, ExternalLink, CheckCircle, Gift, Target, Calculator, ArrowRight, Star, Shield } from 'lucide-react';

const AffiliatesPage: React.FC = () => {
  const handleJoinAffiliates = () => {
    window.open('https://app.hub.la/group_affiliate/3KzbFzhm4Lb56jJcDqut', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Programa de Afiliados</h1>
        <p className="text-slate-400 text-xl max-w-3xl mx-auto">
          Ganhe dinheiro indicando a comunidade Me dá um Exemplo para outras pessoas. 
          Comissões atrativas e pagamentos recorrentes garantidos!
        </p>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#ff7551]/20 to-[#ff7551]/10 border border-[#ff7551]/30 rounded-xl p-8 lg:p-12 text-center">
        <div className="w-20 h-20 bg-[#ff7551] rounded-full flex items-center justify-center mx-auto mb-6">
          <DollarSign className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-4">
          Transforme sua rede em renda
        </h2>
        <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto">
          Indique amigos, colegas e seguidores para a comunidade e receba comissões 
          tanto na primeira venda quanto nas recorrências mensais.
        </p>
        
        <button
          onClick={handleJoinAffiliates}
          className="inline-flex items-center space-x-3 px-8 py-4 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 text-lg"
        >
          <Users className="w-6 h-6" />
          <span>Quero ser Afiliado</span>
          <ExternalLink className="w-5 h-5" />
        </button>
      </div>

      {/* Commission Structure */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Como Funciona a Comissão</h2>
          <p className="text-slate-400 text-lg">
            Sistema de comissionamento justo e transparente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* First Sale Commission */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Primeira Venda</h3>
              <div className="text-4xl font-bold text-green-400 mb-2">50%</div>
              <p className="text-slate-400">de comissão na primeira venda</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-600/20 rounded-lg">
                <span className="text-slate-300">Plano Mensal</span>
                <span className="text-white font-semibold">até R$ 33,50</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-600/20 rounded-lg">
                <span className="text-slate-300">Plano Anual</span>
                <span className="text-white font-semibold">até R$ 299,00</span>
              </div>
            </div>
          </div>

          {/* Recurring Commission */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[#ff7551]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-[#ff7551]" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Recorrências</h3>
              <div className="text-4xl font-bold text-[#ff7551] mb-2">10%</div>
              <p className="text-slate-400">de todas as renovações</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-600/20 rounded-lg">
                <span className="text-slate-300">Mensal (por mês)</span>
                <span className="text-white font-semibold">até R$ 6,70</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-600/20 rounded-lg">
                <span className="text-slate-300">Anual (por ano)</span>
                <span className="text-white font-semibold">até R$ 59,00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Requisitos para ser Afiliado</h2>
          <p className="text-slate-400 text-lg">
            Para participar do programa, você precisa atender aos seguintes critérios
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="flex items-start space-x-4 p-6 bg-slate-600/20 rounded-lg">
            <div className="w-12 h-12 bg-[#ff7551]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-[#ff7551]" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">Assinante Ativo</h3>
              <p className="text-slate-400">
                Você deve ser um membro ativo da comunidade Me dá um Exemplo com assinatura em dia.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4 p-6 bg-slate-600/20 rounded-lg">
            <div className="w-12 h-12 bg-[#ff7551]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <Users className="w-6 h-6 text-[#ff7551]" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg mb-2">Conta na Hubla</h3>
              <p className="text-slate-400">
                É necessário ter uma conta na plataforma Hubla para gerenciar seus links e comissões.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Como Funciona</h2>
          <p className="text-slate-400 text-lg">
            Processo simples em 4 passos
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              step: '1',
              title: 'Cadastre-se',
              description: 'Acesse a Hubla e se cadastre no programa de afiliados',
              icon: Users,
              color: 'bg-blue-500'
            },
            {
              step: '2',
              title: 'Gere seus Links',
              description: 'Crie links personalizados para compartilhar com sua audiência',
              icon: ExternalLink,
              color: 'bg-green-500'
            },
            {
              step: '3',
              title: 'Compartilhe',
              description: 'Divulgue os links nas suas redes sociais e canais',
              icon: TrendingUp,
              color: 'bg-purple-500'
            },
            {
              step: '4',
              title: 'Receba',
              description: 'Ganhe comissões automáticas a cada venda e renovação',
              icon: DollarSign,
              color: 'bg-[#ff7551]'
            }
          ].map((item, index) => (
            <div key={index} className="text-center group">
              <div className="relative mb-6">
                <div className={`w-16 h-16 ${item.color}/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  <item.icon className={`w-8 h-8 ${item.color.replace('bg-', 'text-')}`} />
                </div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm`}>
                  {item.step}
                </div>
              </div>
              <h3 className="text-white font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Earnings Calculator */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-4">Simulador de Ganhos</h2>
          <p className="text-slate-400 text-lg">
            Veja quanto você pode ganhar indicando pessoas
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly Plan */}
          <div className="bg-slate-600/20 rounded-lg p-6">
            <h3 className="text-white font-semibold text-xl mb-4 text-center">Plano Mensal</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">1ª venda (50%)</span>
                <span className="text-green-400 font-semibold">R$ 33,50</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Por mês (10%)</span>
                <span className="text-[#ff7551] font-semibold">R$ 6,70</span>
              </div>
              <div className="border-t border-slate-600/30 pt-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-white font-semibold">Total em 12 meses</span>
                  <span className="text-white font-bold">R$ 113,90</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">por pessoa indicada</p>
              </div>
            </div>
          </div>

          {/* Annual Plan */}
          <div className="bg-slate-600/20 rounded-lg p-6 border-2 border-[#ff7551]/30">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <h3 className="text-white font-semibold text-xl text-center">Plano Anual</h3>
              <Star className="w-5 h-5 text-[#ff7551]" />
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">1ª venda (50%)</span>
                <span className="text-green-400 font-semibold">R$ 299,00</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">Por ano (10%)</span>
                <span className="text-[#ff7551] font-semibold">R$ 59,00</span>
              </div>
              <div className="border-t border-slate-600/30 pt-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="text-white font-semibold">Total em 2 anos</span>
                  <span className="text-white font-bold">R$ 417,00</span>
                </div>
                <p className="text-slate-400 text-sm mt-1">por pessoa indicada</p>
              </div>
            </div>
          </div>
        </div>

        {/* Example Calculation */}
        <div className="mt-8 p-6 bg-[#ff7551]/10 border border-[#ff7551]/20 rounded-lg">
          <div className="text-center">
            <h4 className="text-white font-semibold text-lg mb-2">Exemplo Prático</h4>
            <p className="text-slate-300 mb-4">
              Se você indicar 10 pessoas no plano anual:
            </p>
            <div className="text-3xl font-bold text-[#ff7551] mb-2">
              R$ 4.170,00
            </div>
            <p className="text-slate-400 text-sm">
              em 2 anos (R$ 2.990 na primeira venda + R$ 1.180 em recorrências)
            </p>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Vantagens do Programa</h2>
          <p className="text-slate-400 text-lg">
            Por que escolher nosso programa de afiliados
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: DollarSign,
              title: 'Comissões Altas',
              description: 'Uma das maiores comissões do mercado: 50% na primeira venda + 10% recorrente',
              color: 'text-green-400'
            },
            {
              icon: TrendingUp,
              title: 'Renda Recorrente',
              description: 'Ganhe todo mês enquanto seus indicados mantiverem a assinatura ativa',
              color: 'text-[#ff7551]'
            },
            {
              icon: Users,
              title: 'Suporte Completo',
              description: 'Material de divulgação, treinamentos e suporte dedicado para afiliados',
              color: 'text-blue-400'
            },
            {
              icon: Calculator,
              title: 'Relatórios Detalhados',
              description: 'Acompanhe suas vendas, comissões e performance em tempo real na Hubla',
              color: 'text-purple-400'
            },
            {
              icon: Gift,
              title: 'Sem Taxa de Adesão',
              description: 'Participe gratuitamente, sem custos de entrada ou mensalidades',
              color: 'text-yellow-400'
            },
            {
              icon: Shield,
              title: 'Pagamentos Garantidos',
              description: 'Receba suas comissões automaticamente via Hubla, sem atrasos',
              color: 'text-indigo-400'
            }
          ].map((benefit, index) => (
            <div
              key={index}
              className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 hover:bg-slate-600/20 transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-12 h-12 bg-slate-600/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                  <benefit.icon className={`w-6 h-6 ${benefit.color}`} />
                </div>
                <h3 className="text-white font-semibold text-lg mb-3">{benefit.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Perguntas Frequentes</h2>
          <p className="text-slate-400 text-lg">
            Tire suas dúvidas sobre o programa
          </p>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          {[
            {
              question: 'Preciso pagar algo para ser afiliado?',
              answer: 'Não! O programa é totalmente gratuito. Você só precisa ser um assinante ativo da comunidade.'
            },
            {
              question: 'Como recebo minhas comissões?',
              answer: 'As comissões são pagas automaticamente pela Hubla, diretamente na sua conta bancária cadastrada.'
            },
            {
              question: 'Quando recebo o pagamento?',
              answer: 'Os pagamentos são processados mensalmente pela Hubla, seguindo o cronograma padrão da plataforma.'
            },
            {
              question: 'Posso indicar quantas pessoas quiser?',
              answer: 'Sim! Não há limite de indicações. Quanto mais pessoas você indicar, maior será sua renda.'
            },
            {
              question: 'Como acompanho minhas vendas?',
              answer: 'Através do painel da Hubla você tem acesso a relatórios completos com todas suas vendas e comissões.'
            },
            {
              question: 'E se a pessoa cancelar a assinatura?',
              answer: 'Você para de receber a comissão recorrente, mas mantém a comissão da primeira venda.'
            }
          ].map((faq, index) => (
            <div key={index} className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-6">
              <h3 className="text-white font-semibold text-lg mb-3">{faq.question}</h3>
              <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#ff7551] to-[#ff7551]/80 rounded-xl p-8 lg:p-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">
          Pronto para Começar?
        </h2>
        <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
          Junte-se ao nosso programa de afiliados e comece a monetizar sua rede hoje mesmo. 
          É rápido, fácil e totalmente gratuito!
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={handleJoinAffiliates}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-white hover:bg-gray-100 text-[#ff7551] font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
          >
            <Users className="w-6 h-6" />
            <span>Cadastrar como Afiliado</span>
            <ArrowRight className="w-5 h-5" />
          </button>
          
          <div className="text-white/80 text-sm">
            Cadastro gratuito • Sem compromisso
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8 text-center">
        <h3 className="text-white font-semibold text-xl mb-4">Dúvidas sobre o Programa?</h3>
        <p className="text-slate-400 mb-6">
          Nossa equipe está pronta para ajudar você a começar no programa de afiliados
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:afiliados@medaumexemplo.com"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-600/30 hover:bg-slate-500/30 text-white rounded-lg transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            <span>afiliados@medaumexemplo.com</span>
          </a>
          
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <span>WhatsApp</span>
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesPage;