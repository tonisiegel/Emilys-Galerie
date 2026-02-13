import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Gallery } from "../types";
import { fetchAllGalleries } from "../lib/mockData";
import {
  Camera,
  Plus,
  Images,
  Calendar,
  ExternalLink,
  Settings,
  LogOut,
  Trash2,
  Edit,
  Copy,
  Check,
  Loader2,
  Flag,
} from "lucide-react";

interface AdminDashboardProps {
  onLogout: () => void;
}

export function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchAllGalleries();
        setGalleries(data);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function handleLogout() {
    localStorage.removeItem("admin_logged_in");
    onLogout();
    navigate("/admin/login");
  }

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
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

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg hover:bg-sand-100 text-sage-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
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

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Title + Add Button */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif text-sage-800">
              Meine Galerien
            </h1>
            <p className="text-sage-500 mt-1">
              {galleries.length}{" "}
              {galleries.length === 1 ? "Galerie" : "Galerien"}
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
            {galleries.map((gallery) => (
              <div
                key={gallery.id}
                className="card group relative overflow-visible"
              >
                {/* Gallery Preview / Collage */}
                <div className="aspect-video bg-gradient-to-br from-sand-100 to-sand-200 grid grid-cols-3 gap-0.5 p-0.5">
                  {/* Großes Bild links (2/3) */}
                  <div className="col-span-2 row-span-2 bg-sand-200 rounded-l-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Images className="w-10 h-10 text-sand-400" />
                    </div>
                  </div>
                  {/* Zwei kleine Bilder rechts (1/3) */}
                  <div className="bg-sand-200 rounded-tr-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Images className="w-6 h-6 text-sand-400" />
                    </div>
                  </div>
                  <div className="bg-sand-200 rounded-br-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center">
                      <Images className="w-6 h-6 text-sand-400" />
                    </div>
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

                    {/* Delete Button */}
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
            ))}
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
                  onClick={() => {
                    setGalleries((prev) =>
                      prev.filter((g) => g.id !== deleteGalleryId),
                    );
                    setDeleteGalleryId(null);
                  }}
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
