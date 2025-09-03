import React, { useState, useEffect } from 'react';
import { MessageCircle, Send, Trash2, Reply, Instagram, Linkedin, MoreVertical } from 'lucide-react';
import { commentsService, type Comment } from '../lib/database';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface CommentsSectionProps {
  videoId: string;
  videoTitle: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({ videoId, videoTitle }) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());

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
    
    if (!user || !user.assinaturaId || !newComment.trim() || submitting) return;

    setSubmitting(true);
    
    try {
      console.log('Submitting comment for assinatura:', user.assinaturaId);
      const success = await commentsService.createComment(videoId, user.assinaturaId, newComment);
      
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

  const handleSubmitReply = async (e: React.FormEvent, parentCommentId: string) => {
    e.preventDefault();
    
    if (!user || !user.assinaturaId || !replyContent.trim() || submitting) return;

    setSubmitting(true);
    
    try {
      console.log('Submitting reply for assinatura:', user.assinaturaId, 'to comment:', parentCommentId);
      const success = await commentsService.createComment(videoId, user.assinaturaId, replyContent, parentCommentId);
      
      if (success) {
        setReplyContent('');
        setReplyingTo(null);
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
    if (!user || !user.assinaturaId || !window.confirm('Tem certeza que deseja excluir este comentário?')) return;

    try {
      console.log('Deleting comment:', commentId, 'for assinatura:', user.assinaturaId);
      const success = await commentsService.deleteComment(commentId, user.assinaturaId);
      
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
      return 'agora';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}min`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit'
      });
    }
  };

  const CommentComponent: React.FC<{ 
    comment: Comment; 
    isReply?: boolean;
  }> = ({ comment, isReply = false }) => {
    const [showMenu, setShowMenu] = useState(false);
    const isOwner = user?.assinaturaId === comment.assinatura_id;
    const hasReplies = comment.replies && comment.replies.length > 0;
    const isExpanded = expandedComments.has(comment.id);

    return (
      <div className={`${isReply ? 'ml-12' : ''}`}>
        <div className="flex space-x-3 group">
          {/* Avatar */}
          <img
            src={comment.user_avatar || '/avatar1.png'}
            alt={comment.user_name}
            className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          />
          
          {/* Comment Content */}
          <div className="flex-1 min-w-0">
            {/* User Info */}
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-white font-medium text-sm">
                {comment.user_name}
              </span>
              
              {/* Social Links */}
              <div className="flex items-center space-x-1">
                {comment.user_instagram && (
                  <a
                    href={`https://instagram.com/${comment.user_instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-pink-400 transition-colors"
                  >
                    <Instagram className="w-3 h-3" />
                  </a>
                )}
                {comment.user_linkedin && (
                  <a
                    href={comment.user_linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    <Linkedin className="w-3 h-3" />
                  </a>
                )}
              </div>
              
              <span className="text-slate-500 text-xs">
                {formatTimeAgo(comment.created_at)}
              </span>
              
              {/* Menu for comment owner */}
              {isOwner && (
                {!isReply && user && user.assinaturaId && (
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-700/30 transition-all"
                  >
                    <MoreVertical className="w-4 h-4 text-slate-400" />
                  </button>
                  
                  {showMenu && (
                    <div className="absolute right-0 top-full mt-1 bg-[#1f1d2b] border border-slate-700/30 rounded-lg shadow-xl z-50 min-w-[120px]">
                      <button
                        onClick={() => {
                          handleDeleteComment(comment.id);
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
                      >
                        <Trash2 className="w-3 h-3" />
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
              {!isReply && user && userAssinaturaId && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center space-x-1 text-slate-400 hover:text-white transition-colors text-xs"
                >
                  <Reply className="w-3 h-3" />
                  <span>Responder</span>
                </button>
              )}
              
              {hasReplies && !isReply && (
                <button
                  onClick={() => toggleReplies(comment.id)}
                  className="text-slate-400 hover:text-white transition-colors text-xs"
                >
                  {isExpanded ? 'Ocultar' : 'Ver'} {comment.reply_count || comment.replies?.length || 0} resposta{(comment.reply_count || comment.replies?.length || 0) !== 1 ? 's' : ''}
                </button>
              )}
            </div>
            
            {/* Reply Form */}
            {replyingTo === comment.id && user && user.assinaturaId && (
              <form onSubmit={(e) => handleSubmitReply(e, comment.id)} className="mt-4">
                <div className="flex space-x-3">
                  <img
                    src={user.avatar || '/avatar1.png'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="flex-1">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={`Responder para ${comment.user_name}...`}
                      className="w-full px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all resize-none text-sm"
                      rows={2}
                      disabled={submitting}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="text-slate-400 hover:text-white text-xs transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={!replyContent.trim() || submitting}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white text-xs font-medium rounded transition-colors disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                          <Send className="w-3 h-3" />
                        )}
                        <span>Responder</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
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
      {/* Header */}
      <div className="flex items-center space-x-2">
        <MessageCircle className="w-5 h-5 text-[#ff7551]" />
        <h3 className="text-white font-semibold text-lg">
          Comentários ({comments.length})
        </h3>
      </div>

      {/* New Comment Form */}
      {user && user.assinaturaId ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="flex space-x-3">
            <img
              src={user.avatar || '/avatar1.png'}
              alt={user.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Adicione um comentário..."
                className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all resize-none"
                rows={3}
                disabled={submitting}
              />
              <div className="flex items-center justify-between mt-3">
                <div className="text-slate-500 text-xs">
                  {newComment.length}/500 caracteres
                </div>
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="flex items-center space-x-2 px-4 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 disabled:bg-[#ff7551]/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>Comentar</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-slate-700/20 rounded-lg">
          <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 mb-4">
            {user ? 'Você precisa de uma assinatura ativa para comentar' : 'Faça login para comentar'}
          </p>
          <button className="px-6 py-2 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-colors">
            Entrar
          </button>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex space-x-3">
              <div className="w-10 h-10 bg-slate-700/30 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-slate-700/30 rounded w-1/4 animate-pulse"></div>
                <div className="h-4 bg-slate-700/20 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-700/20 rounded w-3/4 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <CommentComponent key={comment.id} comment={comment} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <MessageCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">Nenhum comentário ainda</h3>
          <p className="text-slate-400 text-sm">
            Seja o primeiro a comentar sobre "{videoTitle}"
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentsSection;