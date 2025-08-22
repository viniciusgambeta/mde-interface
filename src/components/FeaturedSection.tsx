import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { featuredContentService, type FeaturedContent } from '../lib/database';

interface FeaturedSectionProps {
  onVideoSelect: (video: any) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ onVideoSelect }) => {
  const navigate = useNavigate();
  const [featuredContent, setFeaturedContent] = React.useState<FeaturedContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = React.useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const content = await featuredContentService.getAllActiveFeaturedContent();
        if (content && content.length > 0) {
          setFeaturedContent(content);
          console.log('Featured content loaded:', content.length, 'items');
        }
      } catch (error) {
        console.error('Error loading featured content:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeaturedContent();
  }, []);

  // Auto-advance carousel
  useEffect(() => {
    if (featuredContent.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      }, 8000); // Change slide every 8 seconds

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [featuredContent.length]);

  const handleButtonClick = (event: React.MouseEvent, content: FeaturedContent) => {
    event.preventDefault();
    event.stopPropagation();
    
    console.log('🎬 Featured content button clicked:', {
      title: content.titulo,
      link: content.link_botao,
      id: content.id
    });
    
    // Open external link in new tab
    window.open(content.link_botao, '_blank', 'noopener,noreferrer');
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    // Reset auto-advance timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % featuredContent.length);
      }, 8000);
    }
  };

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? featuredContent.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  };

  const goToNext = () => {
    const newIndex = (currentIndex + 1) % featuredContent.length;
    goToSlide(newIndex);
  };

  // Mock news data
  const newsItems = [
    {
      id: 1,
      title: "Nova funcionalidade de IA para recomendações personalizadas",
      date: "2024-01-15"
    },
    {
      id: 2,
      title: "Parceria com grandes empresas de tecnologia",
      date: "2024-01-12"
    },
    {
      id: 3,
      title: "Lançamento de cursos avançados de Machine Learning",
      date: "2024-01-10"
    },
    {
      id: 4,
      title: "Atualização da plataforma com melhor performance",
      date: "2024-01-08"
    },
    {
      id: 5,
      title: "Novos instrutores especialistas se juntam à equipe",
      date: "2024-01-05"
    },
    {
      id: 6,
      title: "Certificações oficiais agora disponíveis",
      date: "2024-01-03"
    }
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <section className="mb-16 w-full">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
          {/* Featured Content Skeleton */}
          <div className="w-full lg:w-[65%] relative h-[280px] sm:h-[320px] lg:h-[380px] overflow-hidden rounded-xl">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            
            {/* Content skeleton */}
            <div className="absolute inset-0 flex items-center">
              <div className="max-w-lg px-8 py-6 space-y-4">
                <div className="h-6 bg-slate-600/30 rounded w-20 animate-pulse"></div>
                <div className="h-8 bg-slate-600/40 rounded w-3/4 animate-pulse"></div>
                <div className="h-4 bg-slate-600/30 rounded w-full animate-pulse"></div>
                <div className="h-4 bg-slate-600/30 rounded w-2/3 animate-pulse"></div>
                <div className="flex space-x-3 mt-6">
                  <div className="h-10 bg-slate-600/40 rounded w-24 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* News Skeleton */}
          <div className="w-full lg:w-[35%] h-[280px] sm:h-[320px] lg:h-[380px] bg-slate-700/30 rounded-xl p-6 relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            
            {/* Content skeleton */}
            <div className="relative z-10">
              <div className="h-6 bg-slate-600/40 rounded w-32 mb-6 animate-pulse"></div>
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="p-3 space-y-2">
                    <div className="h-4 bg-slate-600/30 rounded animate-pulse"></div>
                    <div className="h-3 bg-slate-600/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-slate-600/20 rounded w-1/2 animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!featuredContent.length) {
    return null;
  }

  const currentContent = featuredContent[currentIndex];

  return (
    <section className="mb-16 w-full">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 w-full">
        {/* Featured Content Carousel - Left Side */}
        <div className="w-full lg:w-[65%] relative h-[280px] sm:h-[320px] lg:h-[380px] overflow-hidden rounded-xl">
          {/* Carousel Container */}
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {featuredContent.map((content, index) => (
              <div key={content.id} className="w-full flex-shrink-0 relative h-full">
                {/* Background Image */}
                <div className="absolute inset-0">
                  <img
                    src={content.imagem_background || 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'}
                    alt={content.titulo}
                    className="w-full h-full object-cover"
                  />
                  {/* Gradient Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 h-full flex items-center">
                  <div className="max-w-lg px-8 sm:px-12 lg:px-16 py-6 sm:py-8">
                    {/* Tag */}
                    {content.tag && (
                      <div className="mb-3">
                        <span className="text-sm font-medium px-3 py-1.5 rounded bg-slate-600/30 text-slate-300">
                          {content.tag}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                      {content.titulo}
                    </h1>

                    {/* Description */}
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 max-w-md line-clamp-2">
                      {content.descricao}
                    </p>

                    {/* Action Button */}
                    <button
                      onClick={(e) => handleButtonClick(e, content)}
                      className="bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                    >
                      {content.nome_botao}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          {featuredContent.length > 1 && (
            <>
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-all duration-200 z-20"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Dots Indicator */}
          {featuredContent.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
              {featuredContent.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* News Section - Right Side */}
        <div className="w-full lg:w-[35%] h-[280px] sm:h-[320px] lg:h-[380px] bg-[#1f1d2b]/90 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 sm:p-8 flex flex-col">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-3">Últimas Notícias</h2>
            <div className="w-16 h-1.5 bg-[#ff7551] rounded-full"></div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto scrollbar-hide">
            {newsItems.map((news, index) => (
              <div 
                key={news.id} 
                className="group cursor-pointer p-3 sm:p-4 rounded-lg hover:bg-slate-700/20 transition-all duration-200 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <h3 className="text-white text-sm sm:text-base font-medium leading-snug mb-2 group-hover:text-[#ff7551] transition-colors line-clamp-2">
                  {news.title}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-xs sm:text-sm">
                    {formatDate(news.date)}
                  </span>
                  <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 bg-[#ff7551] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            ))}
          </div>

          {/* View All News Button */}
          <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-slate-700/30 flex-shrink-0">
            <button className="w-full text-center text-[#ff7551] hover:text-[#ff7551]/80 text-sm sm:text-base font-medium transition-colors">
              Ver todas as notícias →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;