import React, { useState, useEffect, useRef } from 'react';
import { Play } from 'lucide-react';

interface LazyVideoThumbnailProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
}

const LazyVideoThumbnail: React.FC<LazyVideoThumbnailProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = '2/3',
  onLoad,
  onError,
  priority = false
}) => {
  const [imageState, setImageState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [isIntersecting, setIsIntersecting] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (priority) {
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsIntersecting(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: '50px',
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [priority]);

  const handleImageLoad = () => {
    setImageState('loaded');
    onLoad?.();
  };

  const handleImageError = () => {
    setImageState('error');
    onError?.();
  };

  const getOptimizedUrl = (url: string, size: 'thumbnail' | 'full' = 'full') => {
    if (!url) {
      return 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=320&h=480&fit=crop';
    }

    try {
      const urlObj = new URL(url);

      urlObj.searchParams.delete('width');
      urlObj.searchParams.delete('height');
      urlObj.searchParams.delete('quality');
      urlObj.searchParams.delete('resize');
      urlObj.searchParams.delete('format');

      if (size === 'thumbnail') {
        urlObj.searchParams.set('width', '20');
        urlObj.searchParams.set('height', '30');
        urlObj.searchParams.set('quality', '10');
      } else {
        urlObj.searchParams.set('width', '320');
        urlObj.searchParams.set('height', '480');
        urlObj.searchParams.set('quality', '80');
      }
      urlObj.searchParams.set('format', 'webp');

      return urlObj.toString();
    } catch (e) {
      return 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=320&h=480&fit=crop';
    }
  };

  const thumbnailUrl = getOptimizedUrl(src, 'thumbnail');
  const fullUrl = getOptimizedUrl(src, 'full');

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ aspectRatio }}
    >
      {imageState === 'loading' && (
        <div className="absolute inset-0 bg-slate-800/60 animate-pulse">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/20 to-transparent animate-shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-3 border-slate-600/30 border-t-slate-500/50 rounded-full animate-spin" />
          </div>
        </div>
      )}

      {isIntersecting && imageState !== 'error' && (
        <>
          <img
            src={thumbnailUrl}
            alt={alt}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
              imageState === 'loaded' ? 'opacity-0' : 'opacity-100 blur-lg scale-110'
            }`}
            aria-hidden="true"
          />

          <img
            ref={imgRef}
            src={fullUrl}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            onLoad={handleImageLoad}
            onError={handleImageError}
            className={`${className} w-full h-full object-cover transition-all duration-500 ${
              imageState === 'loaded'
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-105'
            }`}
          />
        </>
      )}

      {imageState === 'error' && (
        <div className="absolute inset-0 bg-gradient-to-br from-slate-700 to-slate-800 flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-slate-600/30 rounded-full flex items-center justify-center mb-3">
            <Play className="w-8 h-8 text-slate-400" fill="currentColor" />
          </div>
          <p className="text-slate-400 text-xs text-center px-4">Imagem indisponível</p>
        </div>
      )}
    </div>
  );
};

export default LazyVideoThumbnail;
