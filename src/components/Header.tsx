import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, ChevronDown, Menu, UserPlus, X, Play, Clock, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';
import { videoService, type Video } from '../lib/database';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import ProfileModal from './auth/ProfileModal';

interface HeaderProps {
  sidebarCollapsed: boolean;
  onSidebarToggle: () => void;
  onViewChange?: (view: string) => void;
  onVideoSelect?: (video: Video) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, onSidebarToggle, onViewChange, onVideoSelect }) => {
  const navigate = useNavigate();
  const { currentVideo, isPiPActive, returnToVideo } = useVideo();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Search functionality
  useEffect(() => {
    const searchVideos = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        setShowSearchResults(false);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setShowSearchResults(true);

      try {
        // Get all videos and filter client-side for better search experience
        const allVideos = await videoService.getVideos({ limit: 100 });
        
        const query = searchQuery.toLowerCase();
        const filtered = allVideos.filter(video => {
          const titleMatch = video.title.toLowerCase().includes(query);
          const descriptionMatch = video.description?.toLowerCase().includes(query) || false;
          const summaryMatch = video.summary?.toLowerCase().includes(query) || false;
          const categoryMatch = video.category?.name.toLowerCase().includes(query) || false;
          const instructorMatch = video.instructor?.name.toLowerCase().includes(query) || false;
          
          return titleMatch || descriptionMatch || summaryMatch || categoryMatch || instructorMatch;
        });

        // Sort by relevance (title matches first, then others)
        const sorted = filtered.sort((a, b) => {
          const aTitle = a.title.toLowerCase().includes(query);
          const bTitle = b.title.toLowerCase().includes(query);
          
          if (aTitle && !bTitle) return -1;
          if (!aTitle && bTitle) return 1;
          
          // Secondary sort by view count
          return b.view_count - a.view_count;
        });

        setSearchResults(sorted.slice(0, 8)); // Limit to 8 results
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchVideos, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  const handleProfileClick = () => {
    if (onViewChange) {
      onViewChange('profile');
    }
    setShowUserMenu(false);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchResultClick = (video: Video) => {
    if (onVideoSelect) {
      onVideoSelect(video);
      setSearchQuery('');
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchResults(false);
  };

  const handleLogoClick = () => {
    navigate('/');
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

  return (
    <>
      <header className="relative z-40 w-full bg-[#1f1d2b]/90 backdrop-blur-sm border-b border-slate-700/30">
        {/* Picture-in-Picture Indicator */}
        {isPiPActive && currentVideo && (
          <div className="bg-[#ff7551] text-white px-4 py-2 text-sm flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span>Reproduzindo em Picture-in-Picture: {currentVideo.title}</span>
            </div>
            <button
              onClick={returnToVideo}
              className="text-white hover:text-black transition-colors font-medium"
            >
              Voltar ao vídeo →
            </button>
          </div>
        )}
        
        <div className="flex items-center justify-between px-8 py-4">
          {/* Left Section - Logo and Mobile Menu */}
          <div className="flex items-center space-x-6">
            {/* Logo */}
            <button 
              onClick={handleLogoClick}
              className="flex items-center hover:scale-102 transition-all duration-200 cursor-pointer group"
              style={{ margin: 0, padding: '8px' }}
            >
              <img
                src="/logo1_branco.png"
                alt="Me dá um Exemplo"
                className="h-20 w-auto group-hover:animate-discrete-pop"
                style={{ margin: 0, padding: 0 }}
              />
            </button>

            {/* Search Bar - Compact and expandable */}
            <div className="relative hidden sm:block" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                  className="w-56 md:w-72 focus:w-80 md:focus:w-[28rem] pl-12 pr-12 py-3 text-base bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 mt-2 w-80 md:w-[28rem] bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-[99999] max-h-[28rem] overflow-y-auto">
                  {isSearching ? (
                    <div className="p-6 text-center">
                      <div className="text-slate-400 text-base">Procurando...</div>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <div className="p-4 border-b border-slate-700/30">
                        <div className="text-slate-400 text-sm font-medium">
                          {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <div className="py-3">
                        {searchResults.map((video, index) => (
                          <button
                            key={video.id}
                            onClick={() => handleSearchResultClick(video)}
                            className="w-full flex items-center space-x-4 px-5 py-4 hover:bg-slate-700/30 transition-colors text-left animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            {/* Thumbnail */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={video.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=80&h=60&fit=crop'}
                                alt={video.title}
                                className="w-20 h-15 rounded object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                                <Play className="w-5 h-5 text-white" fill="currentColor" />
                              </div>
                            </div>

                            {/* Video Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white text-base font-medium line-clamp-2 leading-snug mb-2">
                                {video.title}
                              </h4>
                              <div className="flex items-center space-x-2 text-sm text-slate-400">
                                {video.instructor && (
                                  <span>{video.instructor.name}</span>
                                )}
                                {video.category && video.instructor && (
                                  <span>•</span>
                                )}
                                {video.category && (
                                  <span>{video.category.name}</span>
                                )}
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-slate-500 mt-1">
                                <div className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatDuration(video.duration_minutes)}</span>
                                </div>
                                <span>•</span>
                                <span>{formatViews(video.view_count)} views</span>
                                {video.is_premium && (
                                  <>
                                    <span>•</span>
                                    <span className="text-[#ff7551] font-medium">Premium</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                      {searchResults.length >= 8 && (
                        <div className="p-4 border-t border-slate-700/30 text-center">
                          <div className="text-slate-400 text-sm">
                            Mostrando os primeiros 8 resultados
                          </div>
                        </div>
                      )}
                    </>
                  ) : searchQuery.length >= 2 ? (
                    <div className="p-6 text-center">
                      <div className="text-slate-400 text-base">
                        Nenhum resultado encontrado para "{searchQuery}"
                      </div>
                      <div className="text-slate-500 text-sm mt-2">
                        Tente usar palavras-chave diferentes
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Right Section - User Menu */}
          <div className="flex items-center space-x-3">
            {/* Mobile Search Button */}
            <button className="sm:hidden p-3 rounded-lg hover:bg-slate-700/30 transition-colors">
              <Search className="w-6 h-6 text-slate-400" />
            </button>
            
            {isAuthenticated ? (
              /* Authenticated User Menu */
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-700/30 transition-colors group"
                >
                  <div className="hidden sm:block text-right">
                    <div className="text-white font-medium text-base group-hover:text-[#ff7551] transition-colors">{user?.name}</div>
                    <div className="text-slate-400 text-sm">{user?.isPremium ? 'Premium Member' : 'Free Member'}</div>
                  </div>
                  <div className="relative">
                    <img
                      src={user?.avatar || '/src/images/avatar.jpg'}
                      alt="User"
                      className="w-12 h-12 rounded-full object-cover border-2 border-[#ff7551]/50"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-[#1f1d2b]"></div>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-[99999] animate-fade-in">
                    <div className="py-3">
                      <button
                        onClick={handleProfileClick}
                        className="flex items-center space-x-3 w-full px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/30 transition-colors"
                      >
                        <User className="w-5 h-5" />
                        <span className="text-base">Minha Conta</span>
                      </button>
                      
                      <div className="border-t border-slate-700/30 my-2"></div>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-3 w-full px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/30 transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="text-base">Sair</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* Login/Register Buttons */
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="hidden sm:block px-4 py-3 text-slate-300 hover:text-white transition-colors text-base"
                >
                  Entrar
                </button>
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="flex items-center space-x-2 px-4 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors text-base"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Criar Conta</span>
                  <span className="sm:hidden">Entrar</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={() => {
          setShowLoginModal(false);
          setShowRegisterModal(true);
        }}
      />

      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={() => {
          setShowRegisterModal(false);
          setShowLoginModal(true);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </>
  );
};

export default Header;