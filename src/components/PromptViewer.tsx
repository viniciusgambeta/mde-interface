import React, { useState, useEffect } from 'react';
import { ArrowLeft, Heart, Bookmark, ThumbsUp, Users, Copy, Download, CheckCircle, BarChart3, ChevronDown } from 'lucide-react';
import { videoService, type Video } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';

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
              src={suggestion.thumbnail_url || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=100&h=150&fit=crop'}
              alt={suggestion.title}
              className="w-16 h-24 rounded-lg object-cover group-hover:opacity-80 transition-opacity"
            />
            <div className="absolute top-2 right-2 bg-purple-500 text-white text-xs px-1.5 py-0.5 rounded font-medium">
              <div className="flex items-center space-x-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Prompt</span>
              </div>
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
              <span>Prompt</span>
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
}

const PromptViewer: React.FC<PromptViewerProps> = ({ prompt, onBack }) => {
  const { user } = useAuth();
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

  useEffect(() => {
    const loadPromptData = async () => {
      console.log('PromptViewer: Starting loadPromptData for prompt:', prompt.title, 'ID:', prompt.id, 'Slug:', prompt.slug);
      
      let currentPromptData = prompt;
      
      // Try to load full prompt data if we have a slug
      if (prompt.slug && prompt.slug.trim() !== '') {
        console.log('PromptViewer: Loading full prompt data by slug');
        const fullPrompt = await videoService.getVideoBySlug(prompt.slug, user?.id);
        if (fullPrompt) {
          console.log('PromptViewer: Successfully loaded full prompt data');
          currentPromptData = fullPrompt;
        } else {
          console.log('PromptViewer: No prompt found for slug, using passed prompt data');
        }
      } else {
        console.log('PromptViewer: No slug provided, using passed prompt data');
      }
      
      // Set initial prompt data
      setPromptData(currentPromptData);
      
      // Load versions for this prompt
      console.log('PromptViewer: Loading versions for prompt ID:', currentPromptData.id);
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
      
      setLoading(false);
      console.log('PromptViewer: Finished loading prompt data');
    };

    loadPromptData();
  }, [prompt.id, user?.id]);

  const handleToggleLike = async () => {
    if (!user || !currentPrompt || likeLoading) return;
    
    setLikeLoading(true);
    
    try {
      const success = await videoService.toggleUpvote(currentPrompt.id, user.id);
      if (success) {
        setLiked(!liked);
        // Update local count
        const updateCount = (prev: Video | null) => prev ? {
          ...prev,
          upvote_count: liked ? prev.upvote_count - 1 : prev.upvote_count + 1
        } : null;
        
        setPromptData(updateCount);
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
          <h1 className="text-2xl font-bold text-white leading-tight">
            {currentPrompt.title}
          </h1>

          {/* Creator Info & Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={currentPrompt.instructor?.avatar_url || '/src/images/avatar.jpg'}
                alt={currentPrompt.instructor?.name || 'Instrutor'}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <div className="flex items-center space-x-1">
                  <span className="text-white font-semibold text-lg">{currentPrompt.instructor?.name || 'Instrutor'}</span>
                </div>
                <div className="flex items-center mt-0.5">
                  {currentPrompt.instructor?.social_instagram && (
                    <a 
                      href={`https://instagram.com/${currentPrompt.instructor.social_instagram}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-[#ff7551] text-xs transition-colors"
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
              
              {/* Version Selector - Always show */}
              {hasVersions && (
                <div className="relative">
                  <button
                    onClick={() => setShowVersionDropdown(!showVersionDropdown)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors border border-slate-600/30 h-12 ${
                      versionsToShow.length > 0 
                        ? 'bg-slate-700/30 hover:bg-slate-600/30 text-slate-300 hover:text-white cursor-pointer' 
                        : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                    }`}
                    disabled={versionsToShow.length === 0}
                  >
                    <span className="text-sm font-medium">
                      {versionsToShow.length > 0 ? 'Outras versões' : 'Sem outras versões'}
                    </span>
                    {versionsToShow.length > 0 && (
                      <ChevronDown className={`w-4 h-4 transition-transform ${showVersionDropdown ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {showVersionDropdown && versionsToShow.length > 0 && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50 max-h-64 overflow-y-auto">
                      <div className="p-2">
                        {versionsToShow.map((version) => (
                          <button
                            key={version.id}
                            onClick={() => handleVersionChange(version)}
                            className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                              currentPrompt.id === version.id
                                ? 'bg-[#ff7551] text-white'
                                : 'text-slate-300 hover:bg-slate-700/30'
                            }`}
                          >
                            <div className="font-medium">
                              {(version as any).version_name || version.title}
                              {(version as any).is_main_version && (
                                <span className="ml-2 text-xs bg-[#ff7551] text-white px-2 py-0.5 rounded">
                                  Original
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                              {version.tipo} • {formatViews(version.view_count)} views
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <button
                onClick={handleToggleLike}
                disabled={!user || likeLoading}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  liked ? 'bg-[#ff7551] text-white shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                } ${likeLoading ? 'animate-pulse' : ''}`}
              >
                <ThumbsUp className="w-4 h-4" />
              </button>
              
              <button 
                onClick={handleToggleSave}
                disabled={!user || bookmarkLoading}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-full transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  saved ? 'bg-white text-black shadow-lg' : 'bg-slate-700 text-slate-300 hover:bg-slate-600 disabled:opacity-50'
                } ${bookmarkLoading ? 'animate-pulse' : ''}`}
              >
                <Bookmark className="w-4 h-4" fill={saved ? 'currentColor' : 'none'} />
                <span>{saved ? 'Salvo' : 'Salvar'}</span>
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
        </div>
      </div>

      {/* Materials Section */}
      <div className="w-full lg:w-96 border-l border-slate-700/30 flex flex-col">
        {/* Tab Header - Only show Suggestions */}
        <div className="p-6 border-b border-slate-700/30">
          <div>
            <h3 className="text-white font-semibold">Prompts Relacionados</h3>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <SuggestedPrompts currentPrompt={currentPrompt} />
        </div>
      </div>
    </div>
  );
};

export default PromptViewer;