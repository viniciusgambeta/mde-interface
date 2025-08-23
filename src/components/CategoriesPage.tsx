import React, { useState, useEffect } from 'react';
import { Search, Filter, Clock, BarChart3, User, X, ChevronDown, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { videoService, categoryService, difficultyService, type Video, type Category, type DifficultyLevel, type Instructor } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

interface FilterState {
  category: string;
  difficulty: string;
  instructor: string;
  duration: string;
  search: string;
}

interface CategoriesPageProps {
  onVideoSelect?: (video: Video) => void;
}

const CategoriesPage: React.FC<CategoriesPageProps> = ({ onVideoSelect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [difficulties, setDifficulties] = useState<DifficultyLevel[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    category: '',
    difficulty: '',
    instructor: '',
    duration: '',
    search: ''
  });

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [videosData, categoriesData, difficultiesData] = await Promise.all([
          videoService.getVideos({ limit: 100, userId: user?.id }),
          categoryService.getCategories(),
          difficultyService.getDifficultyLevels()
        ]);

        setVideos(videosData);
        setFilteredVideos(videosData);
        setCategories(categoriesData);
        setDifficulties(difficultiesData);

        // Extract unique instructors from videos
        const uniqueInstructors = videosData
          .filter(video => video.instructor)
          .map(video => video.instructor!)
          .filter((instructor, index, self) => 
            index === self.findIndex(i => i.id === instructor.id)
          );
        setInstructors(uniqueInstructors);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  // Apply filters
  useEffect(() => {
    let filtered = [...videos];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(searchTerm) ||
        video.description?.toLowerCase().includes(searchTerm) ||
        video.summary?.toLowerCase().includes(searchTerm) ||
        video.instructor?.name.toLowerCase().includes(searchTerm) ||
        video.category?.name.toLowerCase().includes(searchTerm)
      );
    }

    // Category filter
    if (filters.category) {
      filtered = filtered.filter(video => video.category?.id === filters.category);
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(video => video.difficulty_level?.id === filters.difficulty);
    }

    // Instructor filter
    if (filters.instructor) {
      filtered = filtered.filter(video => video.instructor?.id === filters.instructor);
    }

    // Duration filter
    if (filters.duration) {
      filtered = filtered.filter(video => {
        const duration = video.duration_minutes;
        switch (filters.duration) {
          case 'short': return duration <= 10;
          case 'medium': return duration > 10 && duration <= 30;
          case 'long': return duration > 30;
          default: return true;
        }
      });
    }

    setFilteredVideos(filtered);
  }, [filters, videos]);

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      instructor: '',
      duration: '',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const FilterDropdown: React.FC<{
    label: string;
    value: string;
    options: { id: string; name: string }[];
    onChange: (value: string) => void;
    icon: React.ReactNode;
  }> = ({ label, value, options, onChange, icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.id === value);

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            value 
              ? 'bg-[#ff7551] border-[#ff7551] text-white' 
              : 'bg-slate-700/30 border-slate-600/30 text-slate-300 hover:bg-slate-600/30'
          }`}
        >
          {icon}
          <span className="text-sm">
            {selectedOption ? selectedOption.name : label}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
            <div className="p-2">
              <button
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm text-slate-300 hover:bg-slate-700/30 rounded transition-colors"
              >
                Todos
              </button>
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                    value === option.id
                      ? 'bg-[#ff7551] text-white'
                      : 'text-slate-300 hover:bg-slate-700/30'
                  }`}
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin"></div>
          <span className="text-slate-400">Carregando categorias...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Categorias</h1>
          <p className="text-slate-400">
            Explore aulas por categoria e use os filtros para encontrar exatamente o que procura
          </p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-slate-700/30 hover:bg-slate-600/30 text-white rounded-lg transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </button>
      </div>

      {/* Filters */}
      <div className={`${showFilters ? 'block' : 'hidden lg:block'} space-y-4`}>
        <div className="flex flex-wrap gap-4">
          <FilterDropdown
            label="Categoria"
            value={filters.category}
            options={categories}
            onChange={(value) => updateFilter('category', value)}
            icon={<Filter className="w-4 h-4" />}
          />

          <FilterDropdown
            label="Nível"
            value={filters.difficulty}
            options={difficulties}
            onChange={(value) => updateFilter('difficulty', value)}
            icon={<BarChart3 className="w-4 h-4" />}
          />

          <FilterDropdown
            label="Instrutor"
            value={filters.instructor}
            options={instructors}
            onChange={(value) => updateFilter('instructor', value)}
            icon={<User className="w-4 h-4" />}
          />

          <FilterDropdown
            label="Duração"
            value={filters.duration}
            options={[
              { id: 'short', name: 'Até 10 min' },
              { id: 'medium', name: '10-30 min' },
              { id: 'long', name: 'Mais de 30 min' }
            ]}
            onChange={(value) => updateFilter('duration', value)}
            icon={<Clock className="w-4 h-4" />}
          />

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              <span className="text-sm">Limpar Filtros</span>
            </button>
          )}
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-slate-400">
          <span>
            {filteredVideos.length} aula{filteredVideos.length !== 1 ? 's' : ''} encontrada{filteredVideos.length !== 1 ? 's' : ''}
          </span>
          {hasActiveFilters && (
            <span>
              de {videos.length} total
            </span>
          )}
        </div>
      </div>

      {/* Category Grid */}
      {!hasActiveFilters && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => {
            const categoryVideos = videos.filter(v => v.category?.id === category.id);
            return (
              <button
                key={category.id}
                onClick={() => updateFilter('category', category.id)}
                className="group p-6 bg-slate-700/30 hover:bg-slate-600/30 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <div className="w-16 h-16 rounded-lg mb-4 mx-auto flex items-center justify-center bg-slate-600/50 text-3xl">
                  {getCategoryEmoji(category.slug)}
                </div>
                <h3 className="text-white font-medium text-base mb-2 group-hover:text-[#ff7551] transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-400 text-sm">
                  {categoryVideos.length} aula{categoryVideos.length !== 1 ? 's' : ''}
                </p>
              </button>
            );
          })}
        </div>
      )}

      {/* Videos Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-8">
          {filteredVideos.map((video, index) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              delay={index * 50}
              onVideoSelect={onVideoSelect || (() => {})}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-2xl font-semibold text-white mb-3">
            Nenhuma aula encontrada
          </h3>
          <p className="text-slate-400 max-w-md mx-auto text-base">
            Tente ajustar os filtros ou usar termos de busca diferentes para encontrar o que procura.
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-6 px-8 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white rounded-lg transition-colors text-base"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get emoji for category
const getCategoryEmoji = (slug: string): string => {
  const emojiMap: Record<string, string> = {
    'programming': '💻',
    'design': '🎨',
    'marketing': '📈',
    'business': '💼',
    'data': '📊',
    'mobile': '📱',
    'web': '🌐',
    'ai': '🤖',
    'photography': '📸',
    'video': '🎬',
    'music': '🎵',
    'writing': '✍️',
    'finance': '💰',
    'health': '🏥',
    'education': '📚',
    'lifestyle': '🌟'
  };
  
  return emojiMap[slug] || '📁';
};

// Video Card Component for Categories Page
const VideoCard: React.FC<{ 
  video: Video; 
  delay: number;
  onVideoSelect: (video: Video) => void;
}> = ({ video, delay, onVideoSelect }) => {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(video.is_bookmarked || false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  const handleVideoClick = () => {
    console.log('🎬 Categories page video clicked:', {
      title: video.title,
      slug: video.slug,
      id: video.id
    });
    onVideoSelect(video);
  };

  const handleBookmarkClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!user || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    
    try {
      const result = await videoService.toggleBookmarkOptimized(video.id, user.id);
      if (result.success) {
        setIsBookmarked(result.isBookmarked);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:00`;
    }
    return `${mins}:00`;
  };

  return (
    <div
      className="group cursor-pointer select-none relative animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
      onClick={handleVideoClick}
    >
      {/* Bookmark Button */}
      {user && (
        <button
          onClick={handleBookmarkClick}
          disabled={bookmarkLoading}
          className={`absolute top-3 left-3 z-20 p-2 rounded-full backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 ${
            isBookmarked 
              ? 'bg-[#ff7551] text-white shadow-lg' 
              : 'bg-black/60 text-white hover:bg-[#ff7551]/80'
          } ${bookmarkLoading ? 'animate-pulse scale-110' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
        </button>
      )}

      {/* Thumbnail */}
      <div className="relative overflow-hidden rounded-lg bg-slate-700 mb-3 aspect-[2/3] transition-all duration-300 hover:shadow-xl">
        <img
          src={video.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=320&h=480&fit=crop'}
          alt={video.title}
          className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75"
          draggable={false}
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
        
        {/* Duration Badge */}
        <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center space-x-1">
          <Clock className="w-3 h-3" />
          <span>{formatDuration(video.duration_minutes)}</span>
        </div>
        
        {/* Premium Badge */}
        {video.is_premium && (
          <div className="absolute top-3 right-3 bg-[#ff7551] text-white text-xs px-2 py-1 rounded font-medium">
            Premium
          </div>
        )}
        
        {/* Content Type Badge */}
        {video.tipo === 'prompt' && (
          <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-[#5691d4] text-white text-xs px-2.5 py-1 rounded font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span>Prompt</span>
          </div>
        )}
        
        {/* Play Button on Hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
            {video.tipo === 'prompt' ? (
              <svg className="w-7 h-7 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <Play className="w-7 h-7 text-slate-800 ml-1" fill="currentColor" />
            )}
          </div>
        </div>
        
        {/* Live Badge */}
        {video.tipo === 'live' && (
          <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-red-500 text-white text-xs px-2.5 py-1 rounded font-medium">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 7h4l1 1v8l-1 1H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
            </svg>
            <span>Live</span>
          </div>
        )}
        
        {/* Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-3">
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-3">
          <h3 className="text-white font-medium leading-snug group-hover:text-[#ff7551] transition-colors text-lg">
            {video.title}
          </h3>
        </div>
      </div>

      {/* Tools Icons */}
      {video.ferramentas && video.ferramentas.length > 0 && (
        <div className="flex items-center justify-center space-x-2 mt-3 px-2">
          {video.ferramentas.slice(0, 6).map((ferramenta) => (
            <div
              key={ferramenta.id}
              className="w-6 h-6 rounded bg-slate-700/30 flex items-center justify-center group-hover:bg-slate-600/40 transition-colors"
              title={ferramenta.nome}
            >
              <img 
                src={ferramenta.icone} 
                alt={ferramenta.nome}
                className="w-4 h-4 object-contain rounded-sm opacity-80"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'block';
                }}
              />
              <svg className="w-3 h-3 text-slate-400 hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-2M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </div>
          ))}
          {video.ferramentas.length > 6 && (
            <div className="w-6 h-6 rounded bg-slate-700/30 flex items-center justify-center text-slate-400 text-xs font-medium">
              +{video.ferramentas.length - 6}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;