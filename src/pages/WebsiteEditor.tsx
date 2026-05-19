import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
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
import {
  ArrowLeft, Save, Upload, Loader2, Check,
  Camera, Plus, Trash2, GripVertical, ExternalLink,
  ArrowUp, ArrowDown, Star
} from 'lucide-react';
import { getWebsiteContent, updateWebsiteContent } from '../lib/firestoreService';
import { uploadPhoto, compressImage, deleteR2FileByUrl } from '../lib/uploadService';

// Types
interface PortfolioImage {
  id: string;
  url: string;
  alt: string;
  size: 'S' | 'M' | 'L';
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface Review {
  id: string;
  name: string;
  text: string;
  rating: number;
  date: string;
  image?: string;
  _file?: File; // lokal, nur bis zum Speichern
}

// Sortable Portfolio Image
function SortablePortfolioImage({ 
  image, 
  onRemove, 
  onSizeChange 
}: { 
  image: PortfolioImage; 
  onRemove: (id: string) => void;
  onSizeChange: (id: string, size: 'S' | 'M' | 'L') => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const heightClass = 
    image.size === 'L' ? 'aspect-[3/4]' :
    image.size === 'M' ? 'aspect-square' :
    'aspect-[4/3]';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative rounded-xl overflow-hidden group bg-sand-100 ${heightClass}`}
    >
      <img
        src={image.url}
        alt={image.alt}
        className="w-full h-full object-cover"
      />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 w-8 h-8 bg-black/50 hover:bg-black/70 rounded-lg cursor-grab
                   flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {/* Size Selector */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {(['S', 'M', 'L'] as const).map((size) => (
          <button
            key={size}
            onClick={() => onSizeChange(image.id, size)}
            className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
              image.size === size
                ? 'bg-sage-600 text-white'
                : 'bg-white/90 text-sage-700 hover:bg-white'
            }`}
          >
            {size}
          </button>
        ))}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(image.id)}
        className="absolute bottom-2 right-2 w-8 h-8 bg-black/50 hover:bg-rose-500 rounded-lg
                   flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}

export function WebsiteEditor() {
  const { section } = useParams<{ section: string }>();

  // Branding state
  const [brandName, setBrandName] = useState('');
  const [brandLogoUrl, setBrandLogoUrl] = useState('');
  const [brandLogoFile, setBrandLogoFile] = useState<File | null>(null);

  // Hero state
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [heroImageFile, setHeroImageFile] = useState<File | null>(null);

  // About state
  const [aboutText, setAboutText] = useState("");
  const [aboutImage, setAboutImage] = useState("");
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);

  // Portfolio state
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);

  // FAQ state
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);

  // Contact state
  const [contactEmail, setContactEmail] = useState('');
  const [contactInstagram, setContactInstagram] = useState('');
  const [contactInstagramHandle, setContactInstagramHandle] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Snapshot der bereits in Firestore gespeicherten Bild-URLs — gebraucht,
  // um beim Save die nicht mehr referenzierten Files aus R2 zu löschen.
  const [savedBrandLogoUrl, setSavedBrandLogoUrl] = useState('');
  const [savedHeroImage, setSavedHeroImage] = useState('');
  const [savedAboutImage, setSavedAboutImage] = useState('');
  const [savedPortfolioUrls, setSavedPortfolioUrls] = useState<string[]>([]);
  const [savedReviewImages, setSavedReviewImages] = useState<string[]>([]);

  // Load content from Firebase
  useEffect(() => {
    async function loadContent() {
      try {
        const content = await getWebsiteContent();
        if (content) {
          if (content.branding) {
            setBrandName(content.branding.name || "");
            setBrandLogoUrl(content.branding.logoUrl || "");
            setSavedBrandLogoUrl(content.branding.logoUrl || "");
          }
          if (content.hero) {
            setHeroTitle(content.hero.title || "");
            setHeroSubtitle(content.hero.subtitle || "");
            setHeroImage(content.hero.backgroundImage || "");
            setSavedHeroImage(content.hero.backgroundImage || "");
          }
          if (content.about) {
            setAboutText(content.about.text || "");
            setAboutImage(content.about.image || "");
            setSavedAboutImage(content.about.image || "");
          }
          if (content.portfolio) {
            setPortfolioImages(content.portfolio);
            setSavedPortfolioUrls(content.portfolio.map((p) => p.url));
          }
          if (content.faq) {
            setFaqs(content.faq);
          }
          if (content.reviews) {
            setReviews(content.reviews);
            setSavedReviewImages(
              content.reviews
                .map((r) => r.image)
                .filter((url): url is string => Boolean(url))
            );
          }
          if (content.contact) {
            setContactEmail(content.contact.email || "");
            setContactInstagram(content.contact.instagram || "");
            setContactInstagramHandle(content.contact.instagramHandle || "");
          }
        }
      } catch (error) {
        console.error('Error loading website content:', error);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle image upload
  const onDropLogo = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setBrandLogoFile(acceptedFiles[0]);
      setBrandLogoUrl(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const onDropHero = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setHeroImageFile(acceptedFiles[0]);
      setHeroImage(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const onDropAbout = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setAboutImageFile(acceptedFiles[0]);
      setAboutImage(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const onDropPortfolio = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      size: 'M' as const,
      _file: file // Track file for upload
    }));
    setPortfolioImages(prev => [...prev, ...newImages as PortfolioImage[]]);
  }, []);

  const logoDropzone = useDropzone({ onDrop: onDropLogo, accept: { 'image/*': [] }, multiple: false });
  const heroDropzone = useDropzone({ onDrop: onDropHero, accept: { 'image/*': [] }, multiple: false });
  const aboutDropzone = useDropzone({ onDrop: onDropAbout, accept: { 'image/*': [] }, multiple: false });
  const portfolioDropzone = useDropzone({ onDrop: onDropPortfolio, accept: { 'image/*': [] }, multiple: true });

  // Portfolio handlers
  function handlePortfolioDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPortfolioImages((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function removePortfolioImage(id: string) {
    setPortfolioImages(prev => prev.filter(img => img.id !== id));
  }

  function changeImageSize(id: string, size: 'S' | 'M' | 'L') {
    setPortfolioImages(prev => prev.map(img => 
      img.id === id ? { ...img, size } : img
    ));
  }

  // FAQ handlers
  function updateFaq(id: string, field: 'question' | 'answer', value: string) {
    setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: value } : f));
  }

  function addFaq() {
    setFaqs(prev => [
      ...prev,
      { id: `new-${Date.now()}`, question: 'Neue Frage', answer: '' }
    ]);
  }

  function removeFaq(id: string) {
    setFaqs(prev => prev.filter(f => f.id !== id));
  }

  function moveFaq(id: string, direction: -1 | 1) {
    setFaqs(prev => {
      const idx = prev.findIndex(f => f.id === id);
      const newIdx = idx + direction;
      if (idx < 0 || newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }

  // Review handlers
  function updateReview(id: string, field: 'name' | 'text' | 'rating' | 'date', value: string | number) {
    setReviews(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));
  }

  function addReview() {
    setReviews(prev => [
      ...prev,
      { id: `new-${Date.now()}`, name: '', text: '', rating: 5, date: '' }
    ]);
  }

  function removeReview(id: string) {
    setReviews(prev => prev.filter(r => r.id !== id));
  }

  function setReviewImage(id: string, file: File) {
    setReviews(prev => prev.map(r => r.id === id ? {
      ...r,
      _file: file,
      image: URL.createObjectURL(file),
    } : r));
  }

  function clearReviewImage(id: string) {
    setReviews(prev => prev.map(r => r.id === id ? {
      ...r,
      _file: undefined,
      image: undefined,
    } : r));
  }

  function moveReview(id: string, direction: -1 | 1) {
    setReviews(prev => {
      const idx = prev.findIndex(r => r.id === id);
      const newIdx = idx + direction;
      if (idx < 0 || newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }

  // Save handler
  async function handleSave() {
    setSaving(true);

    try {
      // Branding: Logo hochladen falls neu, altes löschen falls ersetzt/entfernt
      if (section === 'branding' || !section) {
        let finalLogoUrl = brandLogoUrl;
        if (brandLogoFile) {
          const result = await uploadPhoto(brandLogoFile, 'website');
          finalLogoUrl = result.url;
          setBrandLogoFile(null);
          setBrandLogoUrl(finalLogoUrl);
        }
        // Wenn Logo-URL sich geändert hat (neu hochgeladen ODER gelöscht), alte aus R2 weg
        if (savedBrandLogoUrl && savedBrandLogoUrl !== finalLogoUrl) {
          deleteR2FileByUrl(savedBrandLogoUrl);
        }
        await updateWebsiteContent('branding', {
          name: brandName,
          logoUrl: finalLogoUrl
        });
        setSavedBrandLogoUrl(finalLogoUrl);
      }

      // Upload hero image if changed (Full HD reicht — niemand sieht das größer)
      let finalHeroImage = heroImage;
      if (section === 'hero' || !section) {
        if (heroImageFile) {
          const compressed = await compressImage(heroImageFile, 1920, 0.80);
          const result = await uploadPhoto(compressed, 'website');
          finalHeroImage = result.url;
          setHeroImageFile(null);
        }
        if (savedHeroImage && savedHeroImage !== finalHeroImage) {
          deleteR2FileByUrl(savedHeroImage);
        }
        await updateWebsiteContent('hero', {
          title: heroTitle,
          subtitle: heroSubtitle,
          backgroundImage: finalHeroImage
        });
        setSavedHeroImage(finalHeroImage);
      }

      // Upload about image if changed (Profilbild, eher klein dargestellt)
      let finalAboutImage = aboutImage;
      if (section === 'about' || !section) {
        if (aboutImageFile) {
          const compressed = await compressImage(aboutImageFile, 1000, 0.80);
          const result = await uploadPhoto(compressed, 'website');
          finalAboutImage = result.url;
          setAboutImageFile(null);
        }
        if (savedAboutImage && savedAboutImage !== finalAboutImage) {
          deleteR2FileByUrl(savedAboutImage);
        }
        await updateWebsiteContent('about', {
          text: aboutText,
          image: finalAboutImage
        });
        setSavedAboutImage(finalAboutImage);
      }

      // Upload new portfolio images (Grid-Anzeige, max 3 Spalten — 1000 px reicht)
      if (section === 'portfolio' || !section) {
        const updatedPortfolio: PortfolioImage[] = [];
        for (const img of portfolioImages) {
          const imgWithFile = img as PortfolioImage & { _file?: File };
          if (imgWithFile._file) {
            const compressed = await compressImage(imgWithFile._file, 1000, 0.80);
            const result = await uploadPhoto(compressed, 'website');
            updatedPortfolio.push({
              id: result.filename,
              url: result.url,
              alt: img.alt,
              size: img.size
            });
          } else {
            updatedPortfolio.push(img);
          }
        }
        setPortfolioImages(updatedPortfolio);

        // Portfolio-Diff: was vorher gespeichert war und jetzt nicht mehr ist → aus R2 löschen
        const newPortfolioUrls = updatedPortfolio.map((p) => p.url);
        const removedUrls = savedPortfolioUrls.filter((url) => !newPortfolioUrls.includes(url));
        removedUrls.forEach((url) => deleteR2FileByUrl(url));

        await updateWebsiteContent('portfolio', updatedPortfolio);
        setSavedPortfolioUrls(newPortfolioUrls);
      }

      if (section === 'faq' || !section) {
        await updateWebsiteContent('faq', faqs);
      }

      if (section === 'reviews' || !section) {
        // Neue Avatar-Bilder hochladen (komprimiert, klein — Avatar ist max ~120 px sichtbar)
        const updatedReviews: Review[] = [];
        for (const r of reviews) {
          if (r._file) {
            const compressed = await compressImage(r._file, 400, 0.85);
            const result = await uploadPhoto(compressed, 'website');
            updatedReviews.push({
              id: r.id,
              name: r.name,
              text: r.text,
              rating: r.rating,
              date: r.date,
              image: result.url,
            });
          } else {
            const { _file: _unused, ...clean } = r;
            void _unused;
            updatedReviews.push(clean);
          }
        }
        setReviews(updatedReviews);

        // Diff: alte Review-Bilder, die nicht mehr da sind → aus R2 löschen
        const newReviewImages = updatedReviews
          .map((r) => r.image)
          .filter((url): url is string => Boolean(url));
        const removedReviewImages = savedReviewImages.filter(
          (url) => !newReviewImages.includes(url)
        );
        removedReviewImages.forEach((url) => deleteR2FileByUrl(url));

        await updateWebsiteContent('reviews', updatedReviews);
        setSavedReviewImages(newReviewImages);
      }

      if (section === 'contact' || !section) {
        await updateWebsiteContent('contact', {
          email: contactEmail,
          instagram: contactInstagram,
          instagramHandle: contactInstagramHandle
        });
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Save error:', error);
      alert('Fehler beim Speichern. Bitte versuche es erneut.');
    } finally {
      setSaving(false);
    }
  }

  // Section titles
  const sectionTitles: Record<string, string> = {
    branding: 'Logo & Name',
    hero: 'Hero-Bereich',
    about: 'Über mich',
    portfolio: 'Portfolio',
    faq: 'Häufige Fragen',
    reviews: 'Rezensionen',
    contact: 'Kontakt'
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-500 animate-spin" />
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
              <span className="font-medium">{sectionTitles[section || ''] || 'Bearbeiten'}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Vorschau
            </a>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center gap-2"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : saved ? (
                <Check className="w-4 h-4" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Speichern...' : saved ? 'Gespeichert!' : 'Speichern'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">

        {/* Branding Editor (Logo & Name oben links) */}
        {section === 'branding' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-2">Logo (optional)</h2>
              <p className="text-sm text-sage-500 mb-4">
                Wenn ein Logo hochgeladen ist, wird es oben links auf der Webseite angezeigt — statt deines Namens.
              </p>

              <div className="flex items-center gap-4">
                <div
                  {...logoDropzone.getRootProps()}
                  className={`relative w-40 h-20 rounded-xl overflow-hidden cursor-pointer border-2 border-dashed flex items-center justify-center ${
                    logoDropzone.isDragActive
                      ? 'border-sage-400 bg-sage-50'
                      : 'border-sand-200 hover:border-sage-300'
                  }`}
                >
                  <input {...logoDropzone.getInputProps()} />
                  {brandLogoUrl ? (
                    <img
                      src={brandLogoUrl}
                      alt="Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="w-5 h-5 text-sage-400 mx-auto mb-1" />
                      <p className="text-xs text-sage-500">Logo hochladen</p>
                    </div>
                  )}
                </div>

                {brandLogoUrl && (
                  <button
                    onClick={() => {
                      setBrandLogoUrl('');
                      setBrandLogoFile(null);
                    }}
                    className="text-sm text-sage-500 hover:text-rose-500 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                    Logo entfernen
                  </button>
                )}
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-2">Seitenname</h2>
              <p className="text-sm text-sage-500 mb-4">
                Wird oben links angezeigt (wenn kein Logo da ist) und im Footer.
              </p>
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="input"
                placeholder="z.B. emilykleinfotografie"
              />
            </div>
          </div>
        )}

        {/* Hero Editor */}
        {section === 'hero' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">Hintergrundbild</h2>
              <div
                {...heroDropzone.getRootProps()}
                className={`relative aspect-video rounded-xl overflow-hidden cursor-pointer border-2 border-dashed ${
                  heroDropzone.isDragActive ? 'border-sage-400 bg-sage-50' : 'border-sand-200'
                }`}
              >
                <input {...heroDropzone.getInputProps()} />
                <img src={heroImage} alt="Hero" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <div className="text-white text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p>Klicken oder Bild hierher ziehen</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">Texte</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">Überschrift</label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">Untertitel</label>
                  <input
                    type="text"
                    value={heroSubtitle}
                    onChange={(e) => setHeroSubtitle(e.target.value)}
                    className="input"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* About Editor */}
        {section === 'about' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">Profilbild</h2>
              <div
                {...aboutDropzone.getRootProps()}
                className={`relative w-48 aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 border-dashed ${
                  aboutDropzone.isDragActive ? 'border-sage-400 bg-sage-50' : 'border-sand-200'
                }`}
              >
                <input {...aboutDropzone.getInputProps()} />
                <img src={aboutImage} alt="Profil" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">Text über dich</h2>
              <textarea
                value={aboutText}
                onChange={(e) => setAboutText(e.target.value)}
                className="input min-h-[250px] resize-y"
                placeholder="Erzähl etwas über dich..."
              />
              <p className="text-sm text-sage-400 mt-2">
                Tipp: Leere Zeilen erzeugen neue Absätze.
              </p>
            </div>
          </div>
        )}

        {/* Portfolio Editor */}
        {section === 'portfolio' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">Portfolio-Bilder</h2>
              
              {/* Upload Zone */}
              <div
                {...portfolioDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-6 ${
                  portfolioDropzone.isDragActive ? 'border-sage-400 bg-sage-50' : 'border-sand-200 hover:border-sage-300'
                }`}
              >
                <input {...portfolioDropzone.getInputProps()} />
                <Upload className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                <p className="text-sage-600">Bilder hierher ziehen oder klicken</p>
              </div>

              {/* Images Grid */}
              <p className="text-sm text-sage-500 mb-3">
                Ziehe Bilder um die Reihenfolge zu ändern. Wähle S/M/L für die Größe.
              </p>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePortfolioDragEnd}
              >
                <SortableContext items={portfolioImages.map(i => i.id)} strategy={rectSortingStrategy}>
                  <div className="columns-2 md:columns-3 gap-3 space-y-3">
                    {portfolioImages.map((image) => (
                      <div key={image.id} className="break-inside-avoid">
                        <SortablePortfolioImage
                          image={image}
                          onRemove={removePortfolioImage}
                          onSizeChange={changeImageSize}
                        />
                      </div>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          </div>
        )}

        {/* FAQ Editor */}
        {section === 'faq' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-2">Häufige Fragen</h2>
              <p className="text-sm text-sage-500 mb-6">
                Frage + Antwort. Die Reihenfolge kannst du mit den Pfeilen ändern.
              </p>

              <div className="space-y-4">
                {faqs.map((item, idx) => (
                  <div
                    key={item.id}
                    className="border border-sand-200 rounded-xl p-4 bg-sand-50/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-sage-500">Frage {idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveFaq(item.id, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-sage-500 hover:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Nach oben"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveFaq(item.id, 1)}
                          disabled={idx === faqs.length - 1}
                          className="p-1.5 rounded-lg text-sage-500 hover:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Nach unten"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeFaq(item.id)}
                          className="p-1.5 rounded-lg text-sage-400 hover:bg-rose-50 hover:text-rose-500"
                          title="Frage löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-1.5">Frage</label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => updateFaq(item.id, 'question', e.target.value)}
                          className="input"
                          placeholder="z.B. Wie lange dauert ein Shooting?"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-1.5">Antwort</label>
                        <textarea
                          value={item.answer}
                          onChange={(e) => updateFaq(item.id, 'answer', e.target.value)}
                          className="input min-h-[80px] resize-y"
                          placeholder="Antwort schreiben..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addFaq}
                  className="w-full p-4 border-2 border-dashed border-sand-200 hover:border-sage-300
                             text-sage-500 hover:text-sage-700 rounded-xl transition-colors
                             flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Frage hinzufügen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reviews Editor */}
        {section === 'reviews' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-2">Rezensionen</h2>
              <p className="text-sm text-sage-500 mb-6">
                Hier kannst du Stimmen deiner Kund:innen einpflegen.
              </p>

              <div className="space-y-4">
                {reviews.map((review, idx) => (
                  <div
                    key={review.id}
                    className="border border-sand-200 rounded-xl p-4 bg-sand-50/50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-sage-500">Rezension {idx + 1}</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => moveReview(review.id, -1)}
                          disabled={idx === 0}
                          className="p-1.5 rounded-lg text-sage-500 hover:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Nach oben"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveReview(review.id, 1)}
                          disabled={idx === reviews.length - 1}
                          className="p-1.5 rounded-lg text-sage-500 hover:bg-sand-200 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Nach unten"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => removeReview(review.id)}
                          className="p-1.5 rounded-lg text-sage-400 hover:bg-rose-50 hover:text-rose-500"
                          title="Rezension löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {/* Avatar-Bild (optional) */}
                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-1.5">
                          Bild (optional)
                        </label>
                        <div className="flex items-center gap-3">
                          {review.image ? (
                            <img
                              src={review.image}
                              alt={review.name}
                              className="w-16 h-16 rounded-lg object-cover border border-sand-200"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-lg bg-sand-100 text-sage-500 flex items-center justify-center text-sm border border-dashed border-sand-300">
                              kein Bild
                            </div>
                          )}
                          <div className="flex flex-col gap-1.5">
                            <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              Bild auswählen
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setReviewImage(review.id, file);
                                  e.target.value = '';
                                }}
                              />
                            </label>
                            {review.image && (
                              <button
                                type="button"
                                onClick={() => clearReviewImage(review.id)}
                                className="text-xs text-sage-500 hover:text-rose-500 text-left"
                              >
                                Bild entfernen
                              </button>
                            )}
                          </div>
                        </div>
                        <p className="text-xs text-sage-400 mt-1.5">
                          Wenn kein Bild gesetzt ist, werden die Initialen angezeigt.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-sage-700 mb-1.5">Name</label>
                          <input
                            type="text"
                            value={review.name}
                            onChange={(e) => updateReview(review.id, 'name', e.target.value)}
                            className="input"
                            placeholder="z.B. Anna & Jonas"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-sage-700 mb-1.5">Datum (optional)</label>
                          <input
                            type="text"
                            value={review.date}
                            onChange={(e) => updateReview(review.id, 'date', e.target.value)}
                            className="input"
                            placeholder="z.B. Juni 2024"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-1.5">Sterne (0–5)</label>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((n) => (
                            <button
                              key={n}
                              onClick={() => updateReview(review.id, 'rating', review.rating === n ? 0 : n)}
                              className="p-1"
                              title={`${n} Sterne`}
                            >
                              <Star
                                className={`w-6 h-6 ${
                                  n <= review.rating
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-sand-300'
                                }`}
                              />
                            </button>
                          ))}
                          {review.rating > 0 && (
                            <button
                              onClick={() => updateReview(review.id, 'rating', 0)}
                              className="ml-2 text-xs text-sage-500 hover:text-sage-700"
                            >
                              keine Sterne
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-sage-700 mb-1.5">Text</label>
                        <textarea
                          value={review.text}
                          onChange={(e) => updateReview(review.id, 'text', e.target.value)}
                          className="input min-h-[100px] resize-y"
                          placeholder="Rezension einfügen..."
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addReview}
                  className="w-full p-4 border-2 border-dashed border-sand-200 hover:border-sage-300
                             text-sage-500 hover:text-sage-700 rounded-xl transition-colors
                             flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Rezension hinzufügen
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Contact Editor */}
        {section === 'contact' && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">Kontaktdaten</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">E-Mail</label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">Instagram Handle</label>
                  <input
                    type="text"
                    value={contactInstagramHandle}
                    onChange={(e) => setContactInstagramHandle(e.target.value)}
                    className="input"
                    placeholder="@emilys_fotografie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">Instagram Link</label>
                  <input
                    type="url"
                    value={contactInstagram}
                    onChange={(e) => setContactInstagram(e.target.value)}
                    className="input"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
