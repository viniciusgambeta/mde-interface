import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, MessageCircle, Calendar, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { featuredContentService, type FeaturedContent } from '../lib/database';

interface FeaturedSectionProps {
  onVideoSelect: (video: any) => void;
  onViewChange?: (view: string) => void;
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ onVideoSelect, onViewChange = () => {} }) => {
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

  const handleWhatsAppClick = () => {
    window.open('https://chat.whatsapp.com/example', '_blank', 'noopener,noreferrer');
  };

  const handleCalendarClick = () => {
    const calendarUrl = 'https://calendar.google.com/calendar/u/0?cid=example@group.calendar.google.com';
    window.open(calendarUrl, '_blank', 'noopener,noreferrer');
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
          
          {/* Right Side Skeleton */}
          <div className="w-full lg:w-[35%] h-[280px] sm:h-[320px] lg:h-[380px] bg-slate-700/30 rounded-xl p-6 relative overflow-hidden">
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer"></div>
            
            {/* Content skeleton */}
            <div className="relative z-10">
              <div className="h-6 bg-slate-600/40 rounded w-32 mb-6 animate-pulse"></div>
              <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, index) => (
                  <div key={index} className="p-3 space-y-2">
                    <div className="h-6 bg-slate-600/30 rounded animate-pulse"></div>
                    <div className="h-4 bg-slate-600/20 rounded w-3/4 animate-pulse"></div>
                    <div className="h-10 bg-slate-600/30 rounded animate-pulse"></div>
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
                    <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-4 sm:mb-5 max-w-md line-clamp-3">
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
                className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-[#ff7551] flex items-center justify-center transition-all duration-200 z-20"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 text-white hover:text-[#ff7551] flex items-center justify-center transition-all duration-200 z-20"
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

        {/* Action Blocks - Right Side */}
        <div className="w-full lg:w-[35%] h-[280px] sm:h-[320px] lg:h-[380px]">
          <div className="h-full flex flex-col space-y-4">
            {/* WhatsApp Block */}
            <div className="flex-1 bg-[#1f1d2b]/90 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                 onClick={handleWhatsAppClick}>
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-500/30 transition-colors">
                <MessageCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2 group-hover:text-green-400 transition-colors">
                Entre no Grupo
              </h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Participe da nossa comunidade no WhatsApp e receba dicas exclusivas
              </p>
              <div className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Entrar no WhatsApp</span>
            {/* Calendar Block */}
            <div className="flex-1 bg-[#1f1d2b]/90 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 flex flex-col justify-center items-center text-center group hover:scale-[1.02] transition-all duration-200 cursor-pointer"
                 onClick={handleCalendarClick}>
              <div className="w-16 h-16 bg-[#ff7551]/20 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#ff7551]/30 transition-colors">
                <Calendar className="w-8 h-8 text-[#ff7551]" />
              </div>
              <h3 className="text-white font-semibold text-xl mb-2 group-hover:text-[#ff7551] transition-colors">
                Adicionar Eventos
              </h3>
              <p className="text-slate-400 text-sm mb-4 leading-relaxed">
                Adicione nossos eventos à sua agenda do Google Calendar
              </p>
              <div className="w-full bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Adicionar ao Calendário</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;