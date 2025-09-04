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
      answer: (
        <span>
          As comissões são pagas automaticamente pela Hubla, diretamente na sua conta bancária cadastrada. 
          Acompanhe seus pagamentos na{' '}
          <a 
            href="https://app.hub.la/dashboard/financial" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff7551] hover:text-[#ff7551]/80 transition-colors underline"
          >
            carteira da Hubla
          </a>.
        </span>
      )
    },
    {
      question: "Onde encontro meu link de afiliado?",
      answer: (
        <span>
          Seu link fica disponível na Hubla em: Produtos > Minhas afiliações > Links. Ou acesse diretamente:{' '}
          <a 
            href="https://app.hub.la/dashboard/products" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff7551] hover:text-[#ff7551]/80 transition-colors underline"
          >
            Dashboard Hubla
          </a>
          <br /><br />
          ⚠️ Sempre use o link exclusivo gerado para você. Links genéricos ou compartilhados de outra forma não contabilizam comissão.
        </span>
      )
    },
    {
      question: "Quando recebo minha comissão?",
      answer: "As vendas podem levar até 36 horas para aparecer na Dashboard da Hubla.\nLiberação de valores:\n- 2 dias para pagamentos via Pix.\n- 15 dias para pagamentos no cartão de crédito."
    },
    {
      question: "Vendi pelo meu link, mas não recebi a comissão. O que pode ter acontecido?",
      answer: (
        <span>
          Principais motivos:
          <br />- Venda ainda dentro do prazo de compensação (até 36h).
          <br />- Pagamento ainda não liberado pelo método escolhido.
          <br />- Link incorreto ou compartilhado sem rastreio.
          <br />- Cliente com bloqueio de cookies no navegador (impede o rastreamento).
          <br />- Afiliado comprou com o próprio link (não é comissionado).
          <br />- O programa de afiliados pode ter sido encerrado pelo produtor.
          <br /><br />
          Se não for nenhum desses casos, entre em contato com o suporte da{' '}
          <a 
            href="https://help.hub.la/hc/pt-br" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff7551] hover:text-[#ff7551]/80 transition-colors underline"
          >
            Central de Ajuda Hubla
          </a>
        </span>
      )
    },
    {
      question: "Posso usar meu próprio link para assinar?",
      answer: "Não. Compras feitas pelo próprio link não geram comissão."
    },
    {
      question: "Posso divulgar em qualquer canal?",
      answer: "Use apenas os links oficiais da Hubla.\n\nNão utilize práticas antiéticas, como spam, promessas enganosas ou uso de marcas registradas sem autorização. Afiliados que descumprirem boas práticas podem ser removidos do programa."
    },
    {
      question: "Posso indicar quantas pessoas quiser?",
      answer: "Sim! Não há limite de indicações. Quanto mais pessoas você indicar, maior será sua renda."
    },
    {
      question: "Como acompanho minhas vendas?",
      answer: (
        <span>
          Através do{' '}
          <a 
            href="https://app.hub.la/dashboard/sales" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-[#ff7551] hover:text-[#ff7551]/80 transition-colors underline"
          >
            painel da Hubla
          </a>
          {' '}você tem acesso a relatórios completos com todas suas vendas e comissões.
        </span>
      )
    },
    {
      question: "E se a pessoa cancelar a assinatura?",
      answer: "Você para de receber a comissão recorrente, mas mantém a comissão da primeira venda."
    },
    {
      question: "Quais são os requisitos para ser afiliado?",
      answer: "Você deve ser um assinante ativo da comunidade Me dá um Exemplo e ter uma conta na plataforma Hubla para gerenciar seus links e comissões."
    }
  ];

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white mb-4">Programa de Afiliados</h1>
        <p className="text-slate-400 text-lg max-w-4xl leading-relaxed">
          Ganhe dinheiro indicando a comunidade Me dá um Exemplo para outras pessoas. 
          Nosso programa de afiliados oferece comissões atrativas tanto na primeira venda quanto nas renovações mensais/anuais.
          <br /><br />
          Como afiliado, você receberá um link exclusivo para compartilhar com sua audiência. Sempre que alguém se inscrever através do seu link, você ganha uma comissão imediata e também uma porcentagem de todas as renovações futuras dessa pessoa.
          <br /><br />
          É uma excelente oportunidade para monetizar seu conteúdo, seja em redes sociais, blog, YouTube ou qualquer outro canal onde você tenha audiência interessada em automação e inteligência artificial.
        </p>
      </div>

      {/* Commission Structure - Compact */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Estrutura de Comissões</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {/* First Sale Commission */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                <Target className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Primeira Venda</h3>
                <div className="text-2xl font-bold text-green-400">50%</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Mensal:</span>
                <span className="text-white">até R$ 33,50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Anual:</span>
                <span className="text-white">até R$ 299,00</span>
              </div>
            </div>
          </div>

          {/* Recurring Commission */}
          <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-10 h-10 bg-[#ff7551]/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#ff7551]" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Recorrências</h3>
                <div className="text-2xl font-bold text-[#ff7551]">10%</div>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Mensal:</span>
                <span className="text-white">até R$ 6,70/mês</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Anual:</span>
                <span className="text-white">até R$ 59,00/ano</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Requirements - Compact */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-white">Requisitos</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-4 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            <div className="w-10 h-10 bg-[#ff7551]/20 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-[#ff7551]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Assinante Ativo</h3>
              <p className="text-slate-400 text-sm">Membro da comunidade</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg">
            <div className="w-10 h-10 bg-[#ff7551]/20 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-[#ff7551]" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Conta na Hubla</h3>
              <p className="text-slate-400 text-sm">Para gerenciar links e comissões</p>
            </div>
          </div>
        </div>
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
                    <p className="text-slate-300 leading-relaxed whitespace-pre-line">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AffiliatesPage;