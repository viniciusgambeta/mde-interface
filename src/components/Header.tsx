import React, { useState, useRef, useEffect } from 'react';
import { Search, User, LogOut, ChevronDown, Menu, UserPlus, X, Play, Clock, Home, Bookmark, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useVideo } from '../contexts/VideoContext';
import { videoService, type Video } from '../lib/database';
import { supabase } from '../lib/supabase';
import LoginModal from './auth/LoginModal';
import RegisterModal from './auth/RegisterModal';
import ProfileModal from './auth/ProfileModal';
import PaywallModal from './PaywallModal';

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
  const [showPaywall, setShowPaywall] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Video[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, signOut } = useAuth();
  const [userData, setUserData] = useState<{name: string; avatar: string} | null>(null);

  // Load user data from assinaturas table
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setUserData(null);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('assinaturas')
          .select('"Nome do cliente", avatar_usuario')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading user data for header:', error);
          // Fallback to auth user data
          setUserData({
            name: user.email?.split('@')[0] || 'Usuário',
            avatar: '/avatar1.png'
          });
          return;
        }

        if (data) {
          setUserData({
            name: data["Nome do cliente"] || user.email?.split('@')[0] || 'Usuário',
            avatar: data.avatar_usuario || '/avatar1.png'
          });
        } else {
          // No data found, use fallback
          setUserData({
            name: user.email?.split('@')[0] || 'Usuário',
            avatar: '/avatar1.png'
          });
        }
      } catch (error) {
        console.error('Exception loading user data for header:', error);
        setUserData({
          name: user.email?.split('@')[0] || 'Usuário',
          avatar: '/avatar1.png'
        });
      }
    };

    loadUserData();
  }, [user?.id]);

  // Check for login parameter in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('login') === 'true') {
      setShowLoginModal(true);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
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
        console.log('🔍 Searching for:', searchQuery);
        
        // Add timeout to prevent hanging search requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Search timeout')), 10000);
        });
        
        const allVideos = await Promise.race([
          videoService.getVideos({ limit: 100 }),
          timeoutPromise
        ]) as Video[];
        
        console.log('📊 Loaded videos for search:', allVideos.length);
        
        const query = searchQuery.toLowerCase();
        const filtered = allVideos.filter(video => {
          const titleMatch = video.title.toLowerCase().includes(query);
          const descriptionMatch = video.description?.toLowerCase().includes(query) || false;
          const summaryMatch = video.summary?.toLowerCase().includes(query) || false;
          const categoryMatch = video.category?.name.toLowerCase().includes(query) || false;
          const instructorMatch = video.instructor?.name.toLowerCase().includes(query) || false;
          
          return titleMatch || descriptionMatch || summaryMatch || categoryMatch || instructorMatch;
        });

        console.log('🎯 Filtered results:', filtered.length);

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
        if (error.message === 'Search timeout') {
          console.warn('Search timed out, showing empty results');
        }
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(searchVideos, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleLogout = async () => {
    console.log('🚪 Header: Logout button clicked');
    setShowUserMenu(false);
    
    try {
      console.log('🔄 Header: Calling signOut...');
      const result = await signOut();
      
      if (result.error) {
        console.error('❌ Header: Logout error:', result.error);
      } else {
        console.log('✅ Header: Logout successful');
      }
      
      // Force page reload to ensure clean state
      console.log('🔄 Header: Forcing page reload...');
      window.location.href = '/';
    } catch (error) {
      console.error('💥 Header: Logout exception:', error);
      // Force redirect even on error
      window.location.href = '/';
    }
  };

  const handleProfileClick = () => {
    if (onViewChange) {
      onViewChange('profile');
    }
    setShowUserMenu(false);
  };

  const handleBookmarksClick = () => {
    if (onViewChange) {
      onViewChange('bookmark');
    }
    setShowUserMenu(false);
  };

  const handleHelpClick = () => {
    if (onViewChange) {
      onViewChange('help');
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
              onClick={() => returnToVideo()}
              className="text-white hover:text-black transition-colors font-medium"
            >
              Voltar ao vídeo
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
                  className="w-[28rem] md:w-[40rem] focus:w-[32rem] md:focus:w-[56rem] pl-12 pr-12 py-4 text-lg bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all duration-300"
                />
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 mt-2 w-[32rem] md:w-[56rem] bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-[99999] max-h-[28rem] overflow-y-auto">
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
                  ) : (
                    <div className="p-6 text-center">
                      <div className="text-slate-400 text-base">Nenhum resultado encontrado</div>
                    </div>
                  )}
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
                  <div className="hidden sm:block text-right pl-3">
                    <div className="text-white font-medium text-base group-hover:text-[#ff7551] transition-colors">
                      {userData?.name || user?.email?.split('@')[0] || 'Usuário'}
                    </div>
                  </div>
                  <div className="relative">
                    <img
                      src={userData?.avatar || '/avatar1.png'}
                      alt={userData?.name || 'User'}
                     className="w-12 h-12 rounded-xl object-cover"
                    />
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
                      
                      <button
                        onClick={handleBookmarksClick}
                        className="flex items-center space-x-3 w-full px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/30 transition-colors"
                      >
                        <Bookmark className="w-5 h-5" />
                        <span className="text-base">Salvos</span>
                      </button>
                      
                      <button
                        onClick={handleHelpClick}
                        className="flex items-center space-x-3 w-full px-5 py-3 text-slate-300 hover:text-white hover:bg-slate-700/30 transition-colors"
                      >
                        <HelpCircle className="w-5 h-5" />
                        <span className="text-base">Ajuda</span>
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
                  onClick={() => setShowPaywall(true)}
                  className="flex items-center space-x-2 px-4 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors text-base"
                >
                  <UserPlus className="w-5 h-5" />
                  <span className="hidden sm:inline">Fazer Parte</span>
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

      <PaywallModal
        isOpen={showPaywall}
        onClose={() => setShowPaywall(false)}
        contentTitle="Acesso à Plataforma"
        contentType="video"
      />
    </>
  );
};

export default Header;