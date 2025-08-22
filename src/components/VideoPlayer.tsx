import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Bookmark, ThumbsUp, Users, Send, Download, ExternalLink, FileText, MessageCircle, Phone, Instagram, BarChart3, Clock, ChevronDown } from 'lucide-react';
import { videoService, type Video } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import CustomVideoPlayer from './CustomVideoPlayer';

// Component for suggested videos
const SuggestedVideos: React.FC<{ currentVideo: Video }> = ({ currentVideo }) => {
  const { user } = useAuth();
  const [suggestedVideos, setSuggestedVideos] = useState<Video[]>([]);
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
    const loadSuggestedVideos = async () => {
      if (!currentVideo.category?.slug) {
        setLoading(false);
        return;
      }

      try {
        // Get videos from the same category, excluding the current video
        const videos = await videoService.getVideosByCategory(
          currentVideo.category.slug, 
          6, 
          user?.id
        );
        
        // Filter out the current video
        const filtered = videos.filter(v => v.id !== currentVideo.id);
        setSuggestedVideos(filtered.slice(0, 5));
      } catch (error) {
        console.error('Error loading suggested videos:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestedVideos();
  }, [currentVideo.id, currentVideo.category?.slug, user?.id]);

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

  if (suggestedVideos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 text-sm">Nenhuma sugestão disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestedVideos.map((suggestion, index) => (
        <div key={suggestion.id} className="flex space-x-4 cursor-pointer group p-2 rounded-lg hover:bg-slate-700/20 transition-colors">
          <div className="relative flex-shrink-0">
            <img
              src={suggestion.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=100&h=150&fit=crop'}
              alt={suggestion.title}
              className="w-16 h-24 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
            />
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
              <span>{formatDuration(suggestion.duration_minutes)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onBack }) => {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Video | null>(null);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  const handleVersionChange = async (version: Video) => {
    setSelectedVersion(version);
    setShowVersionDropdown(false);
    
    // Update video data with selected version
    setVideoData(version);
    
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
    const loadVideoData = async () => {
      console.log('Loading video data for:', video.title, 'Slug:', video.slug);
      
      if (video.slug && video.slug.trim() !== '') {
        const fullVideo = await videoService.getVideoBySlug(video.slug, user?.id);
        console.log('Loaded full video data:', fullVideo);
        if (fullVideo) {
          setVideoData(fullVideo);
          setLiked(fullVideo.is_upvoted || false);
          setSaved(fullVideo.is_bookmarked || false);
        } else {
          console.log('No video found for slug, using passed video data');
          setVideoData(video);
          // Check bookmark and like status for the passed video
          if (user) {
            const [isBookmarked, isUpvoted] = await Promise.all([
              videoService.isBookmarked(video.id, user.id),
              videoService.isUpvoted(video.id, user.id)
            ]);
            setSaved(isBookmarked);
            setLiked(isUpvoted);
          }
        }
      } else {
        console.log('No slug provided, using passed video data');
        setVideoData(video);
        // Check bookmark and like status for the passed video
        if (user) {
          const [isBookmarked, isUpvoted] = await Promise.all([
            videoService.isBookmarked(video.id, user.id),
            videoService.isUpvoted(video.id, user.id)
          ]);
          setSaved(isBookmarked);
          setLiked(isUpvoted);
        }
      }
      setLoading(false);
    };

    loadVideoData();
  }, [video.id, video.timestamp, user?.id]);

  const handleToggleLike = async () => {
    if (!user || !currentVideo || likeLoading) return;
    
    setLikeLoading(true);
    
    try {
      const success = await videoService.toggleUpvote(currentVideo.id, user.id);
      if (success) {
        setLiked(!liked);
        // Update local count
        const updateCount = (prev: Video | null) => prev ? {
          ...prev,
          upvote_count: liked ? prev.upvote_count - 1 : prev.upvote_count + 1
        } : null;
        
        setVideoData(updateCount);
        if (selectedVersion) {
          setSelectedVersion(updateCount);
        }
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user || !currentVideo || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    
    try {
      const result = await videoService.toggleBookmarkOptimized(currentVideo.id, user.id);
      if (result.success) {
        setSaved(result.isBookmarked);
        console.log('Updated video player bookmark status to:', result.isBookmarked);
      } else {
        console.error('Failed to toggle bookmark in video player:', result);
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
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400">Carregando vídeo...</div>
      </div>
    );
  }

  const currentVideo = selectedVersion || videoData || video;
  
  // Check if video has versions - use videoData (the full loaded data) to check for versions
  const hasVersions = (videoData?.versions && videoData.versions.length > 1) || 
                     (videoData?.parent_video_id !== null);

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Video Section */}
      <div className="flex-1 flex flex-col p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* Video Player */}
        <div className="relative bg-black rounded-lg overflow-hidden mb-8 aspect-video">
          <CustomVideoPlayer
            src={currentVideo.video_url || ""}
            poster={currentVideo.thumbnail_url}
            title={currentVideo.title}
            video={currentVideo}
            onTimeUpdate={(currentTime, duration) => {
              // Track video progress if needed
              console.log('Video progress:', { currentTime, duration });
            }}
            onEnded={() => {
              // Handle video end if needed
              console.log('Video ended');
            }}
          />
        </div>

        {/* Video Info */}
        <div className="space-y-6">
          <h1 className="text-2xl font-bold text-white leading-tight">
            {currentVideo.title}
          </h1>

          {/* Creator Info & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={currentVideo.instructor?.avatar_url || '/src/images/avatar.jpg'}
                alt={currentVideo.instructor?.name || 'Instrutor'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-semibold text-lg">{currentVideo.instructor?.name || 'Instrutor'}</span>
                </div>
                <div className="flex items-center mt-0.5 -ml-1">
                  {currentVideo.instructor?.social_instagram && (
                    <a 
                      href={`https://instagram.com/${currentVideo.instructor.social_instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#ff7551] text-xs transition-colors"
                    >
                      @{currentVideo.instructor.social_instagram}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Video Info */}
              <div className="flex items-center space-x-4 text-slate-300 text-xs mr-4">
                {currentVideo.difficulty_level && (
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <span>{currentVideo.difficulty_level.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>{formatDuration(currentVideo.duration_minutes)}</span>
                </div>
              </div>
              
              {/* Version Selector */}
              {hasVersions && (
                <div className="relative">
                  <button
                    onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                    className="flex items-center space-x-2 px-4 py-3 bg-slate-700/30 hover:bg-slate-600/30 text-slate-300 hover:text-white rounded-lg transition-colors border border-slate-600/30 h-12"
                  >
                    <span className="text-sm font-medium">
                      Outras versões
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showVersionDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {showVersionDropdown && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {videoData?.versions?.map((version) => (
                          <button
                            key={version.id}
                            onClick={() => handleVersionChange(version)}
                            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                              currentVideo.id === version.id
                                ? 'bg-[#ff7551] text-white'
                                : 'text-slate-300 hover:bg-slate-700/30'
                            }`}
                          >
                            <div className="font-medium">{version.version_name}</div>
                            <div className="text-xs opacity-75 mt-1">
                              {formatDuration(version.duration_minutes)} • {formatViews(version.view_count)} views
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Like Button */}
              <button
                onClick={handleToggleLike}
                disabled={!user || likeLoading}
                className={`group flex items-center justify-center hover:justify-start rounded-lg transition-all duration-300 overflow-hidden cursor-pointer disabled:cursor-not-allowed ${
                  liked ? 'bg-[#ff7551] text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                } ${likeLoading ? 'animate-pulse' : ''} w-12 h-12 hover:w-auto hover:pl-4 hover:pr-4`}
              >
                <ThumbsUp className="w-5 h-5 flex-shrink-0 group-hover:ml-0 ml-0.5" />
                <span className="ml-2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-0 group-hover:max-w-xs overflow-hidden">
                  {liked ? 'Curtido' : 'Curtir'}
                </span>
              </button>
              
              {/* Save Button */}
              <button 
                onClick={handleToggleSave}
                disabled={!user || bookmarkLoading}
                className={`group flex items-center justify-center hover:justify-start rounded-lg transition-all duration-300 overflow-hidden cursor-pointer disabled:cursor-not-allowed ${
                  saved ? 'bg-white text-black shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                } ${bookmarkLoading ? 'animate-pulse' : ''} w-12 h-12 hover:w-auto hover:pl-4 hover:pr-4`}
              >
                <Bookmark className="w-5 h-5 flex-shrink-0 group-hover:ml-0 ml-0.5" fill={saved ? 'currentColor' : 'none'} />
                <span className="ml-2 text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 max-w-0 group-hover:max-w-xs overflow-hidden">
                  {saved ? 'Salvo' : 'Salvar'}
                </span>
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="bg-slate-700/30 rounded-lg p-8">
            <div className="text-slate-300 text-sm leading-relaxed">
              {currentVideo.summary && (
                <p className="mb-4 font-medium text-white">{currentVideo.summary}</p>
              )}
              {currentVideo.description && (
                <div className="mb-4">
                  {currentVideo.description.split('\n').map((paragraph, index) => (
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
                <button className="flex items-center justify-center space-x-3 px-6 py-3.5 bg-gradient-to-r from-[#ff7551] to-[#ff7551]/80 hover:from-[#ff7551]/90 hover:to-[#ff7551]/70 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] shadow-lg hover:shadow-xl">
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
        </div>
      </div>


      {/* Materials Section */}
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
              Materiais
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
              <h3 className="text-white font-semibold mb-6">Materiais e links</h3>
              
              {/* Downloads */}
              {currentVideo.materials && currentVideo.materials.length > 0 ? (
                <div className="space-y-4">
                  {currentVideo.materials
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((material) => {
                      const IconComponent = material.icon === 'Download' ? Download : 
                                          material.icon === 'ExternalLink' ? ExternalLink : FileText;
                      
                      return (
                        <a
                          key={material.id}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-lg hover:bg-slate-600/30 transition-colors cursor-pointer"
                        >
                          <IconComponent className="w-5 h-5 text-[#ff7551]" />
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{material.title}</div>
                          </div>
                        </a>
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum material disponível para este vídeo.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6" key={currentVideo.id}>
              <h3 className="text-white font-semibold mb-6">Sugestões de Aulas</h3>
              
              <SuggestedVideos currentVideo={currentVideo} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;