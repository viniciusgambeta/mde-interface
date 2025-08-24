import React, { useRef, useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Play, Clock, Bookmark, Filter, X, BarChart3, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { videoService, categoryService, difficultyService, type Video } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface VideoGridProps {
  currentView: string;
  onVideoSelect: (video: any) => void;
}

const VideoGrid: React.FC<VideoGridProps> = ({ currentView, onVideoSelect }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [videos, setVideos] = useState<Video[]>([]);
  const [filteredVideos, setFilteredVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarkStates, setBookmarkStates] = useState<Record<string, { isBookmarked: boolean; isLoading: boolean }>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    type: '',
    search: ''
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [difficulties, setDifficulties] = useState<any[]>([]);
  
  const latestScrollRef = useRef<HTMLDivElement>(null);
  const tutorialsScrollRef = useRef<HTMLDivElement>(null);
  const designScrollRef = useRef<HTMLDivElement>(null);
  const marketingScrollRef = useRef<HTMLDivElement>(null);

  // Setup realtime subscription for bookmarks - MUST be at top level
  useEffect(() => {
    if (!user) return;

    console.log('Setting up realtime subscription for user bookmarks');
    
    const subscription = supabase
      .channel('user_bookmarks')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_bookmarks',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Realtime bookmark change:', payload);
          
          if (payload.eventType === 'INSERT') {
            const videoId = payload.new.video_id;
            setBookmarkStates(prev => ({
              ...prev,
              [videoId]: {
                isBookmarked: true,
                isLoading: false
              }
            }));
          } else if (payload.eventType === 'DELETE') {
            const videoId = payload.old.video_id;
            setBookmarkStates(prev => ({
              ...prev,
              [videoId]: {
                isBookmarked: false,
                isLoading: false
              }
            }));
            
            // Remove from bookmark view if we're on that page
            if (currentView === 'bookmark') {
              setVideos(prev => prev.filter(v => v.id !== videoId));
            }
          }
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up realtime subscription');
      subscription.unsubscribe();
    };
  }, [user?.id, currentView]);

  // Load videos from database
  useEffect(() => {
    const loadVideos = async () => {
      setLoading(true);
      
      try {
        let videoData: Video[] = [];
        
        console.log('Loading videos for view:', currentView);
        
        if (currentView === 'discover') {
          videoData = await videoService.getVideos({ 
            limit: 20, 
            userId: user?.id 
          });
        } else if (currentView === 'trending') {
          videoData = await videoService.getVideos({ 
            limit: 50, 
            userId: user?.id 
          });
          // Sort by view count for trending
          videoData.sort((a, b) => b.view_count - a.view_count);
        } else if (currentView === 'bookmark') {
          // Load bookmarked videos for the user
          if (user) {
            videoData = await videoService.getBookmarkedVideos(user.id);
          } else {
            videoData = [];
          }
        } else {
          // For specific categories
          videoData = await videoService.getVideosByCategory(currentView, 12, user?.id);
        }
        
        console.log('Loaded videos:', videoData.length, 'videos');
        setVideos(videoData);
        setFilteredVideos(videoData);
        
        // Initialize bookmark states
        const initialBookmarkStates: Record<string, { isBookmarked: boolean; isLoading: boolean }> = {};
        videoData.forEach(video => {
          initialBookmarkStates[video.id] = {
            isBookmarked: video.is_bookmarked || false,
            isLoading: false
          };
        });
        setBookmarkStates(initialBookmarkStates);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();
  }, [currentView, user?.id]);

  // Load filter options for trending and bookmark pages
  useEffect(() => {
    const loadFilterOptions = async () => {
      if (currentView === 'trending' || currentView === 'bookmark') {
        try {
          const [categoriesData, difficultiesData] = await Promise.all([
            categoryService.getCategories(),
            difficultyService.getDifficultyLevels()
          ]);
          setCategories(categoriesData);
          setDifficulties(difficultiesData);
        } catch (error) {
          console.error('Error loading filter options:', error);
        }
      }
    };

    loadFilterOptions();
  }, [currentView]);

  // Apply filters
  useEffect(() => {
    if (currentView !== 'trending' && currentView !== 'bookmark') {
      return;
    }

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

    // Type filter
    if (filters.type) {
      filtered = filtered.filter(video => video.tipo === filters.type);
    }

    setFilteredVideos(filtered);
  }, [filters, videos, currentView]);

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      difficulty: '',
      type: '',
      search: ''
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  const scrollRight = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  const scrollLeftFn = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

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

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:00`;
    }
    return `${mins}:00`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const handleVideoClick = (video: Video, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log(`🎬 ${video.tipo === 'prompt' ? 'Prompt' : 'Video'} card clicked:`, {
      title: video.title,
      slug: video.slug,
      id: video.id,
      tipo: video.tipo,
      timestamp: Date.now()
    });
    
    // Call the parent handler
    onVideoSelect(video);
  };

  const handleBookmarkClick = async (video: Video, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (!user) {
      console.log('User not logged in, cannot bookmark');
      return;
    }

    // Prevent multiple simultaneous requests
    if (bookmarkStates[video.id]?.isLoading) {
      return;
    }

    // Optimistically update the UI
    const currentState = bookmarkStates[video.id];
    const newBookmarkState = !currentState?.isBookmarked;
    
    setBookmarkStates(prev => ({
      ...prev,
      [video.id]: {
        isBookmarked: newBookmarkState,
        isLoading: true
      }
    }));

    try {
      console.log('Toggling bookmark for video:', video.id, 'New state:', newBookmarkState);
      
      const result = await videoService.toggleBookmarkOptimized(video.id, user.id);
      
      if (result.success) {
        // Update the final state
        setBookmarkStates(prev => ({
          ...prev,
          [video.id]: {
            isBookmarked: result.isBookmarked,
            isLoading: false
          }
        }));
        
        // Update videos array for consistency
        setVideos(prev => prev.map(v => 
          v.id === video.id 
            ? { ...v, is_bookmarked: result.isBookmarked }
            : v
        ));
        
        // If we're on the bookmark page and the video was unbookmarked, remove it
        if (currentView === 'bookmark' && !result.isBookmarked) {
          setTimeout(() => {
            setVideos(prev => prev.filter(v => v.id !== video.id));
          }, 300); // Small delay for smooth animation
        }
      } else {
        // Revert optimistic update on failure
        setBookmarkStates(prev => ({
          ...prev,
          [video.id]: {
            isBookmarked: currentState?.isBookmarked || false,
            isLoading: false
          }
        }));
        console.error('Failed to toggle bookmark');
      }
    } catch (error) {
      // Revert optimistic update on error
      setBookmarkStates(prev => ({
        ...prev,
        [video.id]: {
          isBookmarked: currentState?.isBookmarked || false,
          isLoading: false
        }
      }));
      console.error('Error toggling bookmark:', error);
    }
  };

  // Loading skeleton component
  const VideoCardSkeleton = () => (
    <div
      className="relative"
    >
      <div className="relative overflow-hidden rounded-lg bg-slate-700/30 mb-3 aspect-[2/3] animate-pulse">
        <div className="w-full h-full bg-gradient-to-br from-slate-600/20 to-slate-700/40"></div>
      </div>
      
      <div className="space-y-2 px-1">
        <div className="h-4 bg-slate-700/30 rounded animate-pulse"></div>
        <div className="h-3 bg-slate-700/20 rounded w-3/4 animate-pulse"></div>
      </div>
    </div>
  );

  // Grid layout for trending and bookmark pages
  const GridLayout: React.FC<{ videos: Video[]; title: string; description: string }> = ({ videos, title, description }) => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
          <p className="text-slate-400">{description}</p>
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
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
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
              label="Tipo"
              value={filters.type}
              options={[
                { id: 'video', name: 'Vídeo' },
                { id: 'prompt', name: 'Prompt' },
                { id: 'live', name: 'Live' }
              ]}
              onChange={(value) => updateFilter('type', value)}
              icon={<Play className="w-4 h-4" />}
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
          <div className="text-slate-400 text-sm whitespace-nowrap">
            <span className="font-medium text-white">{videos.length}</span> aula{videos.length !== 1 ? 's' : ''} encontrada{videos.length !== 1 ? 's' : ''}
            {hasActiveFilters && (
              <span className="ml-1">de {filteredVideos.length} total</span>
            )}
          </div>
        </div>
      </div>

      {/* Videos Grid */}
      {videos.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
          {videos.map((video, index) => (
            <VideoCard 
              key={video.id} 
              video={video} 
              delay={index * 50}
              showToolIcons={false}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bookmark className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhuma aula encontrada
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            {hasActiveFilters 
              ? 'Tente ajustar os filtros para encontrar o que procura.'
              : currentView === 'bookmark' 
                ? 'Comece a salvar suas aulas favoritas clicando no ícone de bookmark nos vídeos.'
                : 'Nenhuma aula disponível no momento.'
            }
          </p>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 px-6 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white rounded-lg transition-colors"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </div>
  );

  // Enhanced loading component
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-2 border-[#ff7551]/30 border-t-[#ff7551] rounded-full animate-spin"></div>
          <span className="text-slate-400">Carregando...</span>
        </div>
      </div>
    );
  }

  const VideoCard = ({ video, delay, showToolIcons = true }: { video: Video; delay: number; showToolIcons?: boolean }) => {
    // Use local bookmark state if available, fallback to video data
    const bookmarkState = bookmarkStates[video.id];
    const isBookmarked = bookmarkState?.isBookmarked ?? video.is_bookmarked ?? false;
    const isBookmarkLoading = bookmarkState?.isLoading ?? false;
    
    return (
      <div
        className="group cursor-pointer select-none relative"
      >
        {/* Bookmark Button - Positioned absolutely outside clickable area */}
        {user && (
          <button
            onClick={(e) => handleBookmarkClick(video, e)}
            disabled={isBookmarkLoading}
            className={`absolute top-3 left-3 z-20 p-2 rounded-full backdrop-blur-sm transition-all duration-200 group-hover:opacity-100 ${
              isBookmarked 
                ? 'bg-[#ff7551] text-white shadow-lg' 
                : 'bg-black/60 text-white hover:bg-[#ff7551]/80'
            } ${isBookmarkLoading ? 'animate-pulse scale-110' : ''} disabled:cursor-not-allowed`}
          >
            <Bookmark 
              className={`w-5 h-5 transition-all duration-200 ${isBookmarkLoading ? 'animate-pulse' : ''}`}
              fill={isBookmarked ? 'none' : 'none'}
              stroke="currentColor"
            />
          </button>
        )}

        {/* Clickable Card Container */}
        <div 
          onClick={(e) => handleVideoClick(video, e)}
          className="block w-full cursor-pointer"
        >
          {/* Thumbnail Container */}
          <div className="relative overflow-hidden rounded-lg bg-slate-700 mb-4 aspect-[2/3] transition-all duration-300 hover:shadow-xl">
          {/* Content Type Badge */}
          {video.tipo === 'prompt' && (
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-blue-500 text-white text-sm px-3 py-1.5 rounded font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Prompt</span>
            </div>
          )}
          
          {/* Live Badge */}
          {video.tipo === 'live' && (
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 bg-red-500 text-white text-sm px-3 py-1.5 rounded font-medium">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5 7h4l1 1v8l-1 1H5a2 2 0 01-2-2V9a2 2 0 012-2z" />
              </svg>
              <span>Live</span>
            </div>
          )}
          
            <img
              src={video.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=320&h=480&fit=crop'}
              alt={video.title}
              className="w-full h-full object-cover transition-all duration-300 group-hover:brightness-75 group-hover:scale-105"
              draggable={false}
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300" />
            
          {/* Play Button on Hover (only for videos) */}
          {video.tipo === 'video' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <Play className="w-8 h-8 text-slate-800 ml-1" fill="currentColor" />
              </div>
            </div>
          )}
          
          {/* Arrow Icon for Prompts */}
          {video.tipo === 'prompt' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-20 h-20 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300 shadow-lg">
                <svg className="w-8 h-8 text-slate-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
          
          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6 pt-12">
            <h3 className="text-white font-medium leading-snug group-hover:text-[#ff7551] transition-colors text-xl">
              {video.title}
            </h3>
          </div>
          </div>

        {/* Tools Icons - Only show if showToolIcons is true */}
        {showToolIcons && video.ferramentas && video.ferramentas.length > 0 && (
          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1">
              {video.ferramentas.slice(0, 5).map((ferramenta, index) => (
                <div
                  key={ferramenta.id}
                  className="w-6 h-6 rounded-sm overflow-hidden flex items-center justify-center group/tool relative transition-all duration-200 group-hover:w-8 group-hover:h-8"
                  style={{ zIndex: 5 - index }}
                  title={ferramenta.nome}
                >
                  <img 
                    src={ferramenta.icone} 
                    alt={ferramenta.nome}
                    className="w-6 h-6 object-contain drop-shadow-2xl filter brightness-75 contrast-125 transition-all duration-200 group-hover:w-8 group-hover:h-8 group-hover:filter-none"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  <div className="w-6 h-6 bg-slate-500 rounded-sm hidden flex items-center justify-center drop-shadow-2xl filter brightness-75 contrast-125 transition-all duration-200 group-hover:w-8 group-hover:h-8 group-hover:filter-none">
                    <span className="text-white text-xs font-bold">
                      {ferramenta.nome.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover/tool:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {ferramenta.nome}
                  </div>
                </div>
              ))}
              
              {/* More indicator */}
              {video.ferramentas.length > 5 && (
                <div className="w-6 h-6 rounded-sm bg-slate-600 flex items-center justify-center drop-shadow-2xl text-slate-200 filter brightness-75 contrast-125 transition-all duration-200 group-hover:w-8 group-hover:h-8 group-hover:filter-none" style={{ zIndex: 0 }}>
                  <span className="text-slate-400 text-xs font-medium">
                    +{video.ferramentas.length - 5}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
        </div>
      </div>
    );
  };

  const ScrollableVideoRow = ({ 
    title, 
    videos: rowVideos, 
    scrollRef
  }: { 
    title: string; 
    videos: Video[]; 
    scrollRef: React.RefObject<HTMLDivElement>;
  }) => (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-semibold text-white">{title}</h2>
        {rowVideos.length > 4 && (
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => scrollLeftFn(scrollRef)}
              className="p-3 rounded-full bg-slate-700/30 hover:bg-slate-600/30 text-slate-400 hover:text-white transition-all"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={() => scrollRight(scrollRef)}
              className="p-3 rounded-full bg-slate-700/30 hover:bg-slate-600/30 text-slate-400 hover:text-white transition-all"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
      
      {rowVideos.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-slate-400 text-base">Nenhum vídeo encontrado nesta categoria.</div>
        </div>
      ) : (
        <div className="relative">
          <div 
            ref={scrollRef}
            className="flex space-x-8 overflow-x-auto scrollbar-hide pb-6"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            }}
          >
            {rowVideos.map((video, index) => (
              <div 
                key={video.id} 
                className="flex-shrink-0 w-64"
              >
                <VideoCard video={video} delay={0} showToolIcons={true} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <section>
        <ScrollableVideoRow
          title="Carregando vídeos..."
          videos={[]}
          scrollRef={latestScrollRef}
        />
        
        {currentView === 'discover' && (
          <>
            <ScrollableVideoRow
              title="Tutoriais"
              videos={[]}
              scrollRef={tutorialsScrollRef}
            />
            
            <ScrollableVideoRow
              title="Design"
              videos={[]}
              scrollRef={designScrollRef}
            />
          </>
        )}
      </section>
    );
  }

  // Show empty state for bookmarks when user is not logged in
  if (currentView === 'bookmark' && !user) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Salvos</h1>
          <p className="text-slate-400">Suas aulas favoritas salvas para assistir depois</p>
        </div>
        <div className="flex flex-col items-center justify-center py-20">
          <Bookmark className="w-16 h-16 text-slate-600 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Faça login para ver suas aulas salvas</h3>
          <p className="text-slate-400 text-center max-w-md">
            Entre na sua conta para acessar suas aulas favoritas e continuar de onde parou.
          </p>
        </div>
      </div>
    );
  }

  // Use grid layout for trending and bookmark pages
  if (currentView === 'trending') {
    return (
      <GridLayout 
        videos={filteredVideos} 
        title="Em Alta" 
        description="As aulas mais populares e assistidas da plataforma, ordenadas por número de visualizações"
      />
    );
  }

  if (currentView === 'bookmark') {
    return (
      <GridLayout 
        videos={filteredVideos} 
        title="Salvos" 
        description="Suas aulas favoritas salvas para assistir depois"
      />
    );
  }

  return (
    <section className="animate-page-transition">
      {currentView !== 'discover' ? (
        <ScrollableVideoRow title={getViewTitle(currentView)} videos={videos} scrollRef={latestScrollRef} />
      ) : (
        <>
          <ScrollableVideoRow title="Últimos Vídeos" videos={videos.slice(0, 10)} scrollRef={latestScrollRef} />
      
          <ScrollableVideoRow title="Inteligência Artificial" videos={videos.filter(v => v.category?.name === 'Inteligência Artificial')} scrollRef={tutorialsScrollRef} />
          
          <ScrollableVideoRow title="Automações" videos={videos.filter(v => v.category?.slug === 'automation' || v.category?.name.toLowerCase().includes('automação') || v.category?.name.toLowerCase().includes('automacao'))} scrollRef={designScrollRef} />
          
          <ScrollableVideoRow title="Eventos ao Vivo" videos={videos.filter(v => v.tipo === 'live')} scrollRef={marketingScrollRef} />
          
          <ScrollableVideoRow title="Prompts" videos={videos.filter(v => v.tipo === 'prompt')} scrollRef={latestScrollRef} />
          
          <ScrollableVideoRow title="WhatsApp" videos={videos.filter(v => v.category?.slug === 'whatsapp' || v.category?.name.toLowerCase().includes('whatsapp'))} scrollRef={tutorialsScrollRef} />
          
          <ScrollableVideoRow title="Aulas Básicas" videos={videos.filter(v => v.category?.slug === 'basico' || v.category?.name.toLowerCase().includes('básico') || v.category?.name.toLowerCase().includes('basico'))} scrollRef={designScrollRef} />
          
          <ScrollableVideoRow title="Vibe Coding" videos={videos.filter(v => v.category?.slug === 'bolt' || v.category?.name.toLowerCase().includes('bolt') || v.category?.name.toLowerCase().includes('vibe'))} scrollRef={marketingScrollRef} />
        </>
      )}
    </section>
  );
};

function getViewTitle(view: string): string {
  const titles: Record<string, string> = {
    programming: 'Programação',
    design: 'Design',
    marketing: 'Marketing',
    business: 'Negócios',
    data: 'Ciência de Dados',
    mobile: 'Mobile'
  };
  return titles[view] || view.charAt(0).toUpperCase() + view.slice(1);
}

export default VideoGrid;