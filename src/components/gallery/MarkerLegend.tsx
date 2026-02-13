import type { MarkerColor, Photo } from '../../types';
import { MARKER_COLORS } from '../../types';
import { Filter } from 'lucide-react';

interface MarkerLegendProps {
  availableMarkers: MarkerColor[];
  photos: Photo[];
  filterMarker: MarkerColor | null;
  onFilterChange: (marker: MarkerColor | null) => void;
}

export function MarkerLegend({
  availableMarkers,
  photos,
  filterMarker,
  onFilterChange,
}: MarkerLegendProps) {
  if (availableMarkers.length === 0) return null;

  // Count markers
  function getMarkerCount(color: MarkerColor): number {
    return photos.filter(p => p.markers.some(m => m.color === color)).length;
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-sand-100 mb-6">
      <div className="flex items-center gap-2 text-sage-600 mb-3">
        <Filter className="w-4 h-4" />
        <span className="text-sm font-medium">Markierungen filtern</span>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onFilterChange(null)}
          className={`
            px-3 py-1.5 rounded-full text-sm transition-colors
            ${filterMarker === null 
              ? 'bg-sage-600 text-white' 
              : 'bg-sand-100 text-sage-700 hover:bg-sand-200'
            }
          `}
        >
          Alle ({photos.length})
        </button>
        
        {availableMarkers.map((color) => {
          const config = MARKER_COLORS[color];
          const count = getMarkerCount(color);
          const isActive = filterMarker === color;
          
          return (
            <button
              key={color}
              onClick={() => onFilterChange(isActive ? null : color)}
              className={`
                px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-colors
                ${isActive 
                  ? 'bg-sage-600 text-white' 
                  : 'bg-sand-100 text-sage-700 hover:bg-sand-200'
                }
              `}
            >
              <span className={`w-3 h-3 rounded-full ${config.bgClass}`} />
              {config.label} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
}
