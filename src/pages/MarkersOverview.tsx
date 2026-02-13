import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import type { Photo, MarkerColor } from '../types';
import { MARKER_COLORS } from '../types';
import { fetchGalleryPhotos, mockGalleries } from '../lib/mockData';
import {
  Camera, ArrowLeft, Download, Filter, Loader2,
  CheckCircle2, User, Calendar
} from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function MarkersOverview() {
  const { id } = useParams<{ id: string }>();
  
  const [galleryTitle, setGalleryTitle] = useState('');
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterColor, setFilterColor] = useState<MarkerColor | 'all'>('all');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      
      try {
        const gallery = mockGalleries.find(g => g.id === id);
        if (gallery) {
          setGalleryTitle(gallery.title);
          const photosData = await fetchGalleryPhotos(id);
          setPhotos(photosData);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  // Get photos with markers
  const markedPhotos = photos.filter(p => p.markers.length > 0);
  
  // Filter by color
  const filteredPhotos = filterColor === 'all'
    ? markedPhotos
    : markedPhotos.filter(p => p.markers.some(m => m.color === filterColor));

  // Count by color
  function getColorCount(color: MarkerColor): number {
    return markedPhotos.filter(p => p.markers.some(m => m.color === color)).length;
  }

  // Get unique colors in this gallery
  const usedColors = Array.from(
    new Set(markedPhotos.flatMap(p => p.markers.map(m => m.color)))
  ).filter(c => c !== 'none') as MarkerColor[];

  // Download marked photos
  async function downloadMarked(color?: MarkerColor) {
    const photosToDownload = color
      ? markedPhotos.filter(p => p.markers.some(m => m.color === color))
      : markedPhotos;
    
    if (photosToDownload.length === 0) return;

    setDownloading(true);
    
    try {
      const zip = new JSZip();
      const colorLabel = color ? MARKER_COLORS[color].label : 'Alle';
      
      await Promise.all(
        photosToDownload.map(async (photo) => {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          zip.file(photo.originalName, blob);
        })
      );

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${galleryTitle}-${colorLabel}-Markiert.zip`);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-sage-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-sand-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-sand-100 text-sage-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2 text-sage-600">
                <Camera className="w-5 h-5" />
                <span className="font-medium">Markierungen</span>
              </div>
              <p className="text-sm text-sage-400">{galleryTitle}</p>
            </div>
          </div>

          {markedPhotos.length > 0 && (
            <button
              onClick={() => downloadMarked()}
              disabled={downloading}
              className="btn-primary flex items-center gap-2"
            >
              {downloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Alle markierten ({markedPhotos.length})
            </button>
          )}
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {markedPhotos.length === 0 ? (
          <div className="card p-12 text-center">
            <CheckCircle2 className="w-16 h-16 mx-auto text-sage-300 mb-4" />
            <h2 className="text-xl font-medium text-sage-700 mb-2">
              Noch keine Markierungen
            </h2>
            <p className="text-sage-500">
              Sobald Besucher Fotos markieren, siehst du sie hier.
            </p>
          </div>
        ) : (
          <>
            {/* Filter Bar */}
            <div className="card p-4 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2 text-sage-600">
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filter:</span>
                </div>
                
                <button
                  onClick={() => setFilterColor('all')}
                  className={`
                    px-3 py-1.5 rounded-full text-sm transition-colors
                    ${filterColor === 'all'
                      ? 'bg-sage-600 text-white'
                      : 'bg-sand-100 text-sage-700 hover:bg-sand-200'
                    }
                  `}
                >
                  Alle ({markedPhotos.length})
                </button>

                {usedColors.map((color) => {
                  const config = MARKER_COLORS[color];
                  const count = getColorCount(color);
                  
                  return (
                    <button
                      key={color}
                      onClick={() => setFilterColor(color)}
                      className={`
                        px-3 py-1.5 rounded-full text-sm flex items-center gap-2 transition-colors
                        ${filterColor === color
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

                {filterColor !== 'all' && (
                  <button
                    onClick={() => downloadMarked(filterColor)}
                    disabled={downloading}
                    className="ml-auto btn-secondary text-sm flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    {MARKER_COLORS[filterColor].label} herunterladen
                  </button>
                )}
              </div>
            </div>

            {/* Photos Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="card overflow-hidden">
                  <div className="aspect-square bg-sand-100">
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={photo.originalName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="p-3">
                    {/* Markers */}
                    <div className="space-y-2">
                      {photo.markers.map((marker, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <span 
                            className={`w-3 h-3 rounded-full flex-shrink-0 ${MARKER_COLORS[marker.color].bgClass}`} 
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1 text-sage-700">
                              <User className="w-3 h-3" />
                              <span className="truncate">
                                {marker.visitorName || 'Anonym'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1 text-sage-400 text-xs">
                              <Calendar className="w-3 h-3" />
                              {formatDate(marker.markedAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Download overlay */}
      {downloading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 text-center">
            <Loader2 className="w-8 h-8 animate-spin text-sage-500 mx-auto mb-4" />
            <p className="text-sage-700">Fotos werden vorbereitet...</p>
          </div>
        </div>
      )}
    </div>
  );
}
