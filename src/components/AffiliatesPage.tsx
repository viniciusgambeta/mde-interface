import React, { useState } from 'react';
import { DollarSign, Users, TrendingUp, ExternalLink, ChevronDown, ChevronUp, Target, Shield, Mail, MessageCircle } from 'lucide-react';

const AffiliatesPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const handleJoinAffiliates = () => {
    window.open('https://app.hub.la/group_affiliate/3KzbFzhm4Lb56jJcDqut', '_blank', 'noopener,noreferrer');
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Preciso pagar algo para ser afiliado?",
      answer: "Não! O programa é totalmente gratuito. Você só precisa ser um assinante ativo da comunidade."
    },
    {
      question: "Como recebo minhas comissões?",
      answer: "As comissões são pagas automaticamente pela Hubla, diretamente na sua conta bancária cadastrada."
    },
    {
      question: "Quando recebo o pagamento?",
      answer: "Os pagamentos são processados mensalmente pela Hubla, seguindo o cronograma padrão da plataforma."
    },
    {
      question: "Posso indicar quantas pessoas quiser?",
      answer: "Sim! Não há limite de indicações. Quanto mais pessoas você indicar, maior será sua renda."
    },
    {
      question: "Como acompanho minhas vendas?",
      answer: "Através do painel da Hubla você tem acesso a relatórios completos com todas suas vendas e comissões."
    },
    {
      question: "E se a pessoa cancelar a assinatura?",
      answer: "Você para de receber a comissão recorrente, mas mantém a comissão da primeira venda."
    },
    {
      question: "Quais são os requisitos para ser afiliado?",
      answer: "Você deve ser um assinante ativo da comunidade Me dá um Exemplo e ter uma conta na plataforma Hubla para gerenciar seus links e comissões."
    },
    {
      question: "Como funciona o sistema de comissões?",
      answer: "Você recebe 50% do valor da primeira venda (até R$33,50 no plano mensal e R$299 no anual) + 10% do valor de todas as recorrências (até R$6,70 no mensal e R$59 no anual)."
    },
    {
      question: "Como gero meus links de afiliado?",
      answer: "Você deve gerar seus próprios links de afiliados através da plataforma Hubla. Após se cadastrar no programa, você terá acesso aos links personalizados."
    },
    {
      question: "Posso usar meus links em qualquer lugar?",
      answer: "Sim! Você pode compartilhar seus links de afiliado em redes sociais, blogs, YouTube, WhatsApp ou qualquer outro canal que desejar."
    }
  ];

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white mb-4">Programa de Afiliados</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Ganhe dinheiro indicando a comunidade Me dá um Exemplo para outras pessoas. 
          Comissões atrativas e pagamentos recorrentes garantidos!
        </p>
      </div>

      {/* CTA Button */}
      <div className="text-left">
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
        <div className="text-left">
          <h2 className="text-2xl font-bold text-white mb-4">Como Funciona a Comissão</h2>
          <p className="text-slate-400">
            Sistema de comissionamento justo e transparente
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* First Sale Commission */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
            <div className="text-left mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4">
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
            <div className="text-left mb-6">
              <div className="w-16 h-16 bg-[#ff7551]/20 rounded-full flex items-center justify-center mb-4">
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
        <div className="text-left mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Requisitos para ser Afiliado</h2>
          <p className="text-slate-400">
            Para participar do programa, você precisa atender aos seguintes critérios
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
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

      {/* FAQ Section */}
      <div>
        <div className="text-left mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Perguntas Frequentes</h2>
          <p className="text-slate-400">
            Tire suas dúvidas sobre o programa de afiliados
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-700/30 rounded-lg border border-slate-600/30 overflow-hidden"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-600/20 transition-colors"
              >
                <h3 className="text-white font-medium pr-4">{faq.question}</h3>
                {openFaqIndex === index ? (
                  <ChevronUp className="w-5 h-5 text-slate-400 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                )}
              </button>
              
              {openFaqIndex === index && (
                <div className="px-6 pb-6">
                  <div className="border-t border-slate-600/30 pt-4">
                    <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Contact */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <h3 className="text-white font-semibold text-xl mb-4">Dúvidas sobre o Programa?</h3>
        <p className="text-slate-400 mb-6">
          Nossa equipe está pronta para ajudar você a começar no programa de afiliados
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <a
            href="mailto:afiliados@medaumexemplo.com"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-slate-600/30 hover:bg-slate-500/30 text-white rounded-lg transition-colors"
          >
            <Mail className="w-5 h-5" />
            <span>afiliados@medaumexemplo.com</span>
          </a>
          
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default AffiliatesPage;