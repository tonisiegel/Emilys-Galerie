import type { MarkerColor, Photo } from '../../types';
import { Filter } from 'lucide-react';

interface MarkerLegendProps {
  availableMarkers: MarkerColor[];
  photos: Photo[];
  filterMarker: MarkerColor | null;
  onFilterChange: (marker: MarkerColor | null) => void;
}

function BookmarkIcon({ color, size = 14 }: { color: MarkerColor; size?: number }) {
  const colorClass = 
    color === 'green' ? 'text-emerald-500' :
    color === 'yellow' ? 'text-amber-400' :
    color === 'red' ? 'text-rose-500' :
    color === 'blue' ? 'text-sky-500' :
    'text-sage-400';

  const height = Math.round(size * 1.3);

  return (
    <svg 
      width={size} 
      height={height} 
      viewBox={`0 0 ${size} ${height}`}
      className={colorClass}
    >
      <path 
        d={`M0 0 H${size} V${height - 2} L${size/2} ${height - 5} L0 ${height - 2} Z`}
        fill="currentColor"
      />
    </svg>
  );
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
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-sage-600">
          <Filter className="w-4 h-4" />
        </div>
        
        <div className="flex items-center gap-2">
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
            const count = getMarkerCount(color);
            const isActive = filterMarker === color;
            
            return (
              <button
                key={color}
                onClick={() => onFilterChange(isActive ? null : color)}
                className={`
                  w-10 h-8 rounded-full flex items-center justify-center gap-1 transition-colors
                  ${isActive 
                    ? 'bg-sage-600' 
                    : 'bg-sand-100 hover:bg-sand-200'
                  }
                `}
                title={`${count} markiert`}
              >
                <BookmarkIcon color={color} size={12} />
                <span className={`text-xs ${isActive ? 'text-white' : 'text-sage-600'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
