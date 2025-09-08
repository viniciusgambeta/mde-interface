import React, { useState, useEffect } from 'react';
import { ExternalLink, Search, Filter, ChevronDown, Star, Users, Zap, Globe, Code, Palette, BarChart3, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HallFerramenta {
  id: string;
  nome: string;
  descricao?: string;
  link: string;
  icone?: string;
  categoria?: string;
  avaliacao?: number;
  usuarios?: number;
  preco?: string;
  tags?: string[];
  created_at: string;
}

const PoderzinhosPage: React.FC = () => {
  const [ferramentas, setFerramentas] = useState<HallFerramenta[]>([]);
  const [filteredFerramentas, setFilteredFerramentas] = useState<HallFerramenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);

  // Load ferramentas from database
  useEffect(() => {
    const loadFerramentas = async () => {
      setLoading(true);
      try {
        console.log('🔧 Loading ferramentas from ferramentas_links table...');
        
        const { data, error } = await supabase
          .from('ferramentas_links')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading ferramentas:', error);
          console.error('Error details:', error.message, error.code);
          setFerramentas([]);
          return;
        }

        console.log('📊 Loaded ferramentas:', data?.length || 0);
        console.log('📊 Sample data:', data?.[0]);
        setFerramentas(data || []);
        
        // Extract unique categories
        // Since ferramentas_links doesn't have categoria, we'll create default categories
        setAvailableCategories(['Ferramentas', 'Links', 'Recursos']);
        
      } catch (error) {
        console.error('Exception loading ferramentas:', error);
        setFerramentas([]);
      } finally {
        setLoading(false);
      }
    };

    loadFerramentas();
  }, []);

  // Filter ferramentas based on search and category
  useEffect(() => {
    let filtered = [...ferramentas];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ferramenta =>
        ferramenta.nome.toLowerCase().includes(query)
      );
    }

    // Skip category filter for now since ferramentas_links doesn't have categoria

    setFilteredFerramentas(filtered);
  }, [ferramentas, searchQuery, selectedCategory]);

  const getCategoryIcon = (categoria: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'Ferramentas': <Zap className="w-5 h-5" />,
      'Links': <Globe className="w-5 h-5" />,
      'Recursos': <Code className="w-5 h-5" />
    };
    
    return iconMap[categoria] || <ExternalLink className="w-5 h-5" />;
  };

  const FerramentaCard: React.FC<{ ferramenta: HallFerramenta }> = ({ ferramenta }) => {
    const handleClick = () => {
      window.open(ferramenta.link, '_blank', 'noopener,noreferrer');
    };

    return (
      <div 
        onClick={handleClick}
        className="bg-slate-700/30 border border-slate-600/30 rounded-xl p-6 hover:bg-slate-600/20 transition-all duration-300 cursor-pointer group hover:scale-105 hover:shadow-xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-slate-600/30 rounded-lg flex items-center justify-center overflow-hidden">
              <div className="w-full h-full bg-slate-600/30 rounded-lg flex items-center justify-center text-2xl">
                <ExternalLink className="w-6 h-6 text-slate-400" />
              </div>
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg group-hover:text-[#ff7551] transition-colors">
                {ferramenta.nome}
              </h3>
              <span className="text-xs px-2 py-1 bg-slate-600/30 text-slate-300 rounded">
                Ferramenta
              </span>
            </div>
          </div>
          
          <ExternalLink className="w-5 h-5 text-slate-400 group-hover:text-[#ff7551] transition-colors" />
        </div>

        {/* Description */}
        <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-3">
          Acesse esta ferramenta útil através do link fornecido.
        </p>

        {/* Footer Info */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <ExternalLink className="w-3 h-3" />
              <span>Link externo</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full space-y-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white mb-4">Poderzinhos</h1>
          <p className="text-slate-400 text-lg max-w-3xl">
            Carregando ferramentas...
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-slate-700/30 rounded-xl p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-600/30 rounded-lg"></div>
                  <div>
                    <div className="h-5 bg-slate-600/30 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-slate-600/20 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-5 h-5 bg-slate-600/30 rounded"></div>
              </div>
              <div className="h-4 bg-slate-600/20 rounded mb-2"></div>
              <div className="h-4 bg-slate-600/20 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-slate-600/20 rounded w-16"></div>
                <div className="h-3 bg-slate-600/20 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white mb-4">Poderzinhos</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Descubra ferramentas poderosas para automação, IA e produtividade. 
          Nossa curadoria especial de ferramentas que vão turbinar seu trabalho e criatividade.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar ferramentas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
            className="flex items-center space-x-2 px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-300 hover:bg-slate-600/30 transition-colors min-w-[180px] justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">Todas as Ferramentas</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryDropdown && availableCategories.length > 0 && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50">
              <div className="p-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setShowCategoryDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-[#ff7551] text-white'
                      : 'text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  Todas as Categorias
                </button>
                {availableCategories.map((category) => (
                  <button
                    key={category}
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowCategoryDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      selectedCategory === category
                        ? 'bg-[#ff7551] text-white'
                        : 'text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {filteredFerramentas.length} ferramenta{filteredFerramentas.length !== 1 ? 's' : ''} encontrada{filteredFerramentas.length !== 1 ? 's' : ''}
        </span>
        {(searchQuery || selectedCategory !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            className="text-[#ff7551] hover:text-[#ff7551]/80 transition-colors"
          >
            Limpar filtros
          </button>
        )}
      </div>

      {/* Ferramentas Grid */}
      {filteredFerramentas.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFerramentas.map((ferramenta, index) => (
            <div
              key={ferramenta.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <FerramentaCard ferramenta={ferramenta} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Zap className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'Nenhuma ferramenta encontrada' : 'Nenhuma ferramenta disponível'}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros ou usar termos de busca diferentes.'
              : 'Não encontramos ferramentas para exibir no momento.'
            }
          </p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-6 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PoderzinhosPage;