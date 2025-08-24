import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Bookmark, ThumbsUp, Users, Calendar, Clock, ExternalLink, BarChart3, MessageCircle, Phone, Instagram, Download, FileText } from 'lucide-react';
import { videoService, type Video } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

// Component for suggested lives
const SuggestedLives: React.FC<{ currentLive: Video }> = ({ currentLive }) => {
  const { user } = useAuth();
  const [suggestedLives, setSuggestedLives] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  useEffect(() => {
    const loadSuggestedLives = async () => {
      if (!currentLive.category?.slug) {
        setLoading(false);
        return;
      }

      try {
        // Get lives from the same category, excluding the current live
        const allVideos = await videoService.getVideosByCategory(
          currentLive.category.slug, 
          10, 
          user?.id
        );
        
        // Filter for lives only and exclude current live
        const lives = allVideos.filter(v => v.tipo === 'live' && v.id !== currentLive.id);
        setSuggestedLives(lives.slice(0, 5));
      } catch (error) {
        console.error('Error loading suggested lives:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestedLives();
  }, [currentLive.id, currentLive.category?.slug, user?.id]);

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="flex space-x-4 p-2">
            <div className="w-16 h-12 bg-slate-700/30 rounded-lg animate-pulse"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-700/30 rounded animate-pulse"></div>
              <div className="h-3 bg-slate-700/20 rounded w-2/3 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (suggestedLives.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 text-sm">Nenhuma sugestão disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestedLives.map((suggestion, index) => (
        <div key={suggestion.id} className="flex space-x-4 cursor-pointer group p-2 rounded-lg hover:bg-slate-700/20 transition-colors">
          <div className="relative flex-shrink-0">
            <img
              src={suggestion.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=100&h=150&fit=crop'}
              alt={suggestion.title}
              className="w-16 h-24 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
              LIVE
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#ff7551] transition-colors">
              {suggestion.title}
            </h5>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
              {suggestion.category && (
                <span>{suggestion.category.name}</span>
              )}
              {suggestion.category && (
                <span>•</span>
              )}
              <span>Live</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Countdown component
const Countdown: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="bg-slate-700/30 rounded-lg p-8 text-center">
      <h3 className="text-white font-semibold text-xl mb-6">Live começa em:</h3>
      
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-[#ff7551]">{timeLeft.days}</div>
          <div className="text-slate-400 text-sm">Dias</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-[#ff7551]">{timeLeft.hours}</div>
          <div className="text-slate-400 text-sm">Horas</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-[#ff7551]">{timeLeft.minutes}</div>
          <div className="text-slate-400 text-sm">Min</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-4">
          <div className="text-3xl font-bold text-[#ff7551]">{timeLeft.seconds}</div>
          <div className="text-slate-400 text-sm">Seg</div>
        </div>
      </div>
    </div>
  );
};

// YouTube embed component
const YouTubeEmbed: React.FC<{ url: string; title: string }> = ({ url, title }) => {
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = getYouTubeId(url);

  if (!videoId) {
    return (
      <div className="aspect-video bg-slate-700 rounded-lg flex items-center justify-center">
        <p className="text-slate-400">URL do YouTube inválida</p>
      </div>
    );
  }

  return (
    <div className="aspect-video bg-black rounded-lg overflow-hidden">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&autoplay=0&controls=1`}
        title={title}
        className="w-full h-full"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

interface LiveViewerProps {
  live: Video;
  onBack: () => void;
}

const LiveViewer: React.FC<LiveViewerProps> = ({ live, onBack }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [liveData, setLiveData] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Video | null>(null);

  const handleVersionChange = async (version: Video) => {
    setSelectedVersion(version);
    
    // Update live data with selected version
    setLiveData(version);
    
    // Update bookmark and like status for the selected version
    if (user) {
      const [isBookmarked, isUpvoted] = await Promise.all([
        videoService.isBookmarked(version.id, user.id),
        videoService.isUpvoted(version.id, user.id)
      ]);
      setSaved(isBookmarked);
      setLiked(isUpvoted);
    }
  };

  useEffect(() => {
    const currentLive = selectedVersion || live;
    const currentLiveSlug = currentLive.slug;

    const loadLiveData = async () => {
      console.log('LiveViewer: Starting loadLiveData for live:', currentLive.title, 'ID:', currentLive.id, 'Slug:', currentLive.slug);
      
      let currentLiveData = currentLive;
      
      // Try to load full live data if we have a slug
      if (currentLiveSlug && currentLiveSlug.trim() !== '') {
        console.log('LiveViewer: Loading full live data by slug:', currentLiveSlug);
        const fullLive = await videoService.getVideoBySlug(currentLiveSlug, user?.id);
        if (fullLive) {
          console.log('LiveViewer: Successfully loaded full live data');
          currentLiveData = fullLive;
        } else {
          console.log('LiveViewer: No live found for slug, using current live data');
        }
      } else {
        console.log('LiveViewer: No slug provided, using current live data');
      }
      
      // Set initial live data
      setLiveData(currentLiveData);
      
      // Load versions for this live
      console.log('LiveViewer: Loading versions for live ID:', currentLiveData.id, 'and slug:', currentLiveData.slug);
      const versionResult = await videoService.getVideoVersions(currentLiveData.id, user?.id);
      console.log('LiveViewer: Received versions from service:', versionResult.versions.length, 'versions');
      
      // Update live data with versions
      const updatedLiveData = { ...currentLiveData, versions: versionResult.versions };
      setLiveData(updatedLiveData);
      console.log('LiveViewer: Updated liveData with versions:', updatedLiveData.versions?.length || 0);
      
      // Set bookmark and like status
      if (user) {
        const [isBookmarked, isUpvoted] = await Promise.all([
          videoService.isBookmarked(currentLiveData.id, user.id),
          videoService.isUpvoted(currentLiveData.id, user.id)
        ]);
        setSaved(isBookmarked);
        setLiked(isUpvoted);
        console.log('LiveViewer: Set bookmark/like status - saved:', isBookmarked, 'liked:', isUpvoted);
      }
      
      // Record live view when live is loaded
      if (currentLiveData.id) {
        console.log('LiveViewer: Recording view for live:', currentLiveData.id);
        const viewRecorded = await videoService.recordView(currentLiveData.id, user?.id);
        
        if (viewRecorded) {
          // Get fresh counts from database after recording view
          setTimeout(async () => {
            const freshCounts = await videoService.refreshVideoCounts(currentLiveData.id);
            if (freshCounts) {
              setLiveData(prev => prev ? {
                ...prev,
                view_count: freshCounts.view_count,
                upvote_count: freshCounts.upvote_count
              } : null);
            }
          }, 500); // Small delay to ensure trigger has executed
        }
      }
      
      setLoading(false);
      console.log('LiveViewer: Finished loading live data');
    };

    loadLiveData();
  }, [selectedVersion?.id, selectedVersion?.slug, live.id, live.slug, user?.id]);

  const handleToggleLike = async () => {
    if (!user || !currentLive || likeLoading) return;
    
    setLikeLoading(true);
    
    try {
      const success = await videoService.toggleUpvote(currentLive.id, user.id);
      if (success) {
        const newLikedState = !liked;
        setLiked(newLikedState);
        
        // Get fresh counts from database after toggle
        setTimeout(async () => {
          const freshCounts = await videoService.refreshVideoCounts(currentLive.id);
          if (freshCounts) {
            const updateCount = (prev: Video | null) => prev ? {
              ...prev,
              upvote_count: freshCounts.upvote_count
            } : null;
            
            setLiveData(updateCount);
            if (selectedVersion) {
              setSelectedVersion(updateCount);
            }
          }
        }, 300); // Small delay to ensure trigger has executed
        }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user || !currentLive || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    
    try {
      const result = await videoService.toggleBookmarkOptimized(currentLive.id, user.id);
      if (result.success) {
        setSaved(result.isBookmarked);
        console.log('Updated live viewer bookmark status to:', result.isBookmarked);
      } else {
        console.error('Failed to toggle bookmark in live viewer:', result);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400">Carregando live...</div>
      </div>
    );
  }

  const currentLive = selectedVersion || liveData || live;
  
  // Check if live date is in the future
  const liveDate = currentLive.data_live ? new Date(currentLive.data_live) : null;
  const isUpcoming = liveDate && liveDate > new Date();
  
  // Always show versions dropdown - check if there are any versions loaded
  const hasVersions = true; // Always show the dropdown
  const versionsToShow = liveData?.versions || [];
  
  // Check if it's a YouTube URL
  const isYouTubeUrl = currentLive.video_url && (
    currentLive.video_url.includes('youtube.com') || 
    currentLive.video_url.includes('youtu.be')
  );

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Live Section */}
      <div className="flex-1 flex flex-col p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* Live Player */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-8 aspect-video">
          {isYouTubeUrl ? (
            <YouTubeEmbed url={currentLive.video_url!} title={currentLive.title} />
          ) : currentLive.video_url ? (
            <video
              src={currentLive.video_url}
              poster={currentLive.thumbnail_url}
              controls
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <div className="text-center">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-10 h-10 text-white" />
                </div>
                <p className="text-white text-lg font-medium">Live em breve</p>
                <p className="text-slate-400">Aguarde a transmissão começar</p>
              </div>
            </div>
          )}
        </div>

        {/* Live Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white leading-tight">
            {currentLive.title}
          </h1>

          {/* Separator */}
          <div className="w-full h-px bg-slate-600/30"></div>

          {/* Creator Info & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 pl-[5px]">
              <img
                src={currentLive.instructor?.avatar_url || '/src/images/avatar.jpg'}
                alt={currentLive.instructor?.name || 'Instrutor'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-semibold text-lg">{currentLive.instructor?.name || 'Instrutor'}</span>
                </div>
                <div className="flex items-center mt-0.5 pl-[3px]">
                  {currentLive.instructor?.social_instagram && (
                    <a 
                      href={`https://instagram.com/${currentLive.instructor.social_instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#ff7551] text-xs transition-colors"
                    >
                      @{currentLive.instructor.social_instagram}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Live Info */}
              <div className="flex items-center space-x-4 text-slate-300 text-xs mr-4">
                {currentLive.difficulty_level && (
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <span>{currentLive.difficulty_level.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>LIVE</span>
                </div>
              </div>
              
              {/* Like Button */}
              <button
                onClick={handleToggleLike}
                disabled={!user || likeLoading}
                className={`group flex items-center justify-center hover:justify-start rounded-lg transition-all duration-300 overflow-hidden cursor-pointer disabled:cursor-not-allowed mr-1 hover:mr-0 ${
                  liked ? 'bg-[#ff7551] text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                } ${likeLoading ? 'animate-pulse' : ''} w-12 h-12 hover:w-auto hover:pl-4 hover:pr-4`}
              >
                <ThumbsUp className="w-5 h-5 flex-shrink-0 group-hover:ml-0 ml-0.5" />
                <span className="ml-2 text-sm font-medium whitespace-nowrap hidden group-hover:block">
                  {liked ? 'Curtido' : 'Curtir'}
                </span>
              </button>
              
              {/* Save Button */}
              <button 
                onClick={handleToggleSave}
                disabled={!user || bookmarkLoading}
                className={`group flex items-center justify-center hover:justify-start rounded-lg transition-all duration-300 overflow-hidden cursor-pointer disabled:cursor-not-allowed mr-1 hover:mr-0 ${
                  saved ? 'bg-[#ff7551] text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                } ${bookmarkLoading ? 'animate-pulse' : ''} w-12 h-12 hover:w-auto hover:pl-4 hover:pr-4`}
              >
                <Bookmark className="w-5 h-5 flex-shrink-0 group-hover:ml-0 mt-0 ml-0" fill="none" stroke="currentColor" />
                <span className="ml-2 text-sm font-medium whitespace-nowrap hidden group-hover:block">
                  {saved ? 'Salvo' : 'Salvar'}
                </span>
              </button>
            </div>
          </div>

          {/* Live Date */}
          {liveDate && !isUpcoming && (
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-slate-300">
                <Calendar className="w-5 h-5 text-[#ff7551]" />
                <span className="font-medium">Transmitido em:</span>
                <span>{formatDate(currentLive.data_live!)}</span>
              </div>
            </div>
          )}

          {/* Upcoming Live Countdown */}
          {isUpcoming ? (
            <div className="space-y-6">
              <Countdown targetDate={liveDate!} />
              
              {/* YouTube Link for upcoming live */}
              {isYouTubeUrl && (
                <div className="text-center">
                  <a
                    href={currentLive.video_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>Assistir no YouTube</span>
                  </a>
                </div>
              )}
            </div>
          ) : (
            /* Description - Only show if not upcoming */
            <div className="bg-slate-700/30 rounded-lg p-8">
              <div className="text-slate-300 text-sm leading-relaxed">
                {currentLive.summary && (
                  <p className="mb-4 font-medium text-white">{currentLive.summary}</p>
                )}
                {currentLive.description && (
                  <div className="mb-4">
                    {currentLive.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-2">{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {/* Questions Subtitle */}
                <h4 className="text-white font-medium mt-6 pt-4 border-t border-slate-600/30">
                  Dúvidas?
                </h4>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button className="flex items-center justify-center space-x-3 px-6 py-3.5 bg-slate-700/40 hover:bg-slate-600/50 border border-slate-600/30 hover:border-slate-500/50 text-slate-300 hover:text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                    <MessageCircle className="w-4 h-4" />
                    <span>Perguntar para IA</span>
                  </button>
                  
                  <button className="flex items-center justify-center space-x-3 px-6 py-3.5 bg-slate-700/40 hover:bg-slate-600/50 border border-slate-600/30 hover:border-slate-500/50 text-slate-300 hover:text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
                    <Phone className="w-4 h-4" />
                    <span>Perguntar no WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Materials Section - Only show if there are materials or versions */}
      {((currentLive.materials && currentLive.materials.length > 0) || (currentLive.ferramentas && currentLive.ferramentas.length > 0) || versionsToShow.length > 0) && (
        <div className="w-full lg:w-96 border-l border-slate-700/30 flex flex-col">
          {/* Tab Header */}
          <div className="p-6 border-b border-slate-700/30">
            <div className="flex space-x-6">
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'materials'
                    ? 'bg-[#ff7551] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Links
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'suggestions'
                    ? 'bg-[#ff7551] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sugestões
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'materials' ? (
              <div className="space-y-6">
                {/* Materials - Only show if there are materials */}
                {currentLive.materials && currentLive.materials.length > 0 && (
                  <div>
                    <h3 className="text-white font-semibold mb-6">Materiais e downloads</h3>
                    
                    <div className="space-y-4">
                      {currentLive.materials
                        .sort((a, b) => a.order_index - b.order_index)
                        .map((material) => (
                          <a
                            key={material.id}
                            href={material.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-3 px-3 py-4 bg-slate-700/30 rounded-lg hover:bg-slate-600/30 transition-colors cursor-pointer"
                          >
                            <Download className="w-5 h-5 text-slate-400" />
                            <div className="flex-1">
                              <div className="text-white font-medium text-sm">{material.title}</div>
                              {material.description && (
                                <div className="text-slate-400 text-xs mt-1">{material.description}</div>
                              )}
                              {material.file_size_mb && (
                                <div className="text-slate-500 text-xs mt-1">{material.file_size_mb}MB</div>
                              )}
                            </div>
                          </a>
                        ))}
                    </div>
                  </div>
                )}
                
                {/* Ferramentas Section - Only show if there are tools */}
                {currentLive.ferramentas && currentLive.ferramentas.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-white font-semibold mb-6">Ferramentas usadas</h3>
                    
                    <div className="flex flex-wrap gap-3">
                      {currentLive.ferramentas.map((ferramenta) => {
                        return (
                          <a
                            key={ferramenta.id}
                            href={ferramenta.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block hover:scale-110 transition-transform duration-200"
                            title={ferramenta.nome}
                          >
                            <img 
                              src={ferramenta.icone} 
                              alt={ferramenta.nome}
                              className="w-10 h-10 object-contain rounded"
                              onError={(e) => {
                                // Fallback to ExternalLink icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'block';
                              }}
                            />
                            <ExternalLink className="w-10 h-10 text-slate-400 hidden rounded" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
               
                {/* Version Selector - Only show if there are versions */}
                {versionsToShow.length > 0 && (
                  <div className="mt-12">
                    <h3 className="text-white font-semibold mb-4">Outras versões</h3>
                    
                    <div className="space-y-2">
                      {versionsToShow.map((version) => (
                        <button
                          key={version.id}
                          onClick={() => handleVersionChange(version)}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            currentLive.id === version.id
                              ? 'bg-[#ff7551] text-white'
                              : 'bg-slate-700/30 text-slate-300 hover:bg-slate-600/30'
                          }`}
                        >
                          <div className="font-medium text-sm">
                            {(version as any).version_name || version.title}
                            {(version as any).is_main_version && (
                              <span className="ml-2 text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded">
                                Original
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            Live • {formatViews(version.view_count)} views
                          </div>
                        </button>
                      ))}
                    </div>
                   </div>
                )}
              </div>
            ) : (
              <div className="space-y-6" key={currentLive.id}>
                <h3 className="text-white font-semibold mb-6">Lives Relacionadas</h3>
                
                <SuggestedLives currentLive={currentLive} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Suggested Lives - Always show as separate section if no materials */}
      {!((currentLive.materials && currentLive.materials.length > 0) || (currentLive.ferramentas && currentLive.ferramentas.length > 0) || versionsToShow.length > 0) && (
        <div className="w-full lg:w-96 border-l border-slate-700/30 flex flex-col">
          {/* Tab Header */}
          <div className="p-6 border-b border-slate-700/30">
            <h3 className="text-white font-semibold">Lives Relacionadas</h3>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6" key={currentLive.id}>
              <SuggestedLives currentLive={currentLive} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveViewer;