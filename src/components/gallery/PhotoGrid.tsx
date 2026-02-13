import { useState } from 'react';
import type { Photo, MarkerColor } from '../../types';
import { MARKER_COLORS } from '../../types';
import { Check, Download, ZoomIn } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
  allowMarking: boolean;
  allowDownload: boolean;
  availableMarkers: MarkerColor[];
  visitorId: string;
  onPhotoClick: (photo: Photo) => void;
  onToggleMarker: (photoId: string, color: MarkerColor) => void;
  onToggleSelect: (photoId: string) => void;
  selectedPhotos: Set<string>;
}

export function PhotoGrid({
  photos,
  allowMarking,
  allowDownload,
  availableMarkers,
  visitorId,
  onPhotoClick,
  onToggleMarker,
  onToggleSelect,
  selectedPhotos,
}: PhotoGridProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);

  function getVisitorMarker(photo: Photo): MarkerColor {
    const marker = photo.markers.find(m => m.visitorId === visitorId);
    return marker?.color || 'none';
  }

  function getAllMarkers(photo: Photo): MarkerColor[] {
    return photo.markers.map(m => m.color).filter(c => c !== 'none');
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
      {photos.map((photo) => {
        const isHovered = hoveredPhoto === photo.id;
        const isSelected = selectedPhotos.has(photo.id);
        const visitorMarker = getVisitorMarker(photo);
        const allMarkers = getAllMarkers(photo);

        return (
          <div
            key={photo.id}
            className={`
              photo-item relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer
              bg-sand-100 group
              ${isSelected ? 'ring-2 ring-sage-500 ring-offset-2' : ''}
            `}
            onMouseEnter={() => setHoveredPhoto(photo.id)}
            onMouseLeave={() => setHoveredPhoto(null)}
          >
            {/* Photo */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.originalName}
              className="w-full h-full object-cover"
              loading="lazy"
              onClick={() => onPhotoClick(photo)}
            />

            {/* Markers display (always visible if present) */}
            {allMarkers.length > 0 && (
              <div className="absolute top-2 right-2 flex gap-1">
                {allMarkers.map((color, idx) => (
                  <div
                    key={idx}
                    className={`w-3 h-3 rounded-full border-2 ${MARKER_COLORS[color].bgClass} ${MARKER_COLORS[color].borderClass}`}
                  />
                ))}
              </div>
            )}

            {/* Hover overlay */}
            <div
              className={`
                absolute inset-0 bg-black/40 flex items-end justify-between p-2
                transition-opacity duration-200
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {/* Selection checkbox */}
              {allowDownload && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(photo.id);
                  }}
                  className={`
                    w-6 h-6 rounded border-2 flex items-center justify-center
                    transition-colors duration-150
                    ${isSelected 
                      ? 'bg-sage-500 border-sage-500 text-white' 
                      : 'bg-white/80 border-white hover:border-sage-300'
                    }
                  `}
                >
                  {isSelected && <Check className="w-4 h-4" />}
                </button>
              )}

              {/* Action buttons */}
              <div className="flex gap-1">
                {/* Zoom button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPhotoClick(photo);
                  }}
                  className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sage-700"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>

                {/* Download button */}
                {allowDownload && (
                  <a
                    href={photo.url}
                    download={photo.originalName}
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sage-700"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Marker selection (bottom, on hover) */}
            {allowMarking && isHovered && availableMarkers.length > 0 && (
              <div 
                className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-center gap-2">
                  {availableMarkers.map((color) => {
                    const config = MARKER_COLORS[color];
                    const isActive = visitorMarker === color;
                    
                    return (
                      <button
                        key={color}
                        onClick={() => onToggleMarker(photo.id, color)}
                        className={`
                          w-7 h-7 rounded-full border-2 transition-transform
                          ${config.bgClass} ${config.borderClass}
                          ${isActive ? 'scale-110 ring-2 ring-white' : 'hover:scale-110'}
                        `}
                        title={config.label}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
