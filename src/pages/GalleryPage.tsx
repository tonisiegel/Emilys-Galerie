import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { Gallery, Photo, MarkerColor } from '../types';
import { fetchGalleryBySlug, fetchGalleryPhotos } from '../lib/mockData';
import { useVisitor } from '../hooks/useVisitor';
import { PhotoGrid } from '../components/gallery/PhotoGrid';
import { Lightbox } from '../components/gallery/Lightbox';
import { GalleryHeader } from '../components/gallery/GalleryHeader';
import { MarkerLegend } from '../components/gallery/MarkerLegend';
import { Loader2, AlertCircle } from 'lucide-react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

export function GalleryPage() {
  const { slug } = useParams<{ slug: string }>();
  const { visitor } = useVisitor();
  
  const [gallery, setGallery] = useState<Gallery | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null);
  const [filterMarker, setFilterMarker] = useState<MarkerColor | null>(null);
  const [downloading, setDownloading] = useState(false);

  // Load gallery and photos
  useEffect(() => {
    async function loadGallery() {
      if (!slug) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const galleryData = await fetchGalleryBySlug(slug);
        if (!galleryData) {
          setError('Galerie nicht gefunden');
          return;
        }
        
        setGallery(galleryData);
        
        const photosData = await fetchGalleryPhotos(galleryData.id);
        setPhotos(photosData);
      } catch (err) {
        setError('Fehler beim Laden der Galerie');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    
    loadGallery();
  }, [slug]);

  // Filter photos by marker
  const filteredPhotos = useMemo(() => {
    if (!filterMarker) return photos;
    return photos.filter(p => p.markers.some(m => m.color === filterMarker));
  }, [photos, filterMarker]);

  // Toggle marker on photo
  function handleToggleMarker(photoId: string, color: MarkerColor) {
    if (!visitor) return;
    
    setPhotos(prev => prev.map(photo => {
      if (photo.id !== photoId) return photo;
      
      const existingMarkerIndex = photo.markers.findIndex(m => m.visitorId === visitor.id);
      const existingMarker = existingMarkerIndex >= 0 ? photo.markers[existingMarkerIndex] : null;
      
      let newMarkers = [...photo.markers];
      
      if (existingMarker?.color === color) {
        // Remove marker
        newMarkers.splice(existingMarkerIndex, 1);
      } else if (existingMarkerIndex >= 0) {
        // Update existing marker
        newMarkers[existingMarkerIndex] = {
          ...existingMarker!,
          color,
          markedAt: new Date(),
        };
      } else {
        // Add new marker
        newMarkers.push({
          visitorId: visitor.id,
          visitorName: visitor.name,
          color,
          markedAt: new Date(),
        });
      }
      
      return { ...photo, markers: newMarkers };
    }));
    
    // TODO: Save to Firebase
  }

  // Download photos as ZIP
  async function downloadPhotos(photosToDownload: Photo[]) {
    if (photosToDownload.length === 0) return;
    
    setDownloading(true);
    
    try {
      if (photosToDownload.length === 1) {
        // Single photo - direct download
        const response = await fetch(photosToDownload[0].url);
        const blob = await response.blob();
        saveAs(blob, photosToDownload[0].originalName);
      } else {
        // Multiple photos - create ZIP
        const zip = new JSZip();
        
        await Promise.all(
          photosToDownload.map(async (photo, index) => {
            try {
              const response = await fetch(photo.url);
              const blob = await response.blob();
              zip.file(photo.originalName || `foto_${index + 1}.jpg`, blob);
            } catch (err) {
              console.error(`Failed to download ${photo.originalName}`, err);
            }
          })
        );
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `${gallery?.title || 'galerie'}.zip`);
      }
    } catch (err) {
      console.error('Download error:', err);
      alert('Fehler beim Herunterladen. Bitte versuche es erneut.');
    } finally {
      setDownloading(false);
      setSelectedPhotos(new Set());
    }
  }

  function handleDownloadSelected() {
    const selected = photos.filter(p => selectedPhotos.has(p.id));
    downloadPhotos(selected);
  }

  function handleDownloadAll() {
    downloadPhotos(photos);
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-sage-500 mx-auto mb-4" />
          <p className="text-sage-600">Galerie wird geladen...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !gallery) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h1 className="text-xl font-medium text-sage-800 mb-2">
            {error || 'Galerie nicht gefunden'}
          </h1>
          <p className="text-sage-600">
            Der Link ist möglicherweise abgelaufen oder ungültig.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <GalleryHeader
          gallery={gallery}
          selectedCount={selectedPhotos.size}
          onDownloadSelected={handleDownloadSelected}
          onDownloadAll={handleDownloadAll}
        />

        {gallery.allowMarking && (
          <MarkerLegend
            availableMarkers={gallery.availableMarkers}
            photos={photos}
            filterMarker={filterMarker}
            onFilterChange={setFilterMarker}
          />
        )}

        <PhotoGrid
          photos={filteredPhotos}
          allowMarking={gallery.allowMarking}
          allowDownload={gallery.allowDownload}
          availableMarkers={gallery.availableMarkers}
          visitorId={visitor?.id || ''}
          onPhotoClick={setLightboxPhoto}
          onToggleMarker={handleToggleMarker}
        />

        {/* Lightbox */}
        {lightboxPhoto && (
          <Lightbox
            photo={lightboxPhoto}
            photos={filteredPhotos}
            allowDownload={gallery.allowDownload}
            allowMarking={gallery.allowMarking}
            availableMarkers={gallery.availableMarkers}
            visitorId={visitor?.id || ''}
            onClose={() => setLightboxPhoto(null)}
            onNavigate={setLightboxPhoto}
            onToggleMarker={handleToggleMarker}
          />
        )}

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
    </div>
  );
}
