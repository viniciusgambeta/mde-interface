import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Reply, Instagram, Linkedin, MoreVertical, ArrowRight, ThumbsUp, ChevronDown, CheckCircle } from 'lucide-react';
import { commentsService, type Comment } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CommentsSectionProps {
  videoId: string;
  videoTitle: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ videoId, videoTitle }) => {
  const { user } = useAuth();
  const [userAvatar, setUserAvatar] = useState<string>('/avatar1.png');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Load user avatar from assinaturas table
  useEffect(() => {
    const loadUserAvatar = async () => {
      if (!user) {
        setUserAvatar('/avatar1.png');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('assinaturas')
          .select('avatar_usuario')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error loading user avatar for comments:', error);
          setUserAvatar('/avatar1.png');
          return;
        }

        setUserAvatar(data?.avatar_usuario || '/avatar1.png');
      } catch (error) {
        console.error('Exception loading user avatar for comments:', error);
        setUserAvatar('/avatar1.png');
      }
    };

    loadUserAvatar();
  }, [user?.id]);

  // Load comments
  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      try {
        const commentsData = await commentsService.getVideoComments(videoId);
        setComments(commentsData);
      } catch (error) {
        console.error('Error loading comments:', error);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      loadComments();
    }
  }, [videoId]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !newComment.trim() || submitting) return;

    setSubmitting(true);
    
    try {
      console.log('Submitting comment for user:', user.id);
      const success = await commentsService.createComment(videoId, user.id, newComment);
      
      if (success) {
        setNewComment('');
        console.log('Comment submitted successfully, reloading comments');
        // Reload comments
        const updatedComments = await commentsService.getVideoComments(videoId);
        setComments(updatedComments);
      } else {
        console.error('Failed to submit comment');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent, parentCommentId: string, replyContent: string, setReplyContent: (content: string) => void, setIsReplying: (replying: boolean) => void) => {
    e.preventDefault();
    
    if (!user || !replyContent.trim() || submitting) return;

    setSubmitting(true);
    
    try {
      console.log('Submitting reply for user:', user.id, 'to comment:', parentCommentId);
      const success = await commentsService.createComment(videoId, user.id, replyContent, parentCommentId);
      
      if (success) {
        setReplyContent('');
        setIsReplying(false);
        console.log('Reply submitted successfully, reloading comments');
        // Reload comments
        const updatedComments = await commentsService.getVideoComments(videoId);
        setComments(updatedComments);
      } else {
        console.error('Failed to submit reply');
      }
    } catch (error) {
      console.error('Error submitting reply:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!user || !window.confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      console.log('Deleting comment:', commentId, 'for user:', user.id);
      const success = await commentsService.deleteComment(commentId, user.id);
      
      if (success) {
        console.log('Comment deleted successfully, reloading comments');
        // Reload comments
        const updatedComments = await commentsService.getVideoComments(videoId);
        setComments(updatedComments);
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const toggleReplies = (commentId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'agora mesmo';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}min atrás`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h atrás`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d atrás`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const sortedComments = React.useMemo(() => {
    const sorted = [...comments];
    if (sortBy === 'recent') {
      return sorted.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else {
      return sorted.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    }
  }, [comments, sortBy]);

  const CommentComponent: React.FC<{ 
    comment: Comment; 
    isReply?: boolean;
  }> = ({ comment, isReply = false }) => {
    const [showMenu, setShowMenu] = useState(false);
    const [localReplyContent, setLocalReplyContent] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [isLiking, setIsLiking] = useState(false);
    const [localLikeCount, setLocalLikeCount] = useState(comment.like_count || 0);
    const [localIsLiked, setLocalIsLiked] = useState(comment.is_liked || false);
    const isOwner = user?.id === comment.user_id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments.has(comment.id);

    // Handle toggle comment like
    const handleToggleCommentLike = async (commentId: string) => {
      if (!user) return;
      
      try {
        // Optimistic update
        const newIsLiked = !localIsLiked;
        const newLikeCount = newIsLiked ? localLikeCount + 1 : localLikeCount - 1;
        
        setLocalIsLiked(newIsLiked);
        setLocalLikeCount(newLikeCount);
        
        // Call API
        await commentsService.toggleCommentLike(commentId, user.id);
      } catch (error) {
        // Revert optimistic update on error
        setLocalIsLiked(!localIsLiked);
        setLocalLikeCount(localIsLiked ? localLikeCount + 1 : localLikeCount - 1);
        console.error('Error toggling comment like:', error);
      }
    };
    
    const handleReplySubmit = (e: React.FormEvent) => {
      handleSubmitReply(e, comment.id, localReplyContent, setLocalReplyContent, setIsReplying);
    };

    return (
      <div className={`${isReply ? 'ml-12 border-l border-slate-700/30 pl-6' : ''}`}>
        <div className="flex space-x-4 group">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <img
              src={comment.user_avatar || '/avatar1.png'}
              alt={comment.user_name}
              className="w-10 h-10 rounded-lg object-cover"
            />
          </div>
          
          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* User Info and Time */}
            <div className="flex items-center space-x-3 mb-2">
              <span className="text-white font-medium text-sm">
                {comment.user_name}
              </span>
              
              {/* Instructor Badge */}
              {comment.user_nivel === 'instrutor' && (
                <span className="bg-slate-600/50 text-slate-300 text-xs px-2 py-0.5 rounded">
                  Instrutor
                </span>
              )}
              
              {/* Social Links */}
              <div className="flex items-center space-x-1.5">
                {comment.user_instagram && (
                  <a
                    href={`https://instagram.com/${comment.user_instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {comment.user_linkedin && (
                  <a
                    href={comment.user_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-blue-400 transition-colors"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              
              <span className="text-slate-500 text-xs">
                {formatTimeAgo(comment.created_at)}
              </span>
              
              {/* Menu for comment owner */}
              {isOwner && (
                <div className="relative ml-auto">
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-slate-700/30 transition-all"
                  >
                    <MoreVertical className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50 min-w-[100px]">
                      <button
                        onClick={() => {
                          handleDeleteComment(comment.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-xs"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Excluir</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Comment Text */}
            <p className="text-slate-300 text-sm leading-relaxed mb-3 whitespace-pre-wrap">
              {comment.content}
            </p>
            
            {/* Actions */}
            <div className="flex items-center space-x-4">
              {/* Reply Button */}
              {!isReply && user && (
                <button
                  onClick={() => setIsReplying(!isReplying)}
                  className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <Reply className="w-4 h-4" />
                  <span className="text-xs font-medium">Responder</span>
                </button>
              )}
              
              {/* Show Replies Button */}
              {hasReplies && !isReply && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  <span className="text-xs font-medium">
                    {comment.reply_count || comment.replies?.length || 0} {(comment.reply_count || comment.replies?.length || 0) === 1 ? 'resposta' : 'respostas'}
                  </span>
                </button>
              )}
            </div>
            
            {/* Reply Form */}
            {isReplying && user && (
              <div className="mt-4">
                <form onSubmit={handleReplySubmit} className="space-y-3">
                  <div className="relative">
                    <div className="flex space-x-3">
                      <img
                        src={userAvatar}
                        alt={user.name}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 mt-1"
                      />
                      <div className="flex-1 relative">
                        <textarea
                          value={localReplyContent}
                          onChange={(e) => setLocalReplyContent(e.target.value)}
                          placeholder={`Responder para ${comment.user_name}...`}
                          className="w-full pl-4 pr-20 py-3 bg-slate-800/50 border border-slate-700/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff7551]/30 focus:border-[#ff7551]/30 transition-all resize-none text-sm min-h-[60px]"
                          rows={3}
                          disabled={submitting}
                        />
                        <button
                          type="submit"
                          disabled={!localReplyContent.trim() || submitting}
                         className="absolute bottom-4 right-3 px-4 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center text-sm font-medium"
                        >
                          {submitting ? (
                            <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            'Comentar'
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between ml-13">
                    <button
                      type="button"
                      onClick={() => {
                        setIsReplying(false);
                        setLocalReplyContent('');
                      }}
                      className="text-slate-500 hover:text-slate-300 text-xs transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        
        {/* Replies */}
        {hasReplies && isExpanded && (
          <div className="mt-4 space-y-4">
            {comment.replies!.map((reply) => (
              <CommentComponent key={reply.id} comment={reply} isReply={true} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* New Comment Form */}
      {user ? (
        <div className="space-y-4">
          <form onSubmit={handleSubmitComment} className="relative">
            <div className="flex space-x-4">
              <img
                src={userAvatar}
                alt={user.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0 mt-1"
              />
              <div className="flex-1 relative">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Adicionar comentário"
                  className="w-full pl-4 pr-16 py-4 bg-slate-800/50 border border-slate-700/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#ff7551]/30 focus:border-[#ff7551]/30 transition-all resize-none text-sm min-h-[60px]"
                  rows={3}
                  disabled={submitting}
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="absolute bottom-4 right-4 px-4 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center text-sm font-medium"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    'Comentar'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        <div className="text-center py-8 bg-slate-800/30 rounded-lg border border-slate-700/30">
          <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">Sign in to join the conversation</p>
          <button className="px-6 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors">
            Sign In
          </button>
        </div>
      )}

      {/* Comments Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h3 className="text-white font-semibold text-lg">
            Comentários
          </h3>
          <span className="bg-[#ff7551] text-white text-sm px-2 py-1 rounded font-medium">
            {comments.length}
          </span>
        </div>
        
        {/* Sort Options */}
        <div className="flex items-center space-x-4 text-sm">
          <span className="text-slate-400">Todos</span>
          <div className="relative">
            <button
              onClick={() => setShowSortDropdown(!showSortDropdown)}
              className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors"
            >
              <span>{sortBy === 'recent' ? 'Mais recentes' : 'Mais antigos'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showSortDropdown && (
              <div className="absolute top-full right-0 mt-2 w-40 bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50">
                <div className="p-2">
                  <button
                    onClick={() => {
                      setSortBy('recent');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      sortBy === 'recent'
                        ? 'bg-[#ff7551] text-white'
                        : 'text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    Mais recentes
                  </button>
                  <button
                    onClick={() => {
                      setSortBy('oldest');
                      setShowSortDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                      sortBy === 'oldest'
                        ? 'bg-[#ff7551] text-white'
                        : 'text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    Mais antigos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments List */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex space-x-4">
              <div className="w-10 h-10 bg-slate-700/30 rounded-lg animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700/30 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-slate-700/20 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-700/20 rounded w-3/4 animate-pulse"></div>
                <div className="flex space-x-4 mt-3">
                  <div className="h-3 bg-slate-700/20 rounded w-12 animate-pulse"></div>
                  <div className="h-3 bg-slate-700/20 rounded w-12 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {sortedComments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2 text-lg">Nenhum comentário ainda</h3>
          <p className="text-slate-400">
            Seja o primeiro a comentar sobre "{videoTitle}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;