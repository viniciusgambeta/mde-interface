import React, { useState, useEffect } from 'react';
import { ExternalLink, HandMetal, Loader2, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface HallFerramenta {
  id: string;
  nome_ferramenta: string;
  descricao_ferramenta?: string;
  link_ferramenta: string;
  img_ferramenta?: string;
  tipo_ferramenta?: string;
  avaliacao?: number;
  usuarios?: number;
  preco?: string;
  tags?: string[];
  created_at: string;
}

const PoderzinhosPage: React.FC = () => {
  const [ferramentas, setFerramentas] = useState<HallFerramenta[]>([]);
  const [loading, setLoading] = useState(true);

  // Load ferramentas from database
  useEffect(() => {
    const loadFerramentas = async () => {
      setLoading(true);
      try {
        console.log('🔧 Loading ferramentas from hall_ferramentas table...');
        
        const { data, error } = await supabase
          .from('hall_ferramentas')
          .select('id, nome_ferramenta, img_ferramenta, link_ferramenta, descricao_ferramenta, tipo_ferramenta, created_at')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error loading ferramentas:', error);
          console.error('Error details:', error.message, error.code);
          setFerramentas([]);
          return;
        }

        console.log('📊 Loaded ferramentas:', data?.length || 0);
        console.log('📊 Sample data:', data?.[0]);
        setFerramentas(data || []);
      } catch (error) {
        console.error('Exception loading ferramentas:', error);
        setFerramentas([]);
      } finally {
        setLoading(false);
      }
    };

    loadFerramentas();
  }, []);

  const FerramentaCard: React.FC<{ ferramenta: HallFerramenta }> = ({ ferramenta }) => {
    return (
      <div className="relative bg-slate-700/30 border border-slate-600/30 rounded-xl overflow-hidden aspect-[3/4] group cursor-pointer">
        {/* Background Image */}
        <div className="absolute inset-0">
          {ferramenta.img_ferramenta ? (
            <img 
              src={ferramenta.img_ferramenta} 
              alt={ferramenta.nome_ferramenta}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`w-full h-full bg-slate-600/30 ${ferramenta.img_ferramenta ? 'hidden' : 'flex'} items-center justify-center`}>
            <ExternalLink className="w-12 h-12 text-slate-400" />
          </div>
        </div>
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-6 pb-4">
          {/* Tool Name - Always visible, moves up on hover */}
          <h3 className="text-white font-bold text-2xl mb-2 leading-tight transition-all duration-300 group-hover:-translate-y-20">
            {ferramenta.nome_ferramenta}
          </h3>

          {/* Tool Type - Always visible, moves up on hover */}
          {ferramenta.tipo_ferramenta && (
            <div className="flex items-center space-x-2 mb-4 transition-all duration-300 group-hover:-translate-y-20">
              <DollarSign className="w-3 h-3 text-[#ff7551]" />
              <span className="text-xs px-2 py-1 bg-[#ff7551]/20 text-[#ff7551] rounded-full font-medium border border-[#ff7551]/30">
                {ferramenta.tipo_ferramenta}
              </span>
            </div>
          )}

          {/* Description - Only visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-8 group-hover:translate-y-0">
            {ferramenta.descricao_ferramenta ? (
              <p className="text-slate-200 text-sm leading-relaxed mb-4 line-clamp-2">
                {ferramenta.descricao_ferramenta}
              </p>
            ) : (
              <p className="text-slate-200 text-sm leading-relaxed mb-4 line-clamp-2">
                Acesse esta ferramenta útil através do link fornecido.
              </p>
            )}
          </div>

          {/* Access Button - Only visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-8 group-hover:translate-y-0">
            <a
              href={ferramenta.link_ferramenta}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-semibold rounded-lg transition-colors transform hover:scale-105"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Acessar Ferramenta</span>
            </a>
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="w-full space-y-8">
        <div className="text-left">
          <h1 className="text-3xl font-bold text-white mb-4">Poderzinhos</h1>
          <p className="text-slate-400 text-lg max-w-3xl">
            Carregando ferramentas...
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-slate-700/30 rounded-xl p-6 animate-pulse">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-slate-600/30 rounded-lg"></div>
                  <div>
                    <div className="h-5 bg-slate-600/30 rounded w-24 mb-2"></div>
                    <div className="h-4 bg-slate-600/20 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-5 h-5 bg-slate-600/30 rounded"></div>
              </div>
              <div className="h-4 bg-slate-600/20 rounded mb-2"></div>
              <div className="h-4 bg-slate-600/20 rounded w-3/4 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-slate-600/20 rounded w-16"></div>
                <div className="h-3 bg-slate-600/20 rounded w-12"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-3xl font-bold text-white mb-4">Poderzinhos</h1>
        <p className="text-slate-400 text-lg max-w-3xl">
          Descubra ferramentas poderosas para automação, IA e produtividade. 
          Nossa curadoria especial de ferramentas que vão turbinar seu trabalho e criatividade.
        </p>
      </div>

      {/* Ferramentas Grid */}
      {ferramentas.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {ferramentas.map((ferramenta, index) => (
            <div
              key={ferramenta.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <FerramentaCard ferramenta={ferramenta} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <HandMetal className="w-8 h-8 text-slate-500" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Nenhuma ferramenta disponível
          </h3>
          <p className="text-slate-400 max-w-md mx-auto">
            Não encontramos ferramentas para exibir no momento.
          </p>
        </div>
      )}
    </div>
  );
};

export default PoderzinhosPage;