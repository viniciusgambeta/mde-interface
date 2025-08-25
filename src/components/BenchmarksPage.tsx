import React, { useState, useEffect } from 'react';
import { Search, Filter, ChevronDown, ExternalLink, Calendar, Award, TrendingUp, Database, AlertCircle, Loader2 } from 'lucide-react';

interface BenchmarkData {
  benchmark_id?: string;
  name?: string;
  model?: string;
  benchmark?: string;
  score?: number;
  value?: number;
  date?: string;
  last_updated?: string;
  source?: string;
  category?: string;
  modality?: string;
  max_score?: number;
  description?: string;
  paper_link?: string;
  implementation_link?: string;
  language?: string;
  multilingual?: boolean;
  verified?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface BenchmarkEntry {
  model: string;
  benchmark: string;
  score: string;
  source: string;
  category: string;
  modality: string;
  description: string;
  filename: string;
}

const BenchmarksPage: React.FC = () => {
  const [benchmarkFiles, setBenchmarkFiles] = useState<string[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkEntry[]>([]);
  const [filteredData, setFilteredData] = useState<BenchmarkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBenchmark, setSelectedBenchmark] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showBenchmarkDropdown, setShowBenchmarkDropdown] = useState(false);
  const [availableBenchmarksSet, setAvailableBenchmarksSet] = useState<Set<string>>(new Set());
  const [loadingProgress, setLoadingProgress] = useState({ current: 0, total: 0 });

  // Load benchmark files list and data
  useEffect(() => {
    const loadBenchmarksData = async () => {
      setLoading(true);
      
      try {
        // Load the index file with list of available benchmarks
        console.log('Loading benchmark index...');
        const indexResponse = await fetch('/llm-data/benchmarks/index.json');
        
        if (!indexResponse.ok) {
          throw new Error(`Failed to load index: ${indexResponse.status}`);
        }
        
        const files = await indexResponse.json() as string[];
        console.log('Found benchmark files:', files.length);
        setBenchmarkFiles(files);
        setLoadingProgress({ current: 0, total: files.length });

        // Load each benchmark file
        const allBenchmarkData: BenchmarkEntry[] = [];
        const benchmarkNames = new Set<string>();
        
        for (let i = 0; i < files.length; i++) {
          const filename = files[i];
          setLoadingProgress({ current: i + 1, total: files.length });
          
          try {
            console.log(`Loading benchmark file ${i + 1}/${files.length}: ${filename}`);
            const response = await fetch(`/llm-data/benchmarks/${filename}`);
            
            if (!response.ok) {
              console.warn(`Failed to load ${filename}: ${response.status}`);
              continue;
            }
            
            const data = await response.json() as BenchmarkData;
            
            // Extract relevant information
            const entry: BenchmarkEntry = {
              model: data.model || 'N/A',
              benchmark: data.name || data.benchmark || data.benchmark_id || filename.replace('.json', ''),
              score: formatScore(data.score || data.value, data.max_score),
              source: data.source || data.paper_link || data.implementation_link || 'N/A',
              category: data.category || 'general',
              modality: data.modality || 'text',
              description: data.description || 'No description available',
              filename: filename
            };
            
            allBenchmarkData.push(entry);
            benchmarkNames.add(entry.benchmark);
            
          } catch (error) {
            console.warn(`Error parsing ${filename}:`, error);
            // Continue with other files
          }
        }
        
        console.log('Loaded benchmark data:', allBenchmarkData.length, 'entries');
        setBenchmarkData(allBenchmarkData);
        setFilteredData(allBenchmarkData);
        setAvailableBenchmarksSet(benchmarkNames);
        
      } catch (error) {
        console.error('Error loading benchmarks:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBenchmarksData();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = [...benchmarkData];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.model.toLowerCase().includes(query) ||
        entry.benchmark.toLowerCase().includes(query) ||
        entry.category.toLowerCase().includes(query) ||
        entry.description.toLowerCase().includes(query)
      );
    }

    // Benchmark filter
    if (selectedBenchmark !== 'all') {
      filtered = filtered.filter(entry => entry.benchmark === selectedBenchmark);
    }

    setFilteredData(filtered);
  }, [benchmarkData, searchQuery, selectedBenchmark]);

  const formatScore = (score: number | undefined, maxScore: number | undefined): string => {
    if (score === undefined) return 'N/A';
    
    if (maxScore && maxScore !== 1.0) {
      return `${score}/${maxScore}`;
    }
    
    // If it's a percentage (0-1), convert to percentage
    if (score <= 1.0) {
      return `${(score * 100).toFixed(1)}%`;
    }
    
    return score.toString();
  };

  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'general': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      'code': 'bg-green-500/20 text-green-400 border-green-500/30',
      'math': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      'reasoning': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      'vision': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      'long_context': 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      'factuality': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      'roleplay': 'bg-red-500/20 text-red-400 border-red-500/30'
    };
    
    return colors[category] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getModalityIcon = (modality: string) => {
    switch (modality) {
      case 'text':
        return '📝';
      case 'multimodal':
        return '🎭';
      case 'video':
        return '🎬';
      case 'audio':
        return '🎵';
      default:
        return '📊';
    }
  };

  const availableBenchmarksArray = Array.from(availableBenchmarksSet).sort();

  if (loading) {
    return (
      <div className="w-full space-y-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white mb-4">Benchmarks de LLM</h1>
          <p className="text-slate-400 text-lg">
            Carregando dados de benchmarks...
          </p>
        </div>
        
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 border-4 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin mb-6"></div>
          <div className="text-center">
            <p className="text-white font-medium mb-2">Carregando benchmarks</p>
            <p className="text-slate-400 text-sm">
              {loadingProgress.current > 0 && (
                <>Processando {loadingProgress.current} de {loadingProgress.total} arquivos...</>
              )}
            </p>
            {loadingProgress.total > 0 && (
              <div className="w-64 bg-slate-700/30 rounded-full h-2 mt-4">
                <div 
                  className="bg-[#ff7551] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(loadingProgress.current / loadingProgress.total) * 100}%` }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white mb-4">Benchmarks de LLM</h1>
        <p className="text-slate-400 text-lg max-w-4xl">
          Explore dados de performance de modelos de linguagem em diversos benchmarks. 
          Compare resultados entre diferentes modelos e categorias de avaliação.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Database className="w-5 h-5 text-[#ff7551]" />
            <span className="text-slate-400 text-sm">Total Benchmarks</span>
          </div>
          <div className="text-2xl font-bold text-white">{availableBenchmarksArray.length}</div>
        </div>
        
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Award className="w-5 h-5 text-[#ff7551]" />
            <span className="text-slate-400 text-sm">Entradas</span>
          </div>
          <div className="text-2xl font-bold text-white">{benchmarkData.length}</div>
        </div>
        
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="w-5 h-5 text-[#ff7551]" />
            <span className="text-slate-400 text-sm">Filtrados</span>
          </div>
          <div className="text-2xl font-bold text-white">{filteredData.length}</div>
        </div>
        
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-[#ff7551]" />
            <span className="text-slate-400 text-sm">Categorias</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {new Set(benchmarkData.map(entry => entry.category)).size}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar modelos ou benchmarks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all"
          />
        </div>

        {/* Benchmark Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowBenchmarkDropdown(!showBenchmarkDropdown)}
            className="flex items-center space-x-2 px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-slate-300 hover:bg-slate-600/30 transition-colors min-w-[200px] justify-between"
          >
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4" />
              <span className="text-sm">
                {selectedBenchmark === 'all' ? 'Todos os Benchmarks' : selectedBenchmark}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 transition-transform ${showBenchmarkDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showBenchmarkDropdown && (
            <div className="absolute top-full left-0 mt-2 w-full bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
              <div className="p-2">
                <button
                  onClick={() => {
                    setSelectedBenchmark('all');
                    setShowBenchmarkDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    selectedBenchmark === 'all'
                      ? 'bg-[#ff7551] text-white'
                      : 'text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  Todos os Benchmarks
                </button>
                {availableBenchmarksArray.map((benchmark) => (
                  <button
                    key={benchmark}
                    onClick={() => {
                      setSelectedBenchmark(benchmark);
                      setShowBenchmarkDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      selectedBenchmark === benchmark
                        ? 'bg-[#ff7551] text-white'
                        : 'text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    {benchmark}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Filters */}
        {(searchQuery || selectedBenchmark !== 'all') && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedBenchmark('all');
            }}
            className="flex items-center space-x-2 px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
          >
            <span className="text-sm">Limpar Filtros</span>
          </button>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {filteredData.length} entrada{filteredData.length !== 1 ? 's' : ''} encontrada{filteredData.length !== 1 ? 's' : ''}
        </span>
        {(searchQuery || selectedBenchmark !== 'all') && (
          <span>de {benchmarkData.length} total</span>
        )}
      </div>

      {/* Benchmarks Table */}
      {filteredData.length > 0 ? (
        <div className="bg-slate-700/30 border border-slate-600/30 rounded-xl overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-800/50 border-b border-slate-600/30">
                <tr>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Modelo</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Benchmark</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Pontuação</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Categoria</th>
                  <th className="text-left px-6 py-4 text-slate-300 font-semibold">Fonte</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.map((entry, index) => (
                  <tr 
                    key={`${entry.filename}-${index}`}
                    className="border-b border-slate-600/20 hover:bg-slate-600/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-medium">{entry.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">{getModalityIcon(entry.modality)}</span>
                        <div>
                          <div className="text-white font-medium">{entry.benchmark}</div>
                          <div className="text-slate-400 text-xs">{entry.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#ff7551] font-bold text-lg">{entry.score}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(entry.category)}`}>
                        {entry.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {entry.source !== 'N/A' ? (
                        <a
                          href={entry.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 text-[#ff7551] hover:text-[#ff7551]/80 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span className="text-sm">Ver fonte</span>
                        </a>
                      ) : (
                        <span className="text-slate-500 text-sm">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4 p-4">
            {filteredData.map((entry, index) => (
              <div 
                key={`${entry.filename}-${index}`}
                className="bg-slate-800/30 border border-slate-600/30 rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg">{entry.model}</h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xl">{getModalityIcon(entry.modality)}</span>
                      <span className="text-slate-300">{entry.benchmark}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[#ff7551] font-bold text-xl">{entry.score}</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getCategoryColor(entry.category)}`}>
                    {entry.category}
                  </span>
                  
                  {entry.source !== 'N/A' && (
                    <a
                      href={entry.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 text-[#ff7551] hover:text-[#ff7551]/80 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span className="text-sm">Fonte</span>
                    </a>
                  )}
                </div>
                
                <p className="text-slate-400 text-sm">{entry.description}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">
            Nenhum benchmark encontrado
          </h3>
          <p className="text-slate-400 max-w-md mx-auto text-base">
            {searchQuery || selectedBenchmark !== 'all' 
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : 'Não foi possível carregar os dados de benchmarks.'
            }
          </p>
          {(searchQuery || selectedBenchmark !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedBenchmark('all');
              }}
              className="mt-6 px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}

      {/* Legend */}
      <div className="bg-slate-700/30 border border-slate-600/30 rounded-lg p-6">
        <h3 className="text-white font-semibold mb-4">Legenda das Categorias</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: 'general', label: 'Geral' },
            { key: 'code', label: 'Código' },
            { key: 'math', label: 'Matemática' },
            { key: 'reasoning', label: 'Raciocínio' },
            { key: 'vision', label: 'Visão' },
            { key: 'long_context', label: 'Contexto Longo' },
            { key: 'factuality', label: 'Factualidade' },
            { key: 'roleplay', label: 'Roleplay' }
          ].map((cat) => (
            <div key={cat.key} className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(cat.key)}`}>
                {cat.label}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t border-slate-600/30">
          <h4 className="text-slate-300 font-medium mb-2">Modalidades</h4>
          <div className="flex flex-wrap gap-3 text-sm text-slate-400">
            <span>📝 Texto</span>
            <span>🎭 Multimodal</span>
            <span>🎬 Vídeo</span>
            <span>🎵 Áudio</span>
            <span>📊 Dados</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BenchmarksPage;