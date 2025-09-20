import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Bookmark, ThumbsUp, Users, Send, Download, ExternalLink, FileText, MessageCircle, Phone, Instagram, BarChart3, Clock, ChevronDown, AlertTriangle, Play } from 'lucide-react';
import { videoService, type Video } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import CustomVideoPlayer from './CustomVideoPlayer';
import CommentsSection from './CommentsSection';
import PaywallModal from './PaywallModal';
import ReportModal from './ReportModal';

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
              src={suggestion.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=120&h=180&fit=crop'}
              alt={suggestion.title}
              className="w-16 h-24 rounded-lg object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-white text-base font-medium line-clamp-2 group-hover:text-[#ff7551] transition-colors">
              {suggestion.title}
            </h5>
            <div className="flex items-center space-x-2 text-xs text-slate-400 mt-1">
              {suggestion.category && (
                <span>{suggestion.category.name}</span>
              )}
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
  onVideoSelect: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onBack, onVideoSelect }) => {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [videoData, setVideoData] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Video | null>(null);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [relatedVideos, setRelatedVideos] = useState<Video[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);

  // Check if user should see paywall
  useEffect(() => {
    if (!user) {
      setShowPaywall(true);
      return;
    }
    setShowPaywall(false);
  }, [user]);

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
    const currentVideo = selectedVersion || video;
    const currentVideoSlug = currentVideo.slug;

    const loadVideoData = async () => {
      console.log('VideoPlayer: Starting loadVideoData for video:', currentVideo.title, 'ID:', currentVideo.id, 'Slug:', currentVideo.slug);
      
      let currentVideoData = currentVideo;
      
      // Try to load full video data if we have a slug
      if (currentVideoSlug && currentVideoSlug.trim() !== '') {
        console.log('VideoPlayer: Loading full video data by slug:', currentVideoSlug);
        const fullVideo = await videoService.getVideoBySlug(currentVideoSlug, user?.id);
        if (fullVideo) {
          console.log('VideoPlayer: Successfully loaded full video data');
          currentVideoData = fullVideo;
        } else {
          console.log('VideoPlayer: No video found for slug, using current video data');
        }
      } else {
        console.log('VideoPlayer: No slug provided, using current video data');
      }
      
      // Set initial video data
      setVideoData(currentVideoData);
      
      // Load versions for this video
      console.log('VideoPlayer: Loading versions for video ID:', currentVideoData.id, 'and slug:', currentVideoData.slug);
      const versionResult = await videoService.getVideoVersions(currentVideoData.id, user?.id);
      console.log('VideoPlayer: Received versions from service:', versionResult.versions.length, 'versions');
      
      // Update video data with versions
      const updatedVideoData = { ...currentVideoData, versions: versionResult.versions };
      setVideoData(updatedVideoData);
      console.log('VideoPlayer: Updated videoData with versions:', updatedVideoData.versions?.length || 0);
      
      // Load related videos
      setLoadingRelated(true);
      try {
        const relatedData = await videoService.getRelatedVideos(currentVideoData.id, user?.id);
        setRelatedVideos(relatedData);
        console.log('VideoPlayer: Loaded related videos:', relatedData.length);
      } catch (error) {
        console.error('VideoPlayer: Error loading related videos:', error);
        setRelatedVideos([]);
      } finally {
        setLoadingRelated(false);
      }
      
      // Set bookmark and like status
      if (user) {
        const [isBookmarked, isUpvoted] = await Promise.all([
          videoService.isBookmarked(currentVideoData.id, user.id),
          videoService.isUpvoted(currentVideoData.id, user.id)
        ]);
        setSaved(isBookmarked);
        setLiked(isUpvoted);
        console.log('VideoPlayer: Set bookmark/like status - saved:', isBookmarked, 'liked:', isUpvoted);
      }
      
      // Record video view when video is loaded
      if (currentVideoData.id) {
        console.log('VideoPlayer: Recording view for video:', currentVideoData.id);
        const viewRecorded = await videoService.recordView(currentVideoData.id, user?.id);
        
        if (viewRecorded) {
          // Get fresh counts from database after recording view
          setTimeout(async () => {
            const freshCounts = await videoService.refreshVideoCounts(currentVideoData.id);
            if (freshCounts) {
              setVideoData(prev => prev ? {
                ...prev,
                view_count: freshCounts.view_count,
                upvote_count: freshCounts.upvote_count
              } : null);
            }
          }, 500); // Small delay to ensure trigger has executed
        }
      }
      
      setLoading(false);
      console.log('VideoPlayer: Finished loading video data');
    };

    loadVideoData();
  }, [selectedVersion?.id, selectedVersion?.slug, video.id, video.slug, user?.id]);

  const handleToggleLike = async () => {
    if (!user || !currentVideo || likeLoading) return;
    
    setLikeLoading(true);
    
    try {
      const success = await videoService.toggleUpvote(currentVideo.id, user.id);
      if (success) {
        const newLikedState = !liked;
        setLiked(newLikedState);
        
        // Get fresh counts from database after toggle
        setTimeout(async () => {
          const freshCounts = await videoService.refreshVideoCounts(currentVideo.id);
          if (freshCounts) {
            const updateCount = (prev: Video | null) => prev ? {
              ...prev,
              upvote_count: freshCounts.upvote_count
            } : null;
            
            setVideoData(updateCount);
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
  
  // Always show versions dropdown - check if there are any versions loaded
  const hasVersions = true; // Always show the dropdown
  const versionsToShow = videoData?.versions || [];
  
  console.log('VideoPlayer: versions check:', {
    hasVersions,
    versionsCount: versionsToShow.length,
    videoDataId: videoData?.id,
    currentVideoId: currentVideo?.id
  });

  // Show paywall if user is not authenticated
  if (showPaywall) {
    return (
      <>
        <PaywallModal
          isOpen={showPaywall}
          onClose={onBack}
          contentTitle={currentVideo.title}
          contentType="video"
        />
      </>
    );
  }

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
          <h1 className="text-3xl font-bold text-white leading-tight">
            {currentVideo.title}
          </h1>

          {/* Separator */}
          <div className="w-full h-px bg-slate-600/30"></div>

          {/* Creator Info & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 pl-[5px]">
              <div className="relative">
                <img
                  src={currentVideo.instructor?.avatar_url || '/avatar1.png'}
                  alt={currentVideo.instructor?.name || 'Instrutor'}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#ff7551] rounded-full flex items-center justify-center border-2 border-[#1f1d2b]">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-semibold text-xl" style={{ marginBottom: '-3px' }}>{currentVideo.instructor?.name || 'Instrutor'}</span>
                </div>
                <div className="flex items-center mt-0">
                  {currentVideo.instructor?.social_instagram && (
                    <a 
                      href={`https://instagram.com/${currentVideo.instructor.social_instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#ff7551] hover:text-[#ff7551]/80 text-xs transition-colors"
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
              
              {/* Version Selector - Always show */}

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
              
              {/* Report Button */}
              <button 
                onClick={() => setShowReportModal(true)}
                disabled={!user}
                className="group flex items-center justify-center hover:justify-start rounded-lg transition-all duration-300 overflow-hidden cursor-pointer disabled:cursor-not-allowed mr-1 hover:mr-0 bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50 w-12 h-12 hover:w-auto hover:pl-4 hover:pr-4"
              >
                <AlertTriangle className="w-5 h-5 flex-shrink-0 group-hover:ml-0 mt-0 ml-0" />
                <span className="ml-2 text-sm font-medium whitespace-nowrap hidden group-hover:block">
                  Reportar
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
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentsSection 
              videoId={currentVideo.id} 
              videoTitle={currentVideo.title} 
            />
          </div>
        </div>
      </div>

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        videoId={currentVideo.id}
        videoTitle={currentVideo.title}
      />


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
              {/* Materials Section */}
              {currentVideo.materials && currentVideo.materials.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-6">Materiais e downloads</h3>
                  
                  <div className="space-y-4">
                    {currentVideo.materials
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((material) => {
                        return (
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
                        );
                      })}
                  </div>
                </div>
              )}
              
              {/* Downloads */}
              {currentVideo.materials && currentVideo.materials.length > 0 ? (
                <div className="space-y-4">
                  {currentVideo.materials
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((material) => {
                      return (
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
                      );
                    })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                 <p className="text-slate-400">Nenhum link disponível para este vídeo.</p>
                </div>
              )}
             
             {/* Ferramentas Section - Only show if there are tools */}
             {currentVideo.ferramentas && currentVideo.ferramentas.length > 0 && (
               <div className="mt-12">
                 <h3 className="text-white font-semibold mb-6">Ferramentas usadas</h3>
                 
                 <div className="space-y-4">
                   {currentVideo.ferramentas.map((ferramenta) => {
                     return (
                       <a
                         key={ferramenta.id}
                         href={ferramenta.link}
                         target="_blank"
                         rel="noopener noreferrer"
                         className="flex items-center space-x-3 px-3 py-4 bg-slate-700/30 rounded-lg hover:bg-slate-600/30 transition-colors cursor-pointer"
                       >
                         <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                           <img 
                             src={ferramenta.icone} 
                             alt={ferramenta.nome}
                             className="w-8 h-8 object-contain"
                             onError={(e) => {
                               // Fallback to ExternalLink icon if image fails to load
                               const target = e.target as HTMLImageElement;
                               target.style.display = 'none';
                               const fallback = target.nextElementSibling as HTMLElement;
                               if (fallback) fallback.style.display = 'flex';
                             }}
                           />
                           <ExternalLink className="w-8 h-8 text-slate-400 hidden" />
                         </div>
                         <div className="flex-1">
                           <div className="text-white font-medium text-sm">{ferramenta.nome}</div>
                         </div>
                       </a>
                     );
                   })}
                 </div>
               </div>
             )}
              
              {/* Ferramentas Section - Only show if there are tools */}
              {currentVideo.ferramentas && currentVideo.ferramentas.length > 0 && (
                <div className={currentVideo.materials && currentVideo.materials.length > 0 ? "mt-12" : ""}>
                  <h3 className="text-white font-semibold mb-6">Ferramentas usadas</h3>
                  
                  <div className="space-y-4">
                    {currentVideo.ferramentas.map((ferramenta) => {
                      return (
                        <a
                          key={ferramenta.id}
                          href={ferramenta.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 px-3 py-4 bg-slate-700/30 rounded-lg hover:bg-slate-600/30 transition-colors cursor-pointer"
                        >
                          <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                            <img 
                              src={ferramenta.icone} 
                              alt={ferramenta.nome}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                // Fallback to ExternalLink icon if image fails to load
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const fallback = target.nextElementSibling as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <ExternalLink className="w-8 h-8 text-slate-400 hidden" />
                          </div>
                          <div className="flex-1">
                            <div className="text-white font-medium text-sm">{ferramenta.nome}</div>
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Related Videos Section - Only show if there are related videos */}
              {relatedVideos.length > 0 && (
                <div className={((currentVideo.materials && currentVideo.materials.length > 0) || (currentVideo.ferramentas && currentVideo.ferramentas.length > 0)) ? "mt-12" : ""}>
                  <h3 className="text-white font-semibold mb-6">Veja também</h3>
                  
                  {loadingRelated ? (
                    <div className="space-y-4">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="flex space-x-3 p-3">
                          <div className="w-16 h-12 bg-slate-700/30 rounded animate-pulse"></div>
                          <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-700/30 rounded animate-pulse"></div>
                            <div className="h-3 bg-slate-700/20 rounded w-2/3 animate-pulse"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {relatedVideos.map((relatedVideo) => (
                        <button
                          key={relatedVideo.id}
                          onClick={() => onVideoSelect(relatedVideo)}
                          className="w-full text-left p-3 bg-slate-700/30 rounded-lg hover:bg-slate-600/30 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative flex-shrink-0">
                              <img
                                src={relatedVideo.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=80&h=60&fit=crop'}
                                alt={relatedVideo.title}
                                className="w-16 h-12 rounded object-cover"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                <Play className="w-4 h-4 text-white" fill="currentColor" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-sm text-white group-hover:text-[#ff7551] transition-colors line-clamp-2">
                                {relatedVideo.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-1 flex items-center space-x-2">
                                {relatedVideo.instructor && (
                                  <span>{relatedVideo.instructor.name}</span>
                                )}
                                {relatedVideo.category && relatedVideo.instructor && (
                                  <span>•</span>
                                )}
                                {relatedVideo.category && (
                                  <span>{relatedVideo.category.name}</span>
                                )}
                              </div>
                            </div>
                            <div className="flex-shrink-0">
                              <svg className="w-4 h-4 text-slate-400 group-hover:text-[#ff7551] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Version Selector - Only show if there are versions */}
              {versionsToShow.length > 0 && (
                <div className={((currentVideo.materials && currentVideo.materials.length > 0) || (currentVideo.ferramentas && currentVideo.ferramentas.length > 0) || relatedVideos.length > 0) ? "mt-12" : ""}>
                  <h3 className="text-white font-semibold mb-4">Outras versões</h3>
                  
                  <div className="space-y-2">
                    {versionsToShow.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => handleVersionChange(version)}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          currentVideo.id === version.id
                            ? 'bg-[#ff7551] text-white'
                            : 'bg-slate-700/30 text-slate-300 hover:bg-slate-600/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={version.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=80&h=60&fit=crop'}
                            alt={version.title}
                            className="w-20 h-15 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">
                              {(version as any).version_name || version.title}
                              {(version as any).is_main_version && (
                                <span className="ml-2 text-xs bg-slate-600/50 text-slate-300 px-2 py-0.5 rounded">
                                  Original
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {formatDuration(version.duration_minutes)}
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            <svg className="w-5 h-5 text-[#ff7551]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Empty state - Only show if no materials, tools, related videos, or versions */}
              {!((currentVideo.materials && currentVideo.materials.length > 0) || 
                  (currentVideo.ferramentas && currentVideo.ferramentas.length > 0) || 
                  relatedVideos.length > 0 || 
                  versionsToShow.length > 0) && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400">Nenhum link disponível para este vídeo.</p>
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