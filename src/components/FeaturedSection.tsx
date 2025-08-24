import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronLeft, ChevronRight, Calendar, Clock, MapPin, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { featuredContentService, type FeaturedContent } from '../lib/database';

interface FeaturedSectionProps {
  onVideoSelect: (video: any) => void;
  onViewChange?: (view: string) => void;
}

interface UpcomingEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  duration: string;
  link: string;
  type: 'live' | 'workshop' | 'webinar';
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ onVideoSelect, onViewChange = () => {} }) => {
  const navigate = useNavigate();
  const [featuredContent, setFeaturedContent] = React.useState<FeaturedContent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = React.useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Mock data for upcoming events
  const upcomingEvents: UpcomingEvent[] = [
    {
      id: '1',
      title: 'TypeScript na Prática',
      description: 'Workshop completo sobre TypeScript avançado com projetos reais',
      date: '2024-01-25',
      time: '20:00',
      duration: '2h',
      link: 'https://meet.google.com/abc-defg-hij',
      type: 'workshop'
    },
    {
      id: '2',
      title: 'React Server Components',
      description: 'Live sobre as novidades do React 18 e Server Components',
      date: '2024-01-28',
      time: '19:30',
      duration: '1h30',
      link: 'https://youtube.com/live/example',
      type: 'live'
    },
    {
      id: '3',
      title: 'Design System com Figma',
      description: 'Webinar sobre criação de design systems escaláveis',
      date: '2024-02-02',
      time: '18:00',
      duration: '1h',
      link: 'https://zoom.us/j/example',
      type: 'webinar'
    }
  ];
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

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getEventTypeConfig = (type: string) => {
    switch (type) {
      case 'live':
        return { color: 'bg-red-500', label: 'Live' };
      case 'workshop':
        return { color: 'bg-blue-500', label: 'Workshop' };
      case 'webinar':
        return { color: 'bg-purple-500', label: 'Webinar' };
      default:
        return { color: 'bg-gray-500', label: 'Evento' };
    }
  };

  const addAllEventsToCalendar = () => {
    const calendarUrl = 'https://calendar.google.com/calendar/render?action=TEMPLATE';
    const events = upcomingEvents.map(event => {
      const startDate = new Date(`${event.date}T${event.time}:00`);
      const endDate = new Date(startDate.getTime() + (parseInt(event.duration) * 60 * 60 * 1000));
      
      return `&text=${encodeURIComponent(event.title)}&dates=${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z&details=${encodeURIComponent(event.description + '\n\nLink: ' + event.link)}`;
    }).join('');
    
    window.open(calendarUrl + events, '_blank');
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

        {/* Upcoming Events - Right Side */}
        <div className="w-full lg:w-[35%] h-[280px] sm:h-[320px] lg:h-[380px]">
          <div className="bg-[#1f1d2b]/90 backdrop-blur-sm border border-slate-700/30 rounded-xl p-6 h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-[#ff7551]/20 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#ff7551]" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Próximos Eventos</h3>
                <p className="text-slate-400 text-sm">Não perca nenhuma live!</p>
              </div>
            </div>

            {/* Events List */}
            <div className="flex-1 space-y-4 overflow-y-auto">
              {upcomingEvents.map((event, index) => {
                const typeConfig = getEventTypeConfig(event.type);
                return (
                  <div
                    key={event.id}
                    className="group cursor-pointer animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                    onClick={() => window.open(event.link, '_blank')}
                  >
                    <div className="bg-slate-700/30 hover:bg-slate-600/30 border border-slate-600/30 rounded-lg p-4 transition-all duration-200 hover:scale-[1.02]">
                      {/* Event Header */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full text-white font-medium ${typeConfig.color}`}>
                              {typeConfig.label}
                            </span>
                          </div>
                          <h4 className="text-white font-medium text-sm leading-tight group-hover:text-[#ff7551] transition-colors">
                            {event.title}
                          </h4>
                        </div>
                        <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-[#ff7551] transition-colors flex-shrink-0 ml-2" />
                      </div>

                      {/* Event Details */}
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-xs text-slate-400">
                          <Clock className="w-3 h-3" />
                          <span>{event.time} • {event.duration}</span>
                        </div>
                      </div>

                      {/* Event Description */}
                      <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add to Calendar Button */}
            <div className="mt-4 pt-4 border-t border-slate-600/30">
              <button
                onClick={addAllEventsToCalendar}
                className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-[#ff7551] hover:bg-[#ff7551]/80 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm">Adicionar ao Google Calendar</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;