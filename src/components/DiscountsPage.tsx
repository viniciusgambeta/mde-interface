import React, { useState } from 'react';
import { Gift, Copy, CheckCircle, ExternalLink, Percent, Star, Clock, Users, Search, Filter, ChevronDown, SortAsc } from 'lucide-react';
import { Desconto } from '../lib/database';

const DiscountsPage: React.FC = () => {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [copiedCoupons, setCopiedCoupons] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('name');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<Desconto[]>([]);

  // Load discounts on component mount
  React.useEffect(() => {
    const loadDiscounts = async () => {
      setLoading(true);
      try {
        const data = await discountService.getDiscounts();
        setDiscounts(data);
      } catch (error) {
        console.error('Error loading discounts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscounts();
  }, []);
  const categories = ['all', 'Design', 'Desenvolvimento', 'IA', 'Marketing', 'Produtividade'];
  const sortOptions = [
    { value: 'name', label: 'Nome A-Z' },
    { value: 'name-desc', label: 'Nome Z-A' },
    { value: 'category', label: 'Categoria' },
    { value: 'discount', label: 'Maior Desconto' }
  ];

  // Filter and sort discounts
  const filteredAndSortedDiscounts = React.useMemo(() => {
    let filtered = discounts;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(discount => discount.categoria === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(discount =>
        discount.nome.toLowerCase().includes(query) ||
        discount.descricao.toLowerCase().includes(query) ||
        discount.categoria.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.nome.localeCompare(b.nome);
        case 'name-desc':
          return b.nome.localeCompare(a.nome);
        case 'category':
          return a.categoria.localeCompare(b.categoria);
        case 'discount':
          // Extract percentage from discount string for comparison
          const aPercent = parseInt(a.desconto.match(/\d+/)?.[0] || '0');
          const bPercent = parseInt(b.desconto.match(/\d+/)?.[0] || '0');
          return bPercent - aPercent;
        default:
          return 0;
      }
    });

    return sorted;
  }, [discounts, selectedCategory, searchQuery, sortBy]);

  const handleToggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const handleCopyCoupon = async (couponCode: string, cardId: string) => {
    try {
      await navigator.clipboard.writeText(couponCode);
      setCopiedCoupons(prev => new Set([...prev, cardId]));
      
      // Remove the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCoupons(prev => {
          const newSet = new Set(prev);
          newSet.delete(cardId);
          return newSet;
        });
      }, 2000);
    } catch (error) {
      console.error('Error copying coupon:', error);
    }
  };

  const getCategoryLabel = (value: string) => {
    return value === 'all' ? 'Todas as Categorias' : value;
  };

  const getSortLabel = (value: string) => {
    return sortOptions.find(option => option.value === value)?.label || 'Nome A-Z';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const DiscountCardComponent: React.FC<{ discount: Desconto }> = ({ discount }) => {
    const isExpanded = expandedCards.has(discount.id);
    const isCopied = copiedCoupons.has(discount.id);

    return (
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl overflow-hidden hover:bg-slate-600/20 transition-all duration-300 group">
        {/* Header */}
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-slate-600/30 rounded-lg flex items-center justify-center text-2xl">
                {discount.logo}
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">{discount.nome}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-xs px-2 py-1 bg-slate-600/30 text-slate-300 rounded">
                    {discount.categoria}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="border-2 border-[#ff7551] text-[#ff7551] px-3 py-1 rounded-lg font-bold text-sm bg-transparent">
                {discount.desconto}
              </div>
            </div>
          </div>

          <p className="text-slate-300 text-base leading-relaxed mb-4">
            {discount.descricao}
          </p>

          {/* Action Buttons */}
          <div className="flex space-x-3 mt-4">
            <button
              onClick={() => handleToggleCard(discount.id)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                isExpanded
                  ? 'bg-slate-600/30 text-slate-300 hover:bg-slate-500/30'
                  : 'bg-slate-600/30 hover:bg-slate-500/30 text-slate-300 hover:text-white'
              }`}
            >
              <span>{isExpanded ? 'Ocultar Cupom' : 'Ver Cupom'}</span>
              <svg 
                className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <a
              href={discount.link}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-slate-600/30 hover:bg-slate-500/30 text-slate-300 hover:text-white rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Expandable Coupon Section */}
        {isExpanded && (
          <div className="border-t border-slate-600/30 p-6 bg-slate-800/30 animate-fade-in">
            <div className="text-center">
              <h4 className="text-white font-medium mb-3">Código do Cupom</h4>
              
              <div className="relative">
                <div className="bg-slate-900/50 border-2 border-dashed border-[#ff7551]/50 rounded-lg p-4 mb-4">
                  <div className="font-mono text-xl font-bold text-[#ff7551] tracking-wider">
                    {discount.codigo_cupom}
                  </div>
                </div>
                
                <button
                  onClick={() => handleCopyCoupon(discount.codigo_cupom, discount.id)}
                  className={`w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    isCopied
                      ? 'bg-green-500 text-white'
                      : 'bg-[#ff7551] hover:bg-[#ff7551]/80 text-white transform hover:scale-105'
                  }`}
                >
                  {isCopied ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Código</span>
                    </>
                  )}
                </button>
              </div>
              
              <p className="text-slate-400 text-xs mt-3">
                Clique no link acima para ir ao site e aplicar o cupom
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full space-y-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white mb-4">Descontos Exclusivos</h1>
          <p className="text-slate-400 text-lg max-w-3xl">
            Carregando cupons de desconto...
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
                <div className="h-8 bg-slate-600/30 rounded w-20"></div>
              </div>
              <div className="h-4 bg-slate-600/20 rounded mb-2"></div>
              <div className="h-4 bg-slate-600/20 rounded w-3/4 mb-4"></div>
              <div className="flex space-x-3">
                <div className="flex-1 h-10 bg-slate-600/30 rounded"></div>
                <div className="w-10 h-10 bg-slate-600/30 rounded"></div>
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
        <h1 className="text-3xl font-bold text-white mb-4">Descontos Exclusivos</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Aproveite cupons de desconto exclusivos nas melhores ferramentas para desenvolvedores, 
          designers e criadores de conteúdo. Economize em suas ferramentas favoritas!
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
            onClick={() => {
              setShowCategoryDropdown(!showCategoryDropdown);
              setShowSortDropdown(false);
            }}
            className="flex items-center space-x-2 px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-300 hover:bg-slate-600/30 transition-colors min-w-[180px] justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">{getCategoryLabel(selectedCategory)}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showCategoryDropdown && (
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
                {categories.map((category) => (
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

        {/* Sort Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSortDropdown(!showSortDropdown);
              setShowCategoryDropdown(false);
            }}
            className="flex items-center space-x-2 px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-300 hover:bg-slate-600/30 transition-colors min-w-[160px] justify-between"
          >
            <div className="flex items-center space-x-2">
              <SortAsc className="w-4 h-4" />
              <span className="text-sm">{getSortLabel(sortBy)}</span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showSortDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50">
              <div className="p-2">
                {sortOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortBy(option.value);
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      sortBy === option.value
                        ? 'bg-[#ff7551] text-white'
                        : 'text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    {option.label}
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
          {filteredAndSortedDiscounts.length} ferramenta{filteredAndSortedDiscounts.length !== 1 ? 's' : ''} encontrada{filteredAndSortedDiscounts.length !== 1 ? 's' : ''}
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

      {/* Discounts Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedDiscounts.map((discount, index) => (
          <div
            key={discount.id}
            className="animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <DiscountCardComponent discount={discount} />
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAndSortedDiscounts.length === 0 && (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Gift className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            {searchQuery || selectedCategory !== 'all' ? 'Nenhuma ferramenta encontrada' : 'Nenhum desconto encontrado'}
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            {searchQuery || selectedCategory !== 'all' 
              ? 'Tente ajustar os filtros ou usar termos de busca diferentes.'
              : 'Não encontramos cupons para esta categoria. Tente selecionar outra categoria.'
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

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-[#ff7551]/10 to-[#ff7551]/5 border border-[#ff7551]/20 rounded-xl p-8 text-center">
        <Gift className="w-12 h-12 text-[#ff7551] mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Quer mais descontos?</h3>
        <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
          Entre em contato conosco para sugerir novas ferramentas ou negociar descontos exclusivos 
          para a comunidade Me dá um Exemplo.
        </p>
        <button className="px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-semibold rounded-lg transition-colors">
          Sugerir Ferramenta
        </button>
      </div>
    </div>
  );
};

export default DiscountsPage;