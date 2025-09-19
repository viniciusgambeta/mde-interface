import React, { useState } from 'react';
import { X, AlertTriangle, Send, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
}

const ReportModal: React.FC<ReportModalProps> = ({ isOpen, onClose, videoId, videoTitle }) => {
  const { user } = useAuth();
  const [reportContent, setReportContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !reportContent.trim()) {
      setError('Por favor, descreva o problema encontrado');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const { error: insertError } = await supabase
        .from('video_reports')
        .insert({
          video_id: videoId,
          user_id: user.id,
          report_content: reportContent.trim(),
          status: 'pending'
        });

      if (insertError) {
        console.error('Error submitting report:', insertError);
        setError('Erro ao enviar report. Tente novamente.');
        return;
      }

      setSuccess(true);
      setReportContent('');
      
      // Auto close after 2 seconds
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Exception submitting report:', error);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setReportContent('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#1f1d2b] border border-slate-700/30 rounded-xl w-full max-w-md animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700/30">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Reportar Problema</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 rounded-lg hover:bg-slate-700/30 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg mb-2">Report Enviado!</h3>
                <p className="text-slate-400 text-sm">
                  Obrigado pelo feedback. Nossa equipe irá analisar o problema reportado.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Video Info */}
              <div className="p-4 bg-slate-700/20 rounded-lg">
                <div className="text-slate-400 text-sm mb-1">Reportando problema na aula:</div>
                <div className="text-white font-medium">{videoTitle}</div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Report Content */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descreva o problema encontrado *
                </label>
                <textarea
                  value={reportContent}
                  onChange={(e) => setReportContent(e.target.value)}
                  placeholder="Descreva detalhadamente o problema que você encontrou nesta aula (ex: vídeo não carrega, áudio com problema, erro na página, etc.)"
                  className="w-full px-4 py-3 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff7551]/50 focus:border-transparent transition-all resize-none"
                  rows={5}
                  maxLength={500}
                  disabled={isSubmitting}
                  required
                />
                <div className="text-right text-xs text-slate-500 mt-1">
                  {reportContent.length}/500 caracteres
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="px-6 py-3 text-slate-300 hover:text-white transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={!reportContent.trim() || isSubmitting}
                  className="flex items-center space-x-2 px-6 py-3 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-medium rounded-lg transition-colors disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Report</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportModal;