import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Bookmark, ThumbsUp, Users, Copy, Download, CheckCircle, BarChart3, ChevronDown } from 'lucide-react';
import { videoService, type Video } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import CommentsSection from './CommentsSection';
import PaywallModal from './PaywallModal';

// Component for suggested prompts
const SuggestedPrompts: React.FC<{ currentPrompt: Video }> = ({ currentPrompt }) => {
  const { user } = useAuth();
  const [suggestedPrompts, setSuggestedPrompts] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const loadSuggestedPrompts = async () => {
      if (!currentPrompt.category?.slug) {
        setLoading(false);
        return;
      }

      try {
        // Get prompts from the same category, excluding the current prompt
        const allVideos = await videoService.getVideosByCategory(
          currentPrompt.category.slug, 
          10, 
          user?.id
        );
        
        // Filter for prompts only and exclude current prompt
        const prompts = allVideos.filter(v => v.tipo === 'prompt' && v.id !== currentPrompt.id);
        setSuggestedPrompts(prompts.slice(0, 5));
      } catch (error) {
        console.error('Error loading suggested prompts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestedPrompts();
  }, [currentPrompt.id, currentPrompt.category?.slug, user?.id]);

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

  if (suggestedPrompts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400 text-sm">Nenhuma sugestão disponível</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {suggestedPrompts.map((suggestion, index) => (
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

interface PromptViewerProps {
  prompt: Video;
  onBack: () => void;
  onVideoSelect?: (video: Video) => void;
}

const PromptViewer: React.FC<PromptViewerProps> = ({ prompt, onBack, onVideoSelect }) => {
  const { user } = useAuth();
  const [showPaywall, setShowPaywall] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('materials');
  const [promptData, setPromptData] = useState<Video | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Video | null>(null);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);

  // Check if user should see paywall
  useEffect(() => {
    if (!user) {
      setShowPaywall(true);
      return;
    }
    setShowPaywall(false);
  }, [user]);

  useEffect(() => {
    // Initialize variables at the beginning of useEffect
    const currentPromptToLoad = selectedVersion || promptData || prompt;
    const currentPromptSlug = currentPromptToLoad.slug;
    
    const loadPromptData = async () => {
      console.log('PromptViewer: Starting loadPromptData for prompt:', currentPromptToLoad.title, 'ID:', currentPromptToLoad.id, 'Slug:', currentPromptToLoad.slug);
      
      let currentPromptData = currentPromptToLoad;
      
      // Try to load full prompt data if we have a slug
      if (currentPromptSlug && currentPromptSlug.trim() !== '') {
        console.log('PromptViewer: Loading full prompt data by slug:', currentPromptSlug);
        const fullPrompt = await videoService.getVideoBySlug(currentPromptSlug, user?.id);
        if (fullPrompt) {
          console.log('PromptViewer: Successfully loaded full prompt data');
          currentPromptData = fullPrompt;
        } else {
          console.log('PromptViewer: No prompt found for slug, using current prompt data');
        }
      } else {
        console.log('PromptViewer: No slug provided, using current prompt data');
      }
      
      // Set initial prompt data
      setPromptData(currentPromptData);
      
      // Load versions for this prompt
      console.log('PromptViewer: Loading versions for prompt ID:', currentPromptData.id, 'and slug:', currentPromptData.slug);
      const versionResult = await videoService.getVideoVersions(currentPromptData.id, user?.id);
      console.log('PromptViewer: Received versions from service:', versionResult.versions.length, 'versions');
      
      // Update prompt data with versions
      const updatedPromptData = { ...currentPromptData, versions: versionResult.versions };
      setPromptData(updatedPromptData);
      console.log('PromptViewer: Updated promptData with versions:', updatedPromptData.versions?.length || 0);
      
      // Set bookmark and like status
      if (user) {
        const [isBookmarked, isUpvoted] = await Promise.all([
          videoService.isBookmarked(currentPromptData.id, user.id),
          videoService.isUpvoted(currentPromptData.id, user.id)
        ]);
        setSaved(isBookmarked);
        setLiked(isUpvoted);
        console.log('PromptViewer: Set bookmark/like status - saved:', isBookmarked, 'liked:', isUpvoted);
      }
      
      // Record prompt view when prompt is loaded
      if (currentPromptData.id) {
        console.log('PromptViewer: Recording view for prompt:', currentPromptData.id);
        const viewRecorded = await videoService.recordView(currentPromptData.id, user?.id);
        
        if (viewRecorded) {
          // Get fresh counts from database after recording view
          setTimeout(async () => {
            const freshCounts = await videoService.refreshVideoCounts(currentPromptData.id);
            if (freshCounts) {
              setPromptData(prev => prev ? {
                ...prev,
                view_count: freshCounts.view_count,
                upvote_count: freshCounts.upvote_count
              } : null);
            }
          }, 500); // Small delay to ensure trigger has executed
        }
      }
      
      setLoading(false);
      console.log('PromptViewer: Finished loading prompt data');
    };

    loadPromptData();
  }, [selectedVersion?.id, selectedVersion?.slug, prompt.id, prompt.slug, user?.id]);

  const handleToggleLike = async () => {
    if (!user || !currentPrompt || likeLoading) return;
    
    setLikeLoading(true);
    
    try {
      const success = await videoService.toggleUpvote(currentPrompt.id, user.id);
      if (success) {
        const newLikedState = !liked;
        setLiked(newLikedState);
        
        // Get fresh counts from database after toggle
        setTimeout(async () => {
          const freshCounts = await videoService.refreshVideoCounts(currentPrompt.id);
          if (freshCounts) {
            const updateCount = (prev: Video | null) => prev ? {
              ...prev,
              upvote_count: freshCounts.upvote_count
            } : null;
            
            setPromptData(updateCount);
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
    if (!user || !currentPrompt || bookmarkLoading) return;
    
    setBookmarkLoading(true);
    
    try {
      console.log('Toggling bookmark for prompt viewer:', currentPrompt.id, 'Current status:', saved);
      
      const success = await videoService.toggleBookmark(currentPrompt.id, user.id);
      if (success) {
        const newSavedStatus = !saved;
        setSaved(newSavedStatus);
        console.log('Updated prompt viewer bookmark status to:', newSavedStatus);
      } else {
        console.error('Failed to toggle bookmark in prompt viewer');
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    } finally {
      setBookmarkLoading(false);
    }
  };
  const handleVersionChange = async (version: Video) => {
    setSelectedVersion(version);
    setShowVersionDropdown(false);
    
    // Update prompt data with selected version
    setPromptData(version);
    
    // Update bookmark and like status for the new version
    if (user) {
      const [isBookmarked, isUpvoted] = await Promise.all([
        videoService.isBookmarked(version.id, user.id),
        videoService.isUpvoted(version.id, user.id)
      ]);
      setSaved(isBookmarked);
      setLiked(isUpvoted);
    }
  };

  const handleCopyPrompt = async () => {
    const currentPrompt = selectedVersion || prompt;
    const currentPromptSlug = currentPrompt.slug;

    if (!currentPrompt?.prompt_content && !currentPrompt?.description) return;
    
    try {
      const contentToCopy = currentPrompt.prompt_content || currentPrompt.description || '';
      await navigator.clipboard.writeText(contentToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying prompt:', error);
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

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-slate-400">Carregando prompt...</div>
      </div>
    );
  }

  const currentPrompt = selectedVersion || promptData || prompt;
  
  // Always show versions dropdown - check if there are any versions loaded
  const hasVersions = true; // Always show the dropdown
  const versionsToShow = promptData?.versions || [];
  
  console.log('PromptViewer: versions check:', {
    hasVersions,
    versionsCount: versionsToShow.length,
    promptDataId: promptData?.id,
    currentPromptId: currentPrompt?.id
  });

  // Show paywall if user is not authenticated
  if (showPaywall) {
    return (
      <>
        <PaywallModal
          isOpen={showPaywall}
          onClose={onBack}
          contentTitle={currentPrompt.title}
          contentType="prompt"
        />
      </>
    );
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
      {/* Prompt Content Section */}
      <div className="flex-1 flex flex-col p-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-slate-400 hover:text-white mb-6 transition-colors w-fit"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        {/* Prompt Header */}
        {/* Prompt Info */}
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-white leading-tight">
            {currentPrompt.title}
          </h1>

          {/* Separator */}
          <div className="w-full h-px bg-slate-600/30"></div>

          {/* Creator Info & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 pl-[5px]">
              <div className="relative">
                <img
                  src={currentPrompt.instructor?.avatar_url || '/avatar1.png'}
                  alt={currentPrompt.instructor?.name || 'Instrutor'}
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
                  <span className="text-white font-semibold text-xl pl-2" style={{ marginBottom: '-3px' }}>{currentPrompt.instructor?.name || 'Instrutor'}</span>
                </div>
                <div className="flex items-center mt-0">
                  {currentPrompt.instructor?.social_instagram && (
                    <a 
                      href={`https://instagram.com/${currentPrompt.instructor.social_instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[#ff7551] hover:text-[#ff7551]/80 text-xs transition-colors"
                    >
                      @{currentPrompt.instructor.social_instagram}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Prompt Info */}
              <div className="flex items-center space-x-4 text-slate-300 text-xs mr-4">
                {currentPrompt.difficulty_level && (
                  <div className="flex items-center space-x-1">
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                    <span>{currentPrompt.difficulty_level.name}</span>
                  </div>
                )}
              </div>
              
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

          {/* Description */}
          <div className="bg-slate-700/30 rounded-lg p-8">
            <div className="text-slate-300 text-sm leading-relaxed">
              {currentPrompt.summary && (
                <p className="mb-4 font-medium text-white">{currentPrompt.summary}</p>
              )}
              {currentPrompt.description && (
                <div className="mb-4 whitespace-pre-wrap">
                  {currentPrompt.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-2">{paragraph}</p>
                  ))}
                </div>
              )}
              
              {/* Prompt Code Box */}
              {(currentPrompt.prompt_content || currentPrompt.description) && (
                <div className="mt-6 pt-6 border-t border-slate-600/30">
                  <div className="mb-4">
                    <h4 className="text-white font-semibold text-lg">Prompt para copiar 🠗</h4>
                  </div>
                  
                  <div className={`relative bg-gray-900/95 border rounded-lg p-8 font-mono text-sm transition-all duration-300 ${
                    copied 
                      ? 'border-green-500/50 bg-green-900/20' 
                      : 'border-gray-800/80'
                  }`}>
                    {/* Copy Button - Inside the field, top right */}
                    <button
                      onClick={handleCopyPrompt}
                      className={`absolute top-4 right-4 z-10 flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm ${
                        copied 
                          ? 'bg-green-500 text-white shadow-lg' 
                          : 'bg-[#ff7551] hover:bg-[#ff7551]/80 text-white shadow-lg hover:scale-105'
                      }`}
                    >
                      {copied ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    {/* Success overlay effect */}
                    {copied && (
                      <div className="absolute inset-0 bg-green-500/10 rounded-lg animate-pulse pointer-events-none" />
                    )}

                    <pre className="text-slate-100 whitespace-pre-wrap leading-relaxed font-mono">
                      {currentPrompt.prompt_content || currentPrompt.description}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-12">
            <CommentsSection 
              videoId={currentPrompt.id} 
              videoTitle={currentPrompt.title} 
            />
          </div>
        </div>
      </div>

      {/* Materials Section */}
      {/* Materials Section - Only show if there are materials or versions */}
      {((currentPrompt.materials && currentPrompt.materials.length > 0) || versionsToShow.length > 0) && (
        <div className="w-full lg:w-96 border-l border-slate-700/30 flex flex-col">
          {/* Tab Header */}
          <div className="p-6 border-b border-slate-700/30">
            <h3 className="text-white font-semibold">Links</h3>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-8">
              {/* Materials - Only show if there are materials */}
              {currentPrompt.materials && currentPrompt.materials.length > 0 && (
                <div>
                  <h3 className="text-white font-semibold mb-6">Materiais e downloads</h3>
                  
                  <div className="space-y-4">
                    {currentPrompt.materials
                      .sort((a, b) => a.order_index - b.order_index)
                      .map((material) => (
                        <a
                          key={material.id}
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-3 px-3 py-4 bg-slate-700/30 rounded-lg hover:bg-slate-600/30 transition-colors cursor-pointer"
                        >
                          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
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
              
              {/* Version Selector - Only show if there are versions */}
              {versionsToShow.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-white font-semibold mb-4">Outras versões</h3>
                  
                  <div className="space-y-2">
                    {versionsToShow.map((version) => (
                      <button
                        key={version.id}
                        onClick={() => handleVersionChange(version)}
                        className={`w-full text-left p-4 rounded-lg transition-colors ${
                          currentPrompt.id === version.id
                            ? 'bg-[#ff7551] text-white'
                            : 'bg-slate-700/30 text-slate-300 hover:bg-slate-600/30'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={version.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=80&h=60&fit=crop'}
                            alt={version.title}
                            className="w-16 h-12 rounded object-cover flex-shrink-0"
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
                              {version.tipo}
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
            </div>
          </div>
        </div>
      )}

      {/* Suggested Prompts - Always show as separate section */}
      <div className="w-full lg:w-96 border-l border-slate-700/30 flex flex-col">
        {/* Tab Header */}
        <div className="p-6 border-b border-slate-700/30">
          <h3 className="text-white font-semibold">Sugestões</h3>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6" key={currentPrompt.id}>
            <h3 className="text-white font-semibold mb-6">Prompts Relacionados</h3>
            
            <SuggestedPrompts currentPrompt={currentPrompt} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromptViewer;