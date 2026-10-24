import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Camera } from 'lucide-react';

export interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  title?: string;
}

interface MediaCarouselProps {
  items: MediaItem[];
  autoPlayInterval?: number;
  heightClass?: string;
  onCustomize?: () => void;
  showCustomizeButton?: boolean;
  customizeButtonLabel?: string;
}

export const MediaCarousel: React.FC<MediaCarouselProps> = ({
  items,
  autoPlayInterval = 4000,
  heightClass = 'h-56 sm:h-72 md:h-80 lg:h-[380px] max-h-[55vh]',
  onCustomize,
  showCustomizeButton = false,
  customizeButtonLabel = 'Gerenciar Mídias',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (items.length <= 1 || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, autoPlayInterval);

    return () => clearInterval(timer);
  }, [items.length, autoPlayInterval, isPaused]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  return (
    <div 
      className={`relative w-full ${heightClass} rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl group`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Media Display */}
      <div className="absolute inset-0 w-full h-full">
        {currentItem.type === 'video' ? (
          <video 
            src={currentItem.url} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <img 
            src={currentItem.url} 
            alt={currentItem.title || 'Carrossel L\'Élite'} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
      </div>

      {/* Customize / Manage Button */}
      {showCustomizeButton && onCustomize && (
        <button
          onClick={onCustomize}
          className="absolute top-4 right-4 z-30 px-3 py-2 bg-slate-900/90 hover:bg-slate-900 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg backdrop-blur-md transition-all opacity-80 hover:opacity-100"
        >
          <Camera className="w-4 h-4" />
          <span>{customizeButtonLabel}</span>
        </button>
      )}

      {/* Title Overlay */}
      {currentItem.title && (
        <div className="absolute bottom-16 left-6 right-6 z-20">
          <p className="text-white font-extrabold text-lg sm:text-xl drop-shadow-md">{currentItem.title}</p>
        </div>
      )}

      {/* Navigation Arrows */}
      {items.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white border border-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-slate-950/60 hover:bg-slate-950/90 text-white border border-slate-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            title="Próximo"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      {/* Indicators Dots */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2">
        {items.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all rounded-full ${idx === currentIndex ? 'w-6 h-2 bg-amber-400' : 'w-2 h-2 bg-white/50 hover:bg-white'}`}
            title={`Slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
