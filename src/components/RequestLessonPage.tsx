import React, { useState } from 'react';
import { Send, ThumbsUp, Clock, CheckCircle, Lightbulb, Users, TrendingUp, Award } from 'lucide-react';

interface LessonSuggestion {
  id: string;
  title: string;
  category: string;
  description: string;
  votes: number;
  author: string;
  createdAt: string;
  status: 'suggestion' | 'production' | 'ready';
  hasVoted?: boolean;
}

const RequestLessonPage: React.FC = () => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Mock data for suggestions
  const [suggestions, setSuggestions] = useState<LessonSuggestion[]>([
    {
      id: '1',
      title: 'React Server Components na Prática',
      category: 'Programação',
      description: 'Como implementar e otimizar React Server Components em aplicações reais',
      votes: 47,
      author: 'DevMaster',
      createdAt: '2024-01-15',
      status: 'suggestion',
      hasVoted: false
    },
    {
      id: '2',
      title: 'Design System com Figma e Tokens',
      category: 'Design',
      description: 'Criando um design system completo usando Figma e design tokens',
      votes: 32,
      author: 'DesignPro',
      createdAt: '2024-01-14',
      status: 'suggestion',
      hasVoted: true
    },
    {
      id: '3',
      title: 'Marketing de Conteúdo para Devs',
      category: 'Marketing',
      description: 'Estratégias de marketing de conteúdo específicas para desenvolvedores',
      votes: 28,
      author: 'MarketingGuru',
      createdAt: '2024-01-13',
      status: 'suggestion',
      hasVoted: false
    },
    {
      id: '4',
      title: 'TypeScript Avançado: Utility Types',
      category: 'Programação',
      description: 'Dominando utility types e técnicas avançadas do TypeScript',
      votes: 41,
      author: 'TypeScriptNinja',
      createdAt: '2024-01-12',
      status: 'production',
      hasVoted: false
    },
    {
      id: '5',
      title: 'UX Writing para Interfaces',
      category: 'Design',
      description: 'Como escrever textos que melhoram a experiência do usuário',
      votes: 35,
      author: 'UXWriter',
      createdAt: '2024-01-11',
      status: 'production',
      hasVoted: false
    },
    {
      id: '6',
      title: 'Next.js 14: App Router Completo',
      category: 'Programação',
      description: 'Guia completo do novo App Router do Next.js 14',
      votes: 89,
      author: 'NextJSExpert',
      createdAt: '2024-01-10',
      status: 'ready',
      hasVoted: false
    },
    {
      id: '7',
      title: 'Animações CSS Modernas',
      category: 'Design',
      description: 'Criando animações fluidas e performáticas com CSS puro',
      votes: 56,
      author: 'CSSAnimator',
      createdAt: '2024-01-09',
      status: 'ready',
      hasVoted: false
    }
  ]);

  const categories = [
    'Programação',
    'Design',
    'Marketing',
    'Negócios',
    'Ciência de Dados',
    'Mobile',
    'DevOps',
    'IA & Machine Learning'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.category || !formData.description) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitSuccess(true);
      setFormData({ title: '', category: '', description: '' });
      
      // Hide success message after 3 seconds
      setTimeout(() => setSubmitSuccess(false), 3000);
    }, 1000);
  };

  const handleVote = (suggestionId: string) => {
    setSuggestions(prev => prev.map(suggestion => {
      if (suggestion.id === suggestionId) {
        const hasVoted = suggestion.hasVoted;
        return {
          ...suggestion,
          votes: hasVoted ? suggestion.votes - 1 : suggestion.votes + 1,
          hasVoted: !hasVoted
        };
      }
      return suggestion;
    }));
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'suggestion':
        return {
          title: 'Sugestões',
          icon: Lightbulb,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20'
        };
      case 'production':
        return {
          title: 'Em Produção',
          icon: Clock,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20'
        };
      case 'ready':
        return {
          title: 'Prontas',
          icon: CheckCircle,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20'
        };
      default:
        return {
          title: 'Sugestões',
          icon: Lightbulb,
          color: 'text-blue-400',
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/20'
        };
    }
  };

  const suggestionsByStatus = {
    suggestion: suggestions.filter(s => s.status === 'suggestion'),
    production: suggestions.filter(s => s.status === 'production'),
    ready: suggestions.filter(s => s.status === 'ready')
  };

  const SuggestionCard: React.FC<{ suggestion: LessonSuggestion }> = ({ suggestion }) => {
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    };

    return (
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4 hover:bg-slate-600/20 transition-all duration-200 group">
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-white font-medium text-sm leading-snug line-clamp-2">
            {suggestion.title}
          </h4>
        </div>
        
        <p className="text-slate-400 text-xs mb-3 line-clamp-2 leading-relaxed">
          {suggestion.description}
        </p>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">
              {suggestion.category}
            </span>
            <span className="text-xs text-slate-400">
              •
            </span>
            <span className="text-xs text-slate-400">
              por {suggestion.author}
            </span>
          </div>
          
          {suggestion.status === 'suggestion' && (
            <button
              onClick={() => handleVote(suggestion.id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-all duration-200 ${
                suggestion.hasVoted
                  ? 'bg-[#ff7551] text-white'
                  : 'bg-slate-600/30 text-slate-400 hover:bg-[#ff7551]/20 hover:text-[#ff7551]'
              }`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span className="text-xs font-medium">{suggestion.votes}</span>
            </button>
          )}
          
          {suggestion.status !== 'suggestion' && (
            <div className="flex items-center space-x-1 text-slate-400">
              <Users className="w-3 h-3" />
              <span className="text-xs">{suggestion.votes}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  const KanbanColumn: React.FC<{ 
    status: 'suggestion' | 'production' | 'ready';
    suggestions: LessonSuggestion[];
  }> = ({ status, suggestions }) => {
    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
      <div className="flex-1 min-w-0">
        <div className="p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <IconComponent className={`w-5 h-5 ${config.color}`} />
            <h3 className="text-slate-300 font-medium">{config.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full bg-slate-700/30 text-slate-400`}>
              {suggestions.length}
            </span>
          </div>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-hide">
          {suggestions.map((suggestion) => (
            <SuggestionCard key={suggestion.id} suggestion={suggestion} />
          ))}
          
          {suggestions.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <div className="text-xs">Nenhuma aula nesta etapa</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white mb-4">Pedir Aula</h1>
        <p className="text-slate-400 text-lg max-w-2xl">
          Sugira novos tópicos e aulas que você gostaria de ver na plataforma. 
          Sua opinião é fundamental para criarmos o melhor conteúdo!
        </p>
      </div>

      {/* Suggestion Form */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-8">
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-between w-full group"
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-[#ff7551] rounded-full flex items-center justify-center">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <h2 className="text-xl font-semibold text-white group-hover:text-[#ff7551] transition-colors">
                Sugerir Nova Aula
              </h2>
              <p className="text-slate-400 text-sm">
                Compartilhe sua ideia e ajude a comunidade a aprender algo novo
              </p>
            </div>
          </div>
          <div className={`transform transition-transform duration-200 ${showForm ? 'rotate-180' : ''}`}>
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </button>

        {showForm && (
          <div className="mt-6 pt-6 border-t border-slate-600/30">
            {submitSuccess && (
              <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400 font-medium">
                    Sugestão enviada com sucesso! Obrigado pela contribuição.
                  </span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Nome da Aula *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ex: React Hooks Avançados"
                    className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    required
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Categoria *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descrição *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Descreva o que você gostaria de aprender nesta aula. Seja específico sobre os tópicos que devem ser abordados..."
                  rows={4}
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting || !formData.title || !formData.category || !formData.description}
                  className="flex items-center space-x-2 px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Sugestão</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div>
        <div className="grid lg:grid-cols-3 gap-6">
          <KanbanColumn 
            status="suggestion" 
            suggestions={suggestionsByStatus.suggestion} 
          />
          <KanbanColumn 
            status="production" 
            suggestions={suggestionsByStatus.production} 
          />
          <KanbanColumn 
            status="ready" 
            suggestions={suggestionsByStatus.ready} 
          />
        </div>
      </div>
    </div>
  );
};

export default RequestLessonPage;