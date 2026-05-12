import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Gallery, Photo } from '../types';
import { getAllGalleries, deleteGallery as deleteGalleryFromDB, getPhoto } from '../lib/firestoreService';
import { signOut } from '../lib/authService';
import {
  Camera, Plus, Images, Calendar, ExternalLink,
  LogOut, Trash2, Edit, Copy, Check, Loader2, Flag,
  Layout, FolderOpen, Globe, User, Instagram,
  ImageIcon, ChevronRight, Settings, Tag, HelpCircle, Star
} from 'lucide-react';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'website' | 'galleries';

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('website');
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [coverPhotosByGallery, setCoverPhotosByGallery] = useState<Record<string, Photo[]>>({});
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getAllGalleries();
        setGalleries(data);

        // Cover-Photos für alle Galerien parallel laden
        const coversMap: Record<string, Photo[]> = {};
        await Promise.all(
          data.map(async (g) => {
            if (!g.coverPhotoIds || g.coverPhotoIds.length === 0) return;
            const photos = await Promise.all(
              g.coverPhotoIds.slice(0, 3).map((id) => getPhoto(id))
            );
            coversMap[g.id] = photos.filter((p): p is Photo => p !== null);
          })
        );
        setCoverPhotosByGallery(coversMap);
      } catch (error) {
        console.error('Error loading galleries:', error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    try {
      await signOut();
      localStorage.removeItem('admin_logged_in');
      onLogout();
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  async function handleDeleteGallery(id: string) {
    try {
      await deleteGalleryFromDB(id);
      setGalleries(prev => prev.filter(g => g.id !== id));
      setDeleteGalleryId(null);
    } catch (error) {
      console.error('Error deleting gallery:', error);
    }
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(0)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  async function copyGalleryLink(slug: string) {
    const url = `${window.location.origin}/g/${slug}`;
    await navigator.clipboard.writeText(url);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  }

  // Website sections for editing
  const websiteSections = [
    {
      id: 'branding',
      name: 'Logo & Name',
      description: 'Logo oder Name oben links auf der Webseite',
      icon: Tag,
      color: 'bg-amber-100 text-amber-600'
    },
    {
      id: 'hero',
      name: 'Hero-Bereich',
      description: 'Titelbild, Überschrift und Untertitel',
      icon: Layout,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 'about',
      name: 'Über mich',
      description: 'Profilbild und Text über dich',
      icon: User,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 'portfolio',
      name: 'Portfolio',
      description: 'Beispielbilder mit verschiedenen Größen',
      icon: ImageIcon,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      id: 'faq',
      name: 'Häufige Fragen',
      description: 'Frage-Antwort-Liste für deine Kund:innen',
      icon: HelpCircle,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 'reviews',
      name: 'Rezensionen',
      description: 'Stimmen deiner Kund:innen',
      icon: Star,
      color: 'bg-yellow-100 text-yellow-600'
    },
    {
      id: 'contact',
      name: 'Kontakt',
      description: 'E-Mail und Instagram',
      icon: Instagram,
      color: 'bg-orange-100 text-orange-600'
    },
  ];

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Header */}
      <header className="bg-white border-b border-sand-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sage-600">
            <Camera className="w-6 h-6" />
            <span className="font-serif text-xl">Emily's Galerie</span>
            <span className="text-sm text-sage-400 ml-2">Admin</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <a 
              href="/" 
              target="_blank"
              className="text-sm text-sage-500 hover:text-sage-700 flex items-center gap-1"
              title="Webseite ansehen"
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline">Webseite ansehen</span>
            </a>
            <Link
              to="/admin/settings"
              className="p-2 rounded-lg hover:bg-sand-100 text-sage-600 transition-colors"
              title="Einstellungen"
            >
              <Settings className="w-5 h-5" />
            </Link>
            <button 
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-sand-100 text-sage-600 transition-colors"
              title="Abmelden"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-sand-100">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('website')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'website'
                  ? 'border-sage-500 text-sage-700'
                  : 'border-transparent text-sage-400 hover:text-sage-600'
              }`}
            >
              <Layout className="w-4 h-4" />
              Webseite bearbeiten
            </button>
            <button
              onClick={() => setActiveTab('galleries')}
              className={`py-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
                activeTab === 'galleries'
                  ? 'border-sage-500 text-sage-700'
                  : 'border-transparent text-sage-400 hover:text-sage-600'
              }`}
            >
              <FolderOpen className="w-4 h-4" />
              Kunden-Galerien
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Website Tab */}
        {activeTab === 'website' && (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-serif text-sage-800">Webseite bearbeiten</h1>
              <p className="text-sage-500 mt-1">
                Passe deine Webseite an - Texte, Bilder und mehr
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {websiteSections.map((section) => {
                const Icon = section.icon;
                return (
                  <Link
                    key={section.id}
                    to={`/admin/website/${section.id}`}
                    className="card p-5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${section.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-sage-800 group-hover:text-sage-600 transition-colors">
                          {section.name}
                        </h3>
                        <p className="text-sm text-sage-500 mt-0.5">
                          {section.description}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-sage-300 group-hover:text-sage-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Preview hint */}
            <div className="mt-8 p-4 bg-sand-50 rounded-xl border border-sand-100">
              <p className="text-sm text-sage-600">
                💡 <strong>Tipp:</strong> Öffne deine{' '}
                <a href="/" target="_blank" className="text-sage-700 underline">
                  Webseite in einem neuen Tab
                </a>
                , um Änderungen live zu sehen.
              </p>
            </div>
          </div>
        )}

        {/* Galleries Tab */}
        {activeTab === 'galleries' && (
          <div>
            {/* Title + Add Button */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-serif text-sage-800">Kunden-Galerien</h1>
                <p className="text-sage-500 mt-1">
                  {galleries.length} {galleries.length === 1 ? 'Galerie' : 'Galerien'}
                </p>
              </div>
              
              <Link
                to="/admin/gallery/new"
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Neue Galerie
              </Link>
            </div>

            {/* Galleries Grid */}
            {loading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-sage-500 mx-auto" />
              </div>
            ) : galleries.length === 0 ? (
              <div className="card p-12 text-center">
                <Images className="w-16 h-16 mx-auto text-sage-300 mb-4" />
                <h2 className="text-xl font-medium text-sage-700 mb-2">
                  Noch keine Galerien
                </h2>
                <p className="text-sage-500 mb-6">
                  Erstelle deine erste Galerie und lade Fotos hoch.
                </p>
                <Link
                  to="/admin/gallery/new"
                  className="btn-primary inline-flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Erste Galerie erstellen
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {galleries.map((gallery) => {
                  const covers = coverPhotosByGallery[gallery.id] || [];
                  const [bigCover, smallCover1, smallCover2] = [covers[0], covers[1], covers[2]];
                  return (
                  <div key={gallery.id} className="card group relative overflow-visible">
                    {/* Gallery Preview / Collage */}
                    <div className="aspect-video bg-gradient-to-br from-sand-100 to-sand-200 grid grid-cols-3 gap-0.5 p-0.5 rounded-t-xl overflow-hidden">
                      <div className="col-span-2 row-span-2 bg-sand-200 flex items-center justify-center overflow-hidden">
                        {bigCover ? (
                          <img
                            src={bigCover.thumbnailUrl || bigCover.url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Images className="w-10 h-10 text-sand-400" />
                        )}
                      </div>
                      <div className="bg-sand-200 flex items-center justify-center overflow-hidden">
                        {smallCover1 ? (
                          <img
                            src={smallCover1.thumbnailUrl || smallCover1.url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Images className="w-6 h-6 text-sand-400" />
                        )}
                      </div>
                      <div className="bg-sand-200 flex items-center justify-center overflow-hidden">
                        {smallCover2 ? (
                          <img
                            src={smallCover2.thumbnailUrl || smallCover2.url}
                            alt=""
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Images className="w-6 h-6 text-sand-400" />
                        )}
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-4">
                      <h3 className="font-medium text-sage-800 truncate">
                        {gallery.title}
                      </h3>
                      
                      <div className="flex items-center gap-3 mt-2 text-sm text-sage-500">
                        <span className="flex items-center gap-1">
                          <Images className="w-4 h-4" />
                          {gallery.photoCount}
                        </span>
                        <span>{formatSize(gallery.totalSize)}</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(gallery.createdAt)}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-4">
                        <Link
                          to={`/admin/gallery/${gallery.id}`}
                          className="btn-secondary text-sm flex-1 text-center"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Bearbeiten
                        </Link>
                        
                        <Link
                          to={`/admin/gallery/${gallery.id}/markers`}
                          className="btn-secondary text-sm px-3"
                          title="Markierungen ansehen"
                        >
                          <Flag className="w-4 h-4" />
                        </Link>
                        
                        <button
                          onClick={() => copyGalleryLink(gallery.slug)}
                          className="btn-secondary text-sm px-3"
                          title="Link kopieren"
                        >
                          {copiedSlug === gallery.slug ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        <a
                          href={`/g/${gallery.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary text-sm px-3"
                          title="Galerie öffnen"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>

                        <button
                          onClick={() => setDeleteGalleryId(gallery.id)}
                          className="btn-secondary text-sm px-3 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200"
                          title="Löschen"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteGalleryId && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setDeleteGalleryId(null)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
              <h3 className="text-lg font-medium text-sage-800 mb-2">
                Galerie löschen?
              </h3>
              <p className="text-sage-600 mb-6">
                Alle Fotos und Markierungen werden unwiderruflich gelöscht.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteGalleryId(null)}
                  className="btn-secondary flex-1"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => handleDeleteGallery(deleteGalleryId)}
                  className="flex-1 px-6 py-2.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors font-medium"
                >
                  Löschen
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
