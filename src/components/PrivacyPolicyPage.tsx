import React from 'react';
import { ArrowLeft, Shield, Mail, User, Lock, Eye, FileText, Calendar, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicyPage: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1f1d2b] via-[#1f1d2b] to-black">
      {/* Header */}
      <header className="w-full bg-[#1f1d2b]/90 backdrop-blur-sm border-b border-slate-700/30">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Voltar</span>
            </button>
            
            <img
              src="/logo1_branco.png"
              alt="Me dá um Exemplo"
              className="h-12 w-auto"
            />
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8 lg:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 bg-[#ff7551]/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-[#ff7551]" />
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Política de Privacidade
            </h1>
            <p className="text-slate-400 text-lg">
              Última atualização: 25 de agosto de 2025
            </p>
          </div>

          {/* Introduction */}
          <div className="prose prose-invert max-w-none">
            <div className="bg-slate-600/20 rounded-lg p-6 mb-8">
              <p className="text-slate-300 leading-relaxed text-base">
                A sua privacidade é muito importante para nós. Esta Política de Privacidade descreve como coletamos, usamos e protegemos as informações pessoais dos usuários do aplicativo <strong className="text-white">Me Dá um Exemplo</strong>.
              </p>
              <p className="text-slate-300 leading-relaxed text-base mt-4">
                Ao utilizar o app, você concorda com os termos descritos aqui. Caso não concorde, recomendamos não utilizar o aplicativo.
              </p>
            </div>

            {/* Section 1 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  1
                </div>
                <h2 className="text-2xl font-bold text-white">Informações que Coletamos</h2>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                O app Me Dá um Exemplo coleta apenas as informações essenciais para o funcionamento da plataforma:
              </p>
              
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-600/20 rounded-lg p-4 flex items-center space-x-3">
                  <User className="w-5 h-5 text-[#ff7551]" />
                  <span className="text-white font-medium">Nome</span>
                </div>
                <div className="bg-slate-600/20 rounded-lg p-4 flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-[#ff7551]" />
                  <span className="text-white font-medium">Endereço de e-mail</span>
                </div>
                <div className="bg-slate-600/20 rounded-lg p-4 flex items-center space-x-3">
                  <Lock className="w-5 h-5 text-[#ff7551]" />
                  <span className="text-white font-medium">Senha (criptografada)</span>
                </div>
              </div>
              
              <p className="text-slate-400 text-sm">
                Esses dados são coletados no momento do cadastro ou login e armazenados com segurança.
              </p>
            </section>

            {/* Section 2 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  2
                </div>
                <h2 className="text-2xl font-bold text-white">Como Utilizamos seus Dados</h2>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                As informações fornecidas são utilizadas exclusivamente para:
              </p>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#ff7551] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Permitir o acesso à sua conta;</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#ff7551] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Exibir o conteúdo personalizado da comunidade (aulas, tutoriais, materiais e cupons);</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#ff7551] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Melhorar sua experiência dentro do aplicativo;</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-[#ff7551] rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-slate-300">Gerar estatísticas internas para melhoria do serviço (sem identificação pessoal).</span>
                </li>
              </ul>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <p className="text-green-400 font-medium">
                  Não utilizamos seus dados para fins de publicidade, marketing externo ou venda a terceiros.
                </p>
              </div>
            </section>

            {/* Section 3 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  3
                </div>
                <h2 className="text-2xl font-bold text-white">Compartilhamento de Informações</h2>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-6 mb-4">
                <p className="text-red-400 font-bold text-lg mb-2">
                  Nós NÃO compartilhamos suas informações com terceiros.
                </p>
                <p className="text-slate-300">
                  Todos os dados são utilizados apenas pela equipe responsável pelo Me Dá um Exemplo, com finalidades operacionais e de melhoria contínua da plataforma.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  4
                </div>
                <h2 className="text-2xl font-bold text-white">Armazenamento e Segurança</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Seus dados são armazenados em servidores seguros e acessados apenas por pessoas autorizadas, seguindo práticas modernas de proteção de dados.
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Utilizamos criptografia para proteger informações confidenciais e monitoramos constantemente a plataforma para prevenir acessos não autorizados.
                </p>
              </div>
            </section>

            {/* Section 5 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  5
                </div>
                <h2 className="text-2xl font-bold text-white">Direitos dos Usuários</h2>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-4">
                De acordo com a <strong className="text-white">LGPD</strong> (Lei Geral de Proteção de Dados) e o <strong className="text-white">GDPR</strong> (Regulamento Geral de Proteção de Dados da União Europeia), você pode, a qualquer momento:
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-600/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Eye className="w-5 h-5 text-[#ff7551]" />
                    <span className="text-white font-medium">Acessar</span>
                  </div>
                  <p className="text-slate-400 text-sm">Os dados que temos sobre você</p>
                </div>
                
                <div className="bg-slate-600/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-[#ff7551]" />
                    <span className="text-white font-medium">Corrigir</span>
                  </div>
                  <p className="text-slate-400 text-sm">Solicitar correção ou atualização</p>
                </div>
                
                <div className="bg-slate-600/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <User className="w-5 h-5 text-[#ff7551]" />
                    <span className="text-white font-medium">Excluir</span>
                  </div>
                  <p className="text-slate-400 text-sm">Exclusão definitiva da conta</p>
                </div>
                
                <div className="bg-slate-600/20 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Shield className="w-5 h-5 text-[#ff7551]" />
                    <span className="text-white font-medium">Retirar</span>
                  </div>
                  <p className="text-slate-400 text-sm">Consentimento para uso dos dados</p>
                </div>
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <p className="text-blue-400">
                  Para exercer esses direitos, entre em contato pelo e-mail: 
                  <a href="mailto:privacidade@medaumexemplo.com" className="font-medium hover:text-blue-300 transition-colors ml-1">
                    privacidade@medaumexemplo.com
                  </a>
                </p>
              </div>
            </section>

            {/* Section 6 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  6
                </div>
                <h2 className="text-2xl font-bold text-white">Uso de Cookies e Dados de Navegação</h2>
              </div>
              
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <p className="text-green-400 font-medium text-lg mb-2">
                  O aplicativo NÃO utiliza cookies ou tecnologias de rastreamento.
                </p>
                <p className="text-slate-300">
                  Todos os dados são armazenados exclusivamente no servidor da plataforma.
                </p>
              </div>
            </section>

            {/* Section 7 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  7
                </div>
                <h2 className="text-2xl font-bold text-white">Retenção de Dados</h2>
              </div>
              
              <p className="text-slate-300 leading-relaxed">
                Seus dados serão mantidos enquanto sua conta estiver ativa ou conforme necessário para fornecer nossos serviços. Caso a conta seja encerrada, os dados poderão ser removidos mediante solicitação.
              </p>
            </section>

            {/* Section 8 */}
            <section className="mb-10">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  8
                </div>
                <h2 className="text-2xl font-bold text-white">Alterações nesta Política</h2>
              </div>
              
              <div className="space-y-4">
                <p className="text-slate-300 leading-relaxed">
                  Esta política pode ser atualizada periodicamente. Toda alteração relevante será comunicada aos usuários por e-mail ou notificação dentro do app.
                </p>
                <div className="flex items-center space-x-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">A data de revisão mais recente sempre será informada no topo deste documento.</span>
                </div>
              </div>
            </section>

            {/* Section 9 - Contact */}
            <section className="mb-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-8 h-8 bg-[#ff7551] rounded-full flex items-center justify-center text-white font-bold">
                  9
                </div>
                <h2 className="text-2xl font-bold text-white">Contato</h2>
              </div>
              
              <p className="text-slate-300 leading-relaxed mb-6">
                Para dúvidas, sugestões ou solicitações sobre esta Política de Privacidade, fale com a gente:
              </p>
              
              <div className="bg-slate-600/20 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-[#ff7551]" />
                    <div>
                      <span className="text-slate-400 text-sm">E-mail:</span>
                      <a 
                        href="mailto:contato@agenciadebolso.com" 
                        className="text-white font-medium hover:text-[#ff7551] transition-colors ml-2"
                      >
                        contato@agenciadebolso.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-[#ff7551]" />
                    <div>
                      <span className="text-slate-400 text-sm">Responsável:</span>
                      <span className="text-white font-medium ml-2">
                        Vinicius Gambeta – Representante legal da plataforma Me Dá um Exemplo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer Actions */}
          <div className="border-t border-slate-600/30 pt-8 mt-12">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-slate-400 text-sm">
                Esta política está em conformidade com a LGPD e GDPR
              </div>
              
              <div className="flex space-x-4">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-slate-600/30 hover:bg-slate-500/30 text-white rounded-lg transition-colors"
                >
                  Voltar ao App
                </button>
                
                <a
                  href="mailto:privacidade@medaumexemplo.com"
                  className="px-6 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white rounded-lg transition-colors"
                >
                  Entrar em Contato
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;