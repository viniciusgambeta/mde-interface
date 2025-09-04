import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Bookmark, ThumbsUp, Users, Send, Download, ExternalLink, FileText, MessageCircle, Phone, Instagram, BarChart3, Clock, ChevronDown, Linkedin } from 'lucide-react';
import { videoService, type Video } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import CustomVideoPlayer from './CustomVideoPlayer';
import CommentsSection from './CommentsSection';

// Component for suggested videos
const SuggestedVideos: React.FC<{ currentVideo: Video; onVideoSelect?: (video: Video) => void }> = ({ currentVideo, onVideoSelect }) => {
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

  const formatViews = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  useEffect(() => {
    const loadSuggestedVideos = async () => {
      try {
        console.log('Loading suggested videos for:', currentVideo.title);
        
        // Get all videos to filter from
        const allVideos = await videoService.getVideos({ 
          limit: 100, 
          userId: user?.id 
        });
        
        // Filter related videos based on multiple criteria
        let relatedVideos = allVideos.filter(v => v.id !== currentVideo.id);
        
        // Priority 1: Same category
        const sameCategoryVideos = relatedVideos.filter(v => 
          v.category?.id === currentVideo.category?.id
        );
        
        // Priority 2: Same tools/ferramentas
        const currentTools = currentVideo.ferramentas?.map(f => f.id) || [];
        const sameToolsVideos = relatedVideos.filter(v => {
          const videoTools = v.ferramentas?.map(f => f.id) || [];
          return currentTools.some(toolId => videoTools.includes(toolId));
        });
        
        // Priority 3: Same instructor
        const sameInstructorVideos = relatedVideos.filter(v => 
          v.instructor?.id === currentVideo.instructor?.id
        );
        
        // Priority 4: Same difficulty level
        const sameDifficultyVideos = relatedVideos.filter(v => 
          v.difficulty_level?.id === currentVideo.difficulty_level?.id
        );
        
        // Combine and deduplicate, maintaining priority order
        const combinedVideos = [
          ...sameCategoryVideos,
          ...sameToolsVideos.filter(v => !sameCategoryVideos.find(cv => cv.id === v.id)),
          ...sameInstructorVideos.filter(v => 
            !sameCategoryVideos.find(cv => cv.id === v.id) && 
            !sameToolsVideos.find(tv => tv.id === v.id)
          ),
          ...sameDifficultyVideos.filter(v => 
            !sameCategoryVideos.find(cv => cv.id === v.id) && 
            !sameToolsVideos.find(tv => tv.id === v.id) &&
            !sameInstructorVideos.find(iv => iv.id === v.id)
          )
        ];
        
        // Take top 10 suggestions
        const suggestions = combinedVideos.slice(0, 10);
        
        console.log('Found suggestions:', {
          total: suggestions.length,
          sameCategory: sameCategoryVideos.length,
          sameTools: sameToolsVideos.length,
          sameInstructor: sameInstructorVideos.length,
          sameDifficulty: sameDifficultyVideos.length
        });
        
        setSuggestedVideos(suggestions);
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
        <div 
          key={suggestion.id} 
          className="flex space-x-4 cursor-pointer group p-2 rounded-lg hover:bg-slate-700/20 transition-colors"
          onClick={() => onVideoSelect?.(suggestion)}
        >
          <div className="relative flex-shrink-0">
            <img
              src={suggestion.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=80&h=60&fit=crop'}
              alt={suggestion.title}
              className="w-20 h-15 rounded object-cover"
            />
            {/* Content Type Badge */}
            {suggestion.tipo === 'prompt' && (
              <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                Prompt
              </div>
            )}
            {suggestion.tipo === 'live' && (
              <div className="absolute top-1 right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
                Live
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-white text-sm font-medium line-clamp-2 group-hover:text-[#ff7551] transition-colors mb-1">
              {suggestion.title}
            </h5>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              {suggestion.instructor && (
                <span>{suggestion.instructor.name}</span>
              )}
              {suggestion.instructor && suggestion.category && (
                <span>•</span>
              )}
              {suggestion.category && (
                <span>{suggestion.category.name}</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-1">
              <Clock className="w-3 h-3" />
              <span>{formatDuration(suggestion.duration_minutes)}</span>
              <span>•</span>
              <span>{formatViews(suggestion.view_count)} views</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const formatViews = (count: number) => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

interface VideoPlayerProps {
  video: Video;
  onBack: () => void;
  onVideoSelect: (video: Video) => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ video, onBack, onVideoSelect }) => {
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
              <img
                src={currentVideo.instructor?.avatar_url || '/avatar1.png'}
                alt={currentVideo.instructor?.name || 'Instrutor'}
                className="w-16 h-16 rounded-xl object-cover"
              />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-semibold text-xl" style={{ marginBottom: '0px', marginLeft: '0px', paddingLeft: '0px' }}>{currentVideo.instructor?.name || 'Instrutor'}</span>
                  {currentVideo.instructor?.social_linkedin && (
                    <a 
                      href={currentVideo.instructor.social_linkedin} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-blue-400 transition-colors ml-2"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                