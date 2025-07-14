import React, { useState } from 'react';
import { MessageCircle, Phone, Mail, ChevronDown, ChevronUp, Bot, Clock, Users, Shield } from 'lucide-react';

const HelpPage: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqData = [
    {
      question: "Como posso acessar as aulas premium?",
      answer: "Para acessar as aulas premium, você precisa fazer upgrade para uma conta premium. Clique no seu perfil e selecione 'Upgrade' para ver os planos disponíveis."
    },
    {
      question: "Posso baixar as aulas para assistir offline?",
      answer: "Sim! Membros premium podem baixar as aulas para assistir offline. Procure pelo botão de download na página da aula."
    },
    {
      question: "Como salvo minhas aulas favoritas?",
      answer: "Clique no ícone de bookmark (marcador) que aparece nos cards das aulas ou na página do vídeo. Suas aulas salvas ficam disponíveis na seção 'Salvos' do menu."
    },
    {
      question: "Posso cancelar minha assinatura premium a qualquer momento?",
      answer: "Sim, você pode cancelar sua assinatura premium a qualquer momento através das configurações da sua conta. O acesso premium continuará até o final do período pago."
    },
    {
      question: "Como funciona a inteligência artificial para tirar dúvidas?",
      answer: "Nossa IA está treinada com o conteúdo das aulas e pode responder dúvidas específicas sobre os tópicos abordados. Clique em 'Perguntar para IA' em qualquer aula."
    },
    {
      question: "Recebo certificado ao completar as aulas?",
      answer: "Sim! Ao completar uma trilha de aprendizado ou curso específico, você recebe um certificado digital que pode ser compartilhado no LinkedIn."
    },
    {
      question: "Como posso sugerir novos tópicos ou aulas?",
      answer: "Adoramos sugestões! Entre em contato conosco pelo WhatsApp ou email com suas ideias. Nossa equipe avalia todas as sugestões recebidas."
    },
    {
      question: "Existe limite de aulas que posso assistir por dia?",
      answer: "Não há limite! Você pode assistir quantas aulas quiser, tanto na versão gratuita quanto premium. Aprenda no seu próprio ritmo."
    },
    {
      question: "Como funciona o sistema de níveis (Iniciante, Intermediário, Avançado)?",
      answer: "Cada aula é classificada por nível de dificuldade. Iniciante é para quem está começando, Intermediário para quem já tem conhecimento básico, e Avançado para especialistas."
    },
    {
      question: "Posso acessar a plataforma pelo celular?",
      answer: "Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente em celulares, tablets e computadores. Em breve teremos também um app nativo."
    }
  ];

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white mb-4">Central de Ajuda</h1>
        <p className="text-slate-400 text-lg">
          Estamos aqui para ajudar! Encontre respostas rápidas ou entre em contato conosco.
        </p>
      </div>

      {/* Contact Section */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* AI Support */}
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-200">
          <div className="w-12 h-12 bg-[#ff7551] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-medium mb-2 text-sm">Inteligência Artificial</h3>
          <p className="text-slate-400 text-xs mb-3">
            Tire suas dúvidas instantaneamente com nossa IA especializada
          </p>
          <button className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm">
            Falar com IA
          </button>
        </div>

        {/* WhatsApp Support */}
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-200">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
            <Phone className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-medium mb-2 text-sm">WhatsApp</h3>
          <p className="text-slate-400 text-xs mb-3">
            Suporte direto via WhatsApp para dúvidas urgentes
          </p>
          <button className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm">
            Abrir WhatsApp
          </button>
        </div>

        {/* Email Support */}
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-200">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-medium mb-2 text-sm">Email</h3>
          <p className="text-slate-400 text-xs mb-3">
            Envie sua dúvida detalhada por email
          </p>
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm">
            Enviar Email
          </button>
        </div>

        {/* Live Chat */}
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 text-center group hover:scale-105 transition-transform duration-200">
          <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-200">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-white font-medium mb-2 text-sm">Chat ao Vivo</h3>
          <p className="text-slate-400 text-xs mb-3">
            Converse em tempo real com nossa equipe
          </p>
          <button className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-3 rounded-lg transition-colors text-sm">
            Iniciar Chat
          </button>
        </div>
      </div>

      {/* Support Hours */}
      <div className="bg-slate-700/30 rounded-xl p-6">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="flex items-center justify-center space-x-3">
            <Clock className="w-5 h-5 text-[#ff7551]" />
            <div>
              <div className="text-white font-medium">Horário de Atendimento</div>
              <div className="text-slate-400 text-sm">Segunda a Sexta: 9h às 18h</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3">
            <Users className="w-5 h-5 text-[#ff7551]" />
            <div>
              <div className="text-white font-medium">Tempo de Resposta</div>
              <div className="text-slate-400 text-sm">Até 2 horas úteis</div>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-3">
            <Shield className="w-5 h-5 text-[#ff7551]" />
            <div>
              <div className="text-white font-medium">Suporte Premium</div>
              <div className="text-slate-400 text-sm">Atendimento prioritário</div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-white mb-2">Perguntas Frequentes</h2>
          <p className="text-slate-400">
            Encontre respostas para as dúvidas mais comuns
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
    </div>
  );
};

export default HelpPage;