import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Photo, MarkerColor } from '../types';
import {
  getGallery,
  getGalleryPhotos,
  createGallery,
  updateGallery,
  addPhoto as addPhotoToFirestore,
  deletePhoto as deletePhotoFromFirestore,
  updatePhotoOrder,
  getWebsiteContent,
} from '../lib/firestoreService';
import { uploadPhoto, deletePhotoFile, createWatermarkedPreview, deleteR2FileByUrl } from '../lib/uploadService';
import {
  Camera, ArrowLeft, Save, Upload, X,
  Image, Loader2, Check, AlertCircle, Eye,
  GripVertical, ArrowUpDown, Star
} from 'lucide-react';

// Generate random secure slug
function generateSlug(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Sortable Photo Item Component
interface SortablePhotoProps {
  photo: Photo;
  onRemove: (id: string) => void;
  isCover: boolean;
  onToggleCover: (id: string) => void;
  coverIndex: number;
}

function SortablePhoto({ photo, onRemove, isCover, onToggleCover, coverIndex }: SortablePhotoProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square rounded-lg overflow-hidden group bg-sand-100 ${
        isCover ? 'ring-2 ring-amber-400 ring-offset-2' : ''
      }`}
    >
      <img
        src={photo.thumbnailUrl || photo.url}
        alt={photo.originalName}
        className="w-full h-full object-cover"
      />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-1 left-1 w-6 h-6 bg-black/50 hover:bg-black/70 rounded cursor-grab
                   flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Cover Badge */}
      {isCover && (
        <div className="absolute top-1 left-8 bg-amber-400 text-amber-900 text-xs font-medium px-1.5 py-0.5 rounded">
          Cover {coverIndex + 1}
        </div>
      )}

      {/* Cover Toggle Button */}
      <button
        onClick={() => onToggleCover(photo.id)}
        className={`absolute top-9 right-1 w-6 h-6 rounded-full flex items-center justify-center
                   transition-all ${
                     isCover
                       ? 'bg-amber-400 text-amber-900'
                       : 'bg-black/50 hover:bg-amber-400 hover:text-amber-900 text-white opacity-0 group-hover:opacity-100'
                   }`}
        title={isCover ? 'Aus Cover entfernen' : 'Als Cover verwenden'}
      >
        <Star className="w-3.5 h-3.5" fill={isCover ? 'currentColor' : 'none'} />
      </button>

      {/* Delete button */}
      <button
        onClick={() => onRemove(photo.id)}
        className="absolute top-1 right-1 w-6 h-6 bg-black/50 hover:bg-rose-500 rounded-full 
                   flex items-center justify-center text-white opacity-0 group-hover:opacity-100 
                   transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Markers indicator */}
      {photo.markers.length > 0 && (
        <div className="absolute top-0 right-8 flex gap-0.5">
          {photo.markers.slice(0, 3).map((marker, idx) => {
            const colorClass = marker.color === 'green' ? 'text-emerald-500' : marker.color === 'yellow' ? 'text-amber-400' : marker.color === 'red' ? 'text-rose-500' : 'text-sky-500';
            return (
              <svg key={idx} width="14" height="18" viewBox="0 0 14 18" className={`${colorClass} drop-shadow`}>
                <path d="M0 0 H14 V16 L7 12 L0 16 Z" fill="currentColor" />
              </svg>
            );
          })}
        </div>
      )}

      {/* File info on hover */}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 pt-6
                      opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-xs truncate">{photo.originalName}</p>
      </div>
    </div>
  );
}

export function GalleryEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNew = id === 'new';

  // Gallery state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [welcomeText, setWelcomeText] = useState('');
  const [allowDownload, setAllowDownload] = useState(true);
  const [allowMarking, setAllowMarking] = useState(true);
  const [availableMarkers, setAvailableMarkers] = useState<MarkerColor[]>(['green', 'yellow']);
  const [coverPhotoIds, setCoverPhotoIds] = useState<string[]>([]);
  const [watermarkEnabled, setWatermarkEnabled] = useState(true);
  
  // Photos state
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [uploadingPhotos, setUploadingPhotos] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  // UI state
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [_slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  // Lock gegen parallele createGallery-Aufrufe.
  // Wenn onDrop aus irgendeinem Grund mehrfach feuert (Re-Mount, Doppel-Event etc.),
  // sorgt der gecachte Promise dafür, dass nur EIN createGallery-Call rausgeht
  // und alle Aufrufer auf das gleiche Ergebnis warten.
  const galleryIdRef = useRef<string | null>(isNew ? null : id ?? null);
  const creatingGalleryRef = useRef<Promise<string> | null>(null);

  // Synchronisiere Ref mit URL-Param — wenn beim Aufruf einer existierenden Galerie
  // die ID ankommt, Ref aktualisieren.
  useEffect(() => {
    if (!isNew && id) {
      galleryIdRef.current = id;
    }
  }, [id, isNew]);

  // Wasserzeichen-Text aus dem Website-Branding — wird beim Mount geladen
  // und bei jedem Galerie-Upload aufs Bild gerendert. Fallback sorgt dafür,
  // dass Bilder auch geschützt sind, wenn der Branding-Name (noch) leer ist.
  const WATERMARK_FALLBACK = 'emilykleinfotografie';
  const [watermarkText, setWatermarkText] = useState(WATERMARK_FALLBACK);
  useEffect(() => {
    getWebsiteContent()
      .then((content) => {
        const name = content?.branding?.name?.trim();
        setWatermarkText(name && name.length > 0 ? name : WATERMARK_FALLBACK);
      })
      .catch((err) => console.warn('Konnte Branding für Wasserzeichen nicht laden:', err));
  }, []);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Load existing gallery
  useEffect(() => {
    async function load() {
      if (isNew) {
        // Generate random slug for new galleries
        setSlug(generateSlug());
        return;
      }

      try {
        const gallery = await getGallery(id!);
        if (!gallery) {
          setError('Galerie nicht gefunden');
          return;
        }

        setTitle(gallery.title);
        setSlug(gallery.slug);
        setWelcomeText(gallery.welcomeText || '');
        setAllowDownload(gallery.allowDownload);
        setAllowMarking(gallery.allowMarking);
        setAvailableMarkers(gallery.availableMarkers);
        setCoverPhotoIds(gallery.coverPhotoIds || []);
        setWatermarkEnabled(gallery.watermarkEnabled !== false); // Default: an
        setSlugManuallyEdited(true);

        const photosData = await getGalleryPhotos(gallery.id);
        setPhotos(photosData);
      } catch (err) {
        setError('Fehler beim Laden');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id, isNew]);

  // Auto-generate slug only once for new galleries
  useEffect(() => {
    if (isNew && !slug) {
      setSlug(generateSlug());
    }
  }, [isNew, slug]);

  // Handle file drop
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const imageFiles = acceptedFiles.filter(file => 
      file.type.startsWith('image/')
    );

    if (imageFiles.length === 0) return;

    // Galerie-ID besorgen: bestehende nehmen, sonst genau einmal erstellen.
    // Mehrfache parallele onDrop-Aufrufe warten alle auf den gleichen Promise,
    // statt jeweils eine eigene Galerie anzulegen.
    let galleryId = galleryIdRef.current;
    if (!galleryId) {
      if (!creatingGalleryRef.current) {
        creatingGalleryRef.current = createGallery({
          title: title || 'Neue Galerie',
          slug,
          welcomeText,
          allowDownload,
          allowMarking,
          availableMarkers,
          coverPhotoIds: [],
          watermarkEnabled,
          photoCount: 0,
          totalSize: 0,
          isPublic: true,
        }).then((newId) => {
          galleryIdRef.current = newId;
          // URL aktualisieren, damit ein Reload die Galerie wiederfindet.
          // replaceState benachrichtigt React Router nicht — das ist hier okay,
          // weil wir die ID über die Ref selbst tracken.
          window.history.replaceState(null, '', `/admin/gallery/${newId}`);
          return newId;
        }).catch((err) => {
          // Lock freigeben, damit ein erneuter Drop einen neuen Versuch starten kann
          creatingGalleryRef.current = null;
          throw err;
        });
      }
      try {
        galleryId = await creatingGalleryRef.current;
      } catch (err) {
        console.error('Failed to create gallery:', err);
        setError('Fehler beim Erstellen der Galerie');
        return;
      }
    }

    setUploadingPhotos(prev => [...prev, ...imageFiles]);

    for (const file of imageFiles) {
      try {
        // Schritt 1: Original immer hochladen — Kunden bekommen beim Download
        // unverändert das hochgeladene Bild.
        const result = await uploadPhoto(
          file,
          galleryId!,
          (progress) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: progress }));
          }
        );

        // Schritt 2: Wenn Wasserzeichen-Toggle an ist, zusätzlich eine kleine
        // WZ-Vorschau erzeugen und hochladen. Galerie-Anzeige nutzt diese.
        let watermarkUrl: string | undefined;
        if (watermarkEnabled) {
          try {
            const preview = await createWatermarkedPreview(file, watermarkText, 1600, 0.80);
            const wmResult = await uploadPhoto(preview, galleryId!);
            watermarkUrl = wmResult.url;
          } catch (wmErr) {
            console.warn(`Wasserzeichen-Preview für ${file.name} fehlgeschlagen — nur Original verfügbar:`, wmErr);
          }
        }

        // Save photo metadata to Firestore
        const photoId = await addPhotoToFirestore({
          galleryId: galleryId!,
          filename: result.filename,
          originalName: file.name,
          url: result.url,
          ...(watermarkUrl ? { watermarkUrl } : {}),
          width: result.width,
          height: result.height,
          size: result.size,
          markers: [],
          order: photos.length,
        });

        const newPhoto: Photo = {
          id: photoId,
          galleryId: galleryId!,
          filename: result.filename,
          originalName: file.name,
          url: result.url,
          watermarkUrl,
          width: result.width,
          height: result.height,
          size: result.size,
          markers: [],
          uploadedAt: new Date(),
          order: photos.length,
        };

        setPhotos(prev => [...prev, newPhoto]);
        setUploadingPhotos(prev => prev.filter(f => f !== file));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      } catch (err) {
        console.error('Upload failed:', err);
        setUploadingPhotos(prev => prev.filter(f => f !== file));
        setError(`Fehler beim Hochladen von ${file.name}`);
      }
    }
  }, [id, isNew, title, slug, welcomeText, allowDownload, allowMarking, availableMarkers, photos.length]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp']
    },
    multiple: true
  });

  // Remove photo
  async function removePhoto(photoId: string) {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    try {
      // Original aus R2 löschen
      await deletePhotoFile(photo.galleryId, photo.filename);
      // Wasserzeichen-Vorschau aus R2 löschen, falls vorhanden
      if (photo.watermarkUrl) {
        deleteR2FileByUrl(photo.watermarkUrl);
      }
      // Aus Firestore entfernen
      await deletePhotoFromFirestore(photoId);
    } catch (err) {
      console.error('Failed to delete photo:', err);
    }

    setPhotos(prev => prev.filter(p => p.id !== photoId));
    setCoverPhotoIds(prev => prev.filter(id => id !== photoId));
  }

  // Toggle marker color
  function toggleMarkerColor(color: MarkerColor) {
    setAvailableMarkers(prev => {
      if (prev.includes(color)) {
        return prev.filter(c => c !== color);
      } else {
        return [...prev, color];
      }
    });
  }

  // Toggle cover photo
  function toggleCoverPhoto(photoId: string) {
    setCoverPhotoIds(prev => {
      if (prev.includes(photoId)) {
        return prev.filter(id => id !== photoId);
      } else if (prev.length < 3) {
        return [...prev, photoId];
      } else {
        // Replace oldest
        return [...prev.slice(1), photoId];
      }
    });
  }

  // Handle drag end
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setPhotos((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  // Sort functions
  function sortPhotos(by: 'name' | 'date' | 'size') {
    setPhotos(prev => {
      const sorted = [...prev];
      switch (by) {
        case 'name':
          sorted.sort((a, b) => a.originalName.localeCompare(b.originalName));
          break;
        case 'date':
          sorted.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
          break;
        case 'size':
          sorted.sort((a, b) => b.size - a.size);
          break;
      }
      return sorted;
    });
    setSortMenuOpen(false);
  }

  // Save gallery
  async function handleSave() {
    if (!title.trim()) {
      setError('Bitte gib einen Titel ein');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const galleryData = {
        title,
        slug,
        welcomeText,
        allowDownload,
        allowMarking,
        availableMarkers,
        coverPhotoIds,
        watermarkEnabled,
        photoCount: photos.length,
        totalSize: photos.reduce((sum, p) => sum + (p.size || 0), 0),
        isPublic: true,
      };

      // Wenn die Galerie schon existiert (entweder beim Laden vorhanden, oder
      // beim Foto-Upload via onDrop angelegt), wird sie aktualisiert statt neu
      // erstellt. galleryIdRef ist die Single Source of Truth für die echte ID
      // — isNew/id aus useParams sind unzuverlässig, weil replaceState
      // React Router nicht informiert.
      // Sonderfall: Wenn der User auf Speichern klickt während onDrop noch eine
      // Galerie anlegt, warten wir auf den laufenden Promise statt parallel
      // eine zweite zu erzeugen.
      let galleryId: string;
      if (!galleryIdRef.current && creatingGalleryRef.current) {
        try {
          await creatingGalleryRef.current;
        } catch {
          // Wenn der onDrop-Create fehlgeschlagen ist, fallen wir auf eigenen Create durch
        }
      }
      if (galleryIdRef.current) {
        galleryId = galleryIdRef.current;
        await updateGallery(galleryId, galleryData);
      } else {
        galleryId = await createGallery(galleryData);
        galleryIdRef.current = galleryId;
      }

      // Update photo order
      const photoOrders = photos.map((photo, index) => ({
        id: photo.id,
        order: index
      }));
      await updatePhotoOrder(photoOrders);

      navigate('/admin');
    } catch (err) {
      setError('Fehler beim Speichern');
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  // Get cover photos for preview
  const coverPhotos = coverPhotoIds
    .map(id => photos.find(p => p.id === id))
    .filter(Boolean) as Photo[];

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
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/admin"
              className="p-2 rounded-lg hover:bg-sand-100 text-sage-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-2 text-sage-600">
              <Camera className="w-5 h-5" />
              <span className="font-medium">
                {isNew ? 'Neue Galerie' : 'Galerie bearbeiten'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isNew && (
              <a
                href={`/g/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
                Vorschau
              </a>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Speichern
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 flex items-center gap-2 text-rose-600 bg-rose-50 p-4 rounded-lg">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Cover Preview */}
          {coverPhotos.length > 0 && (
            <section className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">
                Cover-Vorschau
              </h2>
              <div className={`grid gap-2 ${
                coverPhotos.length === 1 ? 'grid-cols-1' :
                coverPhotos.length === 2 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {coverPhotos.map((photo, idx) => (
                  <div 
                    key={photo.id} 
                    className={`relative rounded-lg overflow-hidden ${
                      coverPhotos.length === 1 ? 'aspect-video' : 'aspect-square'
                    }`}
                  >
                    <img
                      src={photo.thumbnailUrl || photo.url}
                      alt={`Cover ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <p className="text-sm text-sage-500 mt-3">
                {coverPhotos.length}/3 Bilder ausgewählt. Klicke auf ⭐ bei den Fotos unten um Cover-Bilder zu wählen.
              </p>
            </section>
          )}

          {/* Basic Info */}
          <section className="card p-6">
            <h2 className="text-lg font-medium text-sage-800 mb-4">
              Grundeinstellungen
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-sage-700 mb-1.5">
                  Titel *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input"
                  placeholder="z.B. Hochzeit Familie Müller"
                />
              </div>

              {/* Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-sage-700 mb-1.5">
                  Link-Endung
                </label>
                <div className="flex items-center">
                  <span className="text-sage-400 text-sm mr-2">
                    {window.location.origin}/g/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={(e) => {
                      setSlug(e.target.value);
                      setSlugManuallyEdited(true);
                    }}
                    className="input flex-1"
                    placeholder="hochzeit-mueller"
                  />
                </div>
              </div>

              {/* Welcome Text */}
              <div>
                <label htmlFor="welcomeText" className="block text-sm font-medium text-sage-700 mb-1.5">
                  Willkommenstext
                </label>
                <textarea
                  id="welcomeText"
                  value={welcomeText}
                  onChange={(e) => setWelcomeText(e.target.value)}
                  className="input min-h-[120px] resize-y"
                  placeholder="Dieser Text wird oben in der Galerie angezeigt..."
                />
              </div>
            </div>
          </section>

          {/* Options */}
          <section className="card p-6">
            <h2 className="text-lg font-medium text-sage-800 mb-4">
              Optionen
            </h2>

            <div className="space-y-4">
              {/* Download Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-sage-700">Downloads erlauben</span>
                  <p className="text-sm text-sage-500">Besucher können Fotos herunterladen</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowDownload(!allowDownload)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${allowDownload ? 'bg-sage-500' : 'bg-sand-300'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                      ${allowDownload ? 'translate-x-6' : ''}
                    `}
                  />
                </button>
              </label>

              {/* Marking Toggle */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="font-medium text-sage-700">Markierungen erlauben</span>
                  <p className="text-sm text-sage-500">Besucher können Fotos markieren</p>
                </div>
                <button
                  type="button"
                  onClick={() => setAllowMarking(!allowMarking)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors
                    ${allowMarking ? 'bg-sage-500' : 'bg-sand-300'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                      ${allowMarking ? 'translate-x-6' : ''}
                    `}
                  />
                </button>
              </label>

              {/* Watermark Toggle */}
              <label className="flex items-center justify-between cursor-pointer gap-4">
                <div>
                  <span className="font-medium text-sage-700">
                    Wasserzeichen in der Vorschau{' '}
                    <span className="text-xs text-sage-400 font-normal">(empfohlen)</span>
                  </span>
                  <p className="text-sm text-sage-500">
                    Besucher sehen deine Fotos mit Wasserzeichen — beim Download bekommen deine Kund:innen
                    trotzdem das Original ohne Wasserzeichen. Wirkt nur für neue Uploads nach dem Speichern.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setWatermarkEnabled(!watermarkEnabled)}
                  className={`
                    relative w-12 h-6 rounded-full transition-colors flex-shrink-0
                    ${watermarkEnabled ? 'bg-sage-500' : 'bg-sand-300'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform
                      ${watermarkEnabled ? 'translate-x-6' : ''}
                    `}
                  />
                </button>
              </label>

              {/* Marker Colors */}
              {allowMarking && (
                <div className="pt-2">
                  <span className="block text-sm font-medium text-sage-700 mb-2">
                    Verfügbare Markierungen
                  </span>
                  <div className="flex gap-4">
                    {(['green', 'yellow', 'red', 'blue'] as MarkerColor[]).map((color) => {
                      const isActive = availableMarkers.includes(color);
                      const label = color === 'green' ? 'Ja' : color === 'yellow' ? 'Vielleicht' : color === 'red' ? 'Nein' : 'Favorit';
                      const colorClass = color === 'green' ? 'text-emerald-500' : color === 'yellow' ? 'text-amber-400' : color === 'red' ? 'text-rose-500' : 'text-sky-500';
                      
                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => toggleMarkerColor(color)}
                          className={`
                            flex flex-col items-center gap-1 p-2 rounded-lg transition-all
                            ${isActive ? 'bg-sand-100' : 'opacity-40 hover:opacity-70'}
                          `}
                        >
                          <svg width="24" height="30" viewBox="0 0 24 30" className={colorClass}>
                            <path d="M0 0 H24 V26 L12 20 L0 26 Z" fill="currentColor" />
                          </svg>
                          <span className="text-xs text-sage-600">{label}</span>
                          {isActive && <Check className="w-4 h-4 text-sage-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Photos */}
          <section className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-sage-800">
                Fotos ({photos.length})
              </h2>
              
              {photos.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setSortMenuOpen(!sortMenuOpen)}
                    className="btn-secondary text-sm flex items-center gap-2"
                  >
                    <ArrowUpDown className="w-4 h-4" />
                    Sortieren
                  </button>
                  
                  {sortMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setSortMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-sand-100 py-1 z-20 min-w-[160px]">
                        <button
                          onClick={() => sortPhotos('name')}
                          className="w-full px-4 py-2 text-left text-sm text-sage-700 hover:bg-sand-50"
                        >
                          Nach Name (A-Z)
                        </button>
                        <button
                          onClick={() => sortPhotos('date')}
                          className="w-full px-4 py-2 text-left text-sm text-sage-700 hover:bg-sand-50"
                        >
                          Nach Datum (neueste zuerst)
                        </button>
                        <button
                          onClick={() => sortPhotos('size')}
                          className="w-full px-4 py-2 text-left text-sm text-sage-700 hover:bg-sand-50"
                        >
                          Nach Größe (größte zuerst)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Dropzone */}
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-xl p-8 text-center cursor-pointer
                transition-colors
                ${isDragActive 
                  ? 'border-sage-400 bg-sage-50' 
                  : 'border-sand-200 hover:border-sage-300 hover:bg-sand-50'
                }
              `}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 text-sage-400 mx-auto mb-3" />
              {isDragActive ? (
                <p className="text-sage-600">Fotos hier ablegen...</p>
              ) : (
                <>
                  <p className="text-sage-600 mb-1">
                    Fotos hierher ziehen oder <span className="text-sage-700 underline">auswählen</span>
                  </p>
                  <p className="text-sm text-sage-400">
                    JPG, PNG oder WebP
                  </p>
                </>
              )}
            </div>

            {/* Upload Progress */}
            {uploadingPhotos.length > 0 && (
              <div className="mt-4 space-y-2">
                {uploadingPhotos.map((file) => (
                  <div key={file.name} className="flex items-center gap-3 bg-sand-50 rounded-lg p-3">
                    <Loader2 className="w-5 h-5 animate-spin text-sage-500" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-sage-700 truncate">{file.name}</p>
                      <div className="mt-1 h-1.5 bg-sand-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-sage-500 transition-all"
                          style={{ width: `${uploadProgress[file.name] || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Photo Grid with DnD */}
            {photos.length > 0 && (
              <div className="mt-6">
                <p className="text-sm text-sage-500 mb-3">
                  Ziehe Fotos um die Reihenfolge zu ändern. Klicke ⭐ für Cover-Bilder.
                </p>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext items={photos.map(p => p.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {photos.map((photo) => (
                        <SortablePhoto
                          key={photo.id}
                          photo={photo}
                          onRemove={removePhoto}
                          isCover={coverPhotoIds.includes(photo.id)}
                          onToggleCover={toggleCoverPhoto}
                          coverIndex={coverPhotoIds.indexOf(photo.id)}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {photos.length === 0 && uploadingPhotos.length === 0 && (
              <div className="mt-6 text-center py-8 text-sage-400">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Noch keine Fotos hochgeladen</p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
