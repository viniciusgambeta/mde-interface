import React, { useState } from 'react';
import { Send, ThumbsUp, Clock, CheckCircle, Lightbulb, Users, TrendingUp, Award, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { videoSuggestionsService, categoryService, type VideoSuggestion, type Category } from '../lib/database';

const RequestLessonPage: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [suggestions, setSuggestions] = useState<VideoSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<string[]>([]);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [userSuggestions, setUserSuggestions] = useState<VideoSuggestion[]>([]);

  // Load suggestions on component mount
  React.useEffect(() => {
    const loadSuggestions = async () => {
      setLoading(true);
      try {
        const [suggestionsData, userVotesData, categoriesData] = await Promise.all([
          videoSuggestionsService.getApprovedSuggestions(),
          user ? videoSuggestionsService.getUserVotes(user.id) : Promise.resolve([]),
          categoryService.getCategories(),
        ]);
        
        setSuggestions(suggestionsData);
        setUserVotes(userVotesData);
        setCategories(categoriesData);
        
        // Load user's pending suggestions if logged in
        if (user) {
          const userPendingSuggestions = await videoSuggestionsService.getUserPendingSuggestions(user.id);
          setUserSuggestions(userPendingSuggestions);
        }
      } catch (error) {
        console.error('Error loading suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [user?.id]);


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

    try {
      const success = await videoSuggestionsService.createSuggestion({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        user_id: user?.id
      });

      if (success) {
        setSubmitSuccess(true);
        setFormData({ title: '', category: '', description: '' });
        setShowForm(false);
        
        // Hide success message after 3 seconds
        setTimeout(() => setSubmitSuccess(false), 3000);
        
        // Reload suggestions to show new one if it gets approved
        const updatedSuggestions = await videoSuggestionsService.getApprovedSuggestions();
        setSuggestions(updatedSuggestions);
        
        // Reload user's pending suggestions
        if (user) {
          const userPendingSuggestions = await videoSuggestionsService.getUserPendingSuggestions(user.id);
          setUserSuggestions(userPendingSuggestions);
        }
      } else {
        // Handle error - you might want to show an error message
        console.error('Failed to submit suggestion');
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (suggestionId: string) => {
    if (!user || votingStates[suggestionId]) return;

    setVotingStates(prev => ({ ...prev, [suggestionId]: true }));

    try {
      const result = await videoSuggestionsService.toggleUpvote(suggestionId, user.id);
      
      if (result.success) {
        // Update local state
        const wasVoted = userVotes.includes(suggestionId);
        if (wasVoted) {
          setUserVotes(prev => prev.filter(id => id !== suggestionId));
        } else {
          setUserVotes(prev => [...prev, suggestionId]);
        }
        
        // Update suggestion votes count
        setSuggestions(prev => prev.map(suggestion => 
          suggestion.id === suggestionId 
            ? { ...suggestion, votes: result.votes }
            : suggestion
        ));
      }
    } catch (error) {
      console.error('Error toggling upvote:', error);
    } finally {
      setVotingStates(prev => ({ ...prev, [suggestionId]: false }));
    }
  };
  const getEtapaConfig = (etapa: string) => {
    switch (etapa) {
      case 'sugestao':
        return {
          title: 'Sugestões',
          icon: Lightbulb,
          color: 'text-[#ff7551]',
          bgColor: 'bg-[#ff7551]/10',
          borderColor: 'border-[#ff7551]/20'
        };
      case 'producao':
        return {
          title: 'Em Produção',
          icon: Clock,
          color: 'text-[#ff7551]',
          bgColor: 'bg-[#ff7551]/10',
          borderColor: 'border-[#ff7551]/20'
        };
      case 'prontas':
        return {
          title: 'Prontas',
          icon: CheckCircle,
          color: 'text-[#ff7551]',
          bgColor: 'bg-[#ff7551]/10',
          borderColor: 'border-[#ff7551]/20'
        };
      default:
        return {
          title: 'Sugestões',
          icon: Lightbulb,
          color: 'text-[#ff7551]',
          bgColor: 'bg-[#ff7551]/10',
          borderColor: 'border-[#ff7551]/20'
        };
    }
  };

  const suggestionsByEtapa = {
    sugestao: [
      ...suggestions.filter(s => s.etapa === 'sugestao'),
      ...userSuggestions.filter(s => s.etapa === 'sugestao')
    ].sort((a, b) => (b.votes || 0) - (a.votes || 0)),
    producao: suggestions.filter(s => s.etapa === 'producao').sort((a, b) => (b.votes || 0) - (a.votes || 0)),
    prontas: suggestions.filter(s => s.etapa === 'prontas').sort((a, b) => (b.votes || 0) - (a.votes || 0))
  };

  const SuggestionCard: React.FC<{ suggestion: VideoSuggestion }> = ({ suggestion }) => {
    const isVoted = userVotes.includes(suggestion.id);
    const isVoting = votingStates[suggestion.id];
    const canVote = user && (suggestion.etapa === 'sugestao' || suggestion.etapa === 'producao');
    const isPending = suggestion.status === 'pending';
    const isUserSuggestion = suggestion.user_id === user?.id;
    
    return (
      <div className={`border rounded-lg p-6 hover:bg-slate-600/20 transition-all duration-200 group ${
        isPending ? 'bg-slate-700/20 border-slate-600/20' : 'bg-slate-700/30 border-slate-600/30'
      }`}>
        {/* Header with user info and vote button */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1">
            <img
              src="/src/images/avatar.jpg"
              alt="User"
              className="w-6 h-6 rounded-full object-cover"
            />
            <span className="text-slate-400 text-xs">
              {isUserSuggestion ? 'Você' : 'Usuário'}
            </span>
          </div>
          
          {canVote && !isPending && (
            <button
              onClick={() => handleUpvote(suggestion.id)}
              disabled={isVoting}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                isVoted 
                  ? 'bg-[#ff7551] text-white' 
                  : 'bg-slate-600/30 text-slate-400 hover:bg-slate-500/30 hover:text-white'
              } ${isVoting ? 'animate-pulse' : ''}`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span>{suggestion.votes || 0}</span>
            </button>
          )}
        </div>
        
        {/* Title */}
        <div className="mb-3">
          <h4 className="text-white font-semibold text-base leading-snug line-clamp-2">
            {suggestion.title}
          </h4>
        </div>
        
        {/* Pending warning */}
        {isPending && isUserSuggestion && (
          <div className="mb-3 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded text-xs text-yellow-400">
            ⏳ Aguardando aprovação
          </div>
        )}
        
        {/* Description */}
        <p className="text-slate-400 text-sm mb-3 line-clamp-2 leading-relaxed">
          {suggestion.description}
        </p>
        
        {/* Footer with category */}
        <div className="flex items-center justify-between">
          <span className="text-sm px-3 py-1.5 bg-slate-600/30 text-slate-300 rounded">
            {suggestion.category}
          </span>
          
          {isPending && isUserSuggestion && (
            <span className="text-sm text-slate-500">
              Pendente
            </span>
          )}
        </div>
      </div>
    );
  };

  const KanbanColumn: React.FC<{ 
    etapa: 'sugestao' | 'producao' | 'prontas';
    suggestions: VideoSuggestion[];
  }> = ({ etapa, suggestions }) => {
    const config = getEtapaConfig(etapa);
    const IconComponent = config.icon;

    return (
      <div className="flex-1 min-w-0">
        <div className="p-4 mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <IconComponent className="w-7 h-7 text-[#ff7551]" />
            <h3 className="text-white font-bold text-xl">{config.title}</h3>
            <span className={`text-xs px-2 py-1 rounded-full bg-slate-700/30 text-slate-400`}>
              {suggestions.length}
            </span>
          </div>
        </div>
        
        <div className="space-y-4">
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

  if (loading) {
    return (
      <div className="w-full space-y-12">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white mb-4">Pedir Aula</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Carregando sugestões...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-4">Envie sugestões de aulas</h1>
          <p className="text-slate-400 text-lg max-w-2xl">
            Vote nas aulas que mais quer ver e sugira novos tópicos para a plataforma.
          </p>
        </div>
        
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Sugerir Aula</span>
        </button>
      </div>

      {/* Separator */}
      <div className="w-full h-px bg-slate-600/30 mb-8"></div>

      {/* Kanban Board */}
      <div>
        <div className="grid lg:grid-cols-3 gap-6">
          <KanbanColumn 
            etapa="sugestao" 
            suggestions={suggestionsByEtapa.sugestao} 
          />
          <KanbanColumn 
            etapa="producao" 
            suggestions={suggestionsByEtapa.producao} 
          />
          <KanbanColumn 
            etapa="prontas" 
            suggestions={suggestionsByEtapa.prontas} 
          />
        </div>
      </div>

      {/* Suggestion Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-600/30">
              <h2 className="text-xl font-semibold text-white">Qual a sua sugestão?</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <div className="p-6">
              {submitSuccess && (
                <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg animate-fade-in">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="text-green-400 font-medium">
                        Sugestão enviada para aprovação!
                      </div>
                      <div className="text-green-300 text-sm mt-1">
                        Enquanto isso, vote nas aulas que mais quer ver no roadmap abaixo.
                      </div>
                    </div>
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
                      maxLength={60}
                      className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
                      required
                    />
                    <div className="text-right text-xs text-slate-500 mt-1">
                      {formData.title.length}/60 caracteres
                    </div>
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
                        <option key={category.id} value={category.name}>
                          {category.name}
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
                    maxLength={140}
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all resize-none"
                    required
                  />
                  <div className="text-right text-xs text-slate-500 mt-1">
                    {formData.description.length}/140 caracteres
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 text-slate-300 hover:text-white transition-colors"
                  >
                    Cancelar
                  </button>
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
          </div>
        </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestLessonPage;