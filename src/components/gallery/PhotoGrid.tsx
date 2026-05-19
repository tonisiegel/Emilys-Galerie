import { useState } from 'react';
import type { Photo, MarkerColor } from '../../types';
import { Download, ZoomIn, Bookmark } from 'lucide-react';

interface PhotoGridProps {
  photos: Photo[];
  allowMarking: boolean;
  allowDownload: boolean;
  availableMarkers: MarkerColor[];
  visitorId: string;
  onPhotoClick: (photo: Photo) => void;
  onToggleMarker: (photoId: string, color: MarkerColor) => void;
}

// Marker Labels
const MARKER_LABELS: Record<MarkerColor, string> = {
  none: '',
  green: 'Ja',
  yellow: 'Vielleicht',
  red: 'Nein',
  blue: 'Favorit',
};

function BookmarkSVG({ color, size = 16 }: { color: MarkerColor; size?: number }) {
  const colorClass = 
    color === 'green' ? 'text-emerald-500' :
    color === 'yellow' ? 'text-amber-400' :
    color === 'red' ? 'text-rose-500' :
    color === 'blue' ? 'text-sky-500' :
    'text-sage-400';

  const height = Math.round(size * 1.25);

  return (
    <svg 
      width={size} 
      height={height} 
      viewBox={`0 0 ${size} ${height}`}
      className={colorClass}
    >
      <path 
        d={`M0 0 H${size} V${height - 2} L${size/2} ${height - 4} L0 ${height - 2} Z`}
        fill="currentColor"
      />
    </svg>
  );
}

export function PhotoGrid({
  photos,
  allowMarking,
  allowDownload,
  availableMarkers,
  visitorId,
  onPhotoClick,
  onToggleMarker,
}: PhotoGridProps) {
  const [hoveredPhoto, setHoveredPhoto] = useState<string | null>(null);
  const [tappedPhoto, setTappedPhoto] = useState<string | null>(null);
  const [markerMenuOpen, setMarkerMenuOpen] = useState<string | null>(null);

  function getVisitorMarker(photo: Photo): MarkerColor {
    const marker = photo.markers.find(m => m.visitorId === visitorId);
    return marker?.color || 'none';
  }

  function handleMarkerSelect(photoId: string, color: MarkerColor) {
    onToggleMarker(photoId, color);
    setMarkerMenuOpen(null);
  }

  function handlePhotoClick(photo: Photo) {
  // Tap/Click auf Bild zeigt nur Buttons, öffnet nicht Lightbox
  if (tappedPhoto === photo.id) {
    // Bereits getappt - nichts tun (Buttons sind schon sichtbar)
    return;
  }
  // Zeige Buttons
  setTappedPhoto(photo.id);
  setMarkerMenuOpen(null);
}

  // Close tapped state when clicking outside
  function handleBackgroundClick() {
    setTappedPhoto(null);
    setMarkerMenuOpen(null);
  }

  return (
    <div 
      className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4"
      onClick={handleBackgroundClick}
    >
      {photos.map((photo) => {
        const isHovered = hoveredPhoto === photo.id;
        const isTapped = tappedPhoto === photo.id;
        const isMenuOpen = markerMenuOpen === photo.id;
        const visitorMarker = getVisitorMarker(photo);
        const hasMarker = visitorMarker !== 'none';
        
        // Show buttons on hover (desktop) or tap (mobile)
        const showButtons = isHovered || isTapped;

        return (
          <div
            key={photo.id}
            className="photo-item relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer bg-sand-100 group"
            onMouseEnter={() => setHoveredPhoto(photo.id)}
            onMouseLeave={() => {
              setHoveredPhoto(null);
              setMarkerMenuOpen(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              handlePhotoClick(photo);
            }}
          >
            {/* Photo — Wasserzeichen-Vorschau bevorzugen, sonst Thumbnail, sonst Original */}
            <img
              src={photo.watermarkUrl || photo.thumbnailUrl || photo.url}
              alt={photo.originalName}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />

            {/* Bookmark Marker - wenn gesetzt und Menu nicht offen */}
            {hasMarker && !isMenuOpen && (
              <div className="absolute top-0 right-3 pointer-events-none">
                <svg 
                  width="32" 
                  height="44" 
                  viewBox="0 0 32 44" 
                  className={`drop-shadow-md ${
                    visitorMarker === 'green' ? 'text-emerald-500' :
                    visitorMarker === 'yellow' ? 'text-amber-400' :
                    visitorMarker === 'red' ? 'text-rose-500' :
                    'text-sky-500'
                  }`}
                >
                  <path 
                    d="M0 0 H32 V40 L16 32 L0 40 Z" 
                    fill="currentColor"
                  />
                </svg>
              </div>
            )}

            {/* Bottom Overlay mit Aktionen */}
            <div
              className={`
                absolute inset-x-0 bottom-0 h-16 
                bg-gradient-to-t from-black/60 to-transparent
                flex items-end justify-between p-2
                transition-opacity duration-200
                ${showButtons ? 'opacity-100' : 'opacity-0'}
              `}
            >
              {/* Zoom Button links */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPhotoClick(photo);
                }}
                className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sage-700"
              >
                <ZoomIn className="w-4 h-4" />
              </button>

              {/* Download Button rechts */}
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

            {/* Marker Button / Menu - oben rechts */}
            {allowMarking && availableMarkers.length > 0 && (showButtons || isMenuOpen) && (
              <div className="absolute top-2 right-2">
                {!isMenuOpen ? (
                  /* Bookmark Button */
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setMarkerMenuOpen(photo.id);
                    }}
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white flex items-center justify-center text-sage-600 shadow-md"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>
                ) : (
                  /* Marker Selection - ersetzt Button */
                  <div 
                    className="flex gap-1 bg-white rounded-full px-2 py-1.5 shadow-lg"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {availableMarkers.map((color) => {
                      const isActive = visitorMarker === color;
                      return (
                        <button
                          key={color}
                          onClick={() => handleMarkerSelect(photo.id, color)}
                          className={`
                            w-7 h-7 rounded-full flex items-center justify-center
                            transition-all hover:scale-110
                            ${isActive ? 'bg-sand-200' : 'hover:bg-sand-100'}
                          `}
                          title={MARKER_LABELS[color]}
                        >
                          <BookmarkSVG color={color} size={14} />
                        </button>
                      );
                    })}
                    
                    {/* X zum Schließen oder Entfernen */}
                    <button
                      onClick={() => {
                        if (hasMarker) {
                          handleMarkerSelect(photo.id, visitorMarker);
                        } else {
                          setMarkerMenuOpen(null);
                        }
                      }}
                      className="w-7 h-7 rounded-full flex items-center justify-center text-sage-400 hover:text-sage-600 hover:bg-sand-100"
                      title={hasMarker ? 'Entfernen' : 'Schließen'}
                    >
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 2 L10 10 M10 2 L2 10" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
