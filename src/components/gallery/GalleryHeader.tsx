import type { Gallery } from '../../types';
import { Camera, Download, Images } from 'lucide-react';

interface GalleryHeaderProps {
  gallery: Gallery;
  selectedCount: number;
  onDownloadSelected: () => void;
  onDownloadAll: () => void;
}

export function GalleryHeader({
  gallery,
  selectedCount,
  onDownloadSelected,
  onDownloadAll,
}: GalleryHeaderProps) {
  function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    if (bytes < 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }

  return (
    <div className="mb-8">
      {/* Logo / Branding */}
      <div className="flex items-center gap-2 text-sage-600 mb-6">
        <Camera className="w-6 h-6" />
        <span className="font-serif text-xl">Emily's Galerie</span>
      </div>

      {/* Gallery title */}
      <h1 className="font-serif text-3xl md:text-4xl text-sage-800 mb-4">
        {gallery.title}
      </h1>

      {/* Welcome text */}
      {gallery.welcomeText && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-sand-100 mb-6">
          <p className="text-sage-700 whitespace-pre-line leading-relaxed">
            {gallery.welcomeText}
          </p>
        </div>
      )}

      {/* Stats and actions bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4 text-sm text-sage-600">
          <span className="flex items-center gap-1.5">
            <Images className="w-4 h-4" />
            {gallery.photoCount} Fotos
          </span>
          <span>•</span>
          <span>{formatSize(gallery.totalSize)}</span>
        </div>

        {gallery.allowDownload && (
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-3">
              {selectedCount > 0 && (
                <button
                  onClick={onDownloadSelected}
                  className="btn-secondary flex items-center gap-2 text-sm"
                  title="Ausgewählte Fotos in Originalqualität herunterladen"
                >
                  <Download className="w-4 h-4" />
                  {selectedCount} ausgewählte
                </button>
              )}
              <button
                onClick={onDownloadAll}
                className="btn-primary flex items-center gap-2 text-sm"
                title="Alle Fotos in Originalqualität herunterladen"
              >
                <Download className="w-4 h-4" />
                Alle herunterladen
              </button>
            </div>
            <p className="text-xs text-sage-500">
              Fotos werden in Originalqualität heruntergeladen
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
