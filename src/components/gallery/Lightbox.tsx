import { useEffect, useCallback } from 'react';
import type { Photo, MarkerColor } from '../../types';
import { MARKER_COLORS } from '../../types';
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react';

interface LightboxProps {
  photo: Photo;
  photos: Photo[];
  allowDownload: boolean;
  allowMarking: boolean;
  availableMarkers: MarkerColor[];
  visitorId: string;
  onClose: () => void;
  onNavigate: (photo: Photo) => void;
  onToggleMarker: (photoId: string, color: MarkerColor) => void;
}

export function Lightbox({
  photo,
  photos,
  allowDownload,
  allowMarking,
  availableMarkers,
  visitorId,
  onClose,
  onNavigate,
  onToggleMarker,
}: LightboxProps) {
  const currentIndex = photos.findIndex(p => p.id === photo.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  const visitorMarker = photo.markers.find(m => m.visitorId === visitorId)?.color || 'none';

  const goToPrev = useCallback(() => {
    if (hasPrev) {
      onNavigate(photos[currentIndex - 1]);
    }
  }, [currentIndex, hasPrev, photos, onNavigate]);

  const goToNext = useCallback(() => {
    if (hasNext) {
      onNavigate(photos[currentIndex + 1]);
    }
  }, [currentIndex, hasNext, photos, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case 'ArrowRight':
          goToNext();
          break;
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [onClose, goToPrev, goToNext]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-4">
          <span className="text-sm text-white/70">
            {currentIndex + 1} / {photos.length}
          </span>
          <span className="text-sm">{photo.originalName}</span>
        </div>

        <div className="flex items-center gap-2">
          {allowDownload && (
            <a
              href={photo.url}
              download={photo.originalName}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              title="Herunterladen"
            >
              <Download className="w-5 h-5" />
            </a>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div className="flex-1 flex items-center justify-center relative min-h-0 px-16">
        {/* Previous button */}
        {hasPrev && (
          <button
            onClick={goToPrev}
            className="absolute left-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
        )}

        {/* Image */}
        <img
          src={photo.url}
          alt={photo.originalName}
          className="max-h-full max-w-full object-contain"
        />

        {/* Next button */}
        {hasNext && (
          <button
            onClick={goToNext}
            className="absolute right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        )}
      </div>

      {/* Footer with markers */}
      {allowMarking && availableMarkers.length > 0 && (
        <div className="p-4 flex justify-center">
          <div className="flex items-center gap-3 bg-white/10 rounded-full px-4 py-2">
            <span className="text-white/70 text-sm mr-2">Markieren:</span>
            {availableMarkers.map((color) => {
              const config = MARKER_COLORS[color];
              const isActive = visitorMarker === color;
              
              return (
                <button
                  key={color}
                  onClick={() => onToggleMarker(photo.id, color)}
                  className={`
                    w-8 h-8 rounded-full border-2 transition-all
                    ${config.bgClass} ${config.borderClass}
                    ${isActive ? 'scale-110 ring-2 ring-white' : 'hover:scale-110'}
                  `}
                  title={config.label}
                />
              );
            })}
            {visitorMarker !== 'none' && (
              <button
                onClick={() => onToggleMarker(photo.id, visitorMarker)}
                className="ml-2 text-white/70 text-sm hover:text-white"
              >
                Entfernen
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
