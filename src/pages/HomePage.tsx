import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { Gallery } from '../types';
import { fetchAllGalleries } from '../lib/mockData';
import { Camera, Images, Calendar, ArrowRight, Loader2 } from 'lucide-react';

export function HomePage() {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);

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

  function formatDate(date: Date): string {
    return new Intl.DateTimeFormat('de-DE', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-sage-50 to-cream-50 py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 text-sage-600 mb-6">
            <Camera className="w-10 h-10" />
            <h1 className="font-serif text-4xl md:text-5xl">Emily's Galerie</h1>
          </div>
          <p className="text-lg text-sage-600 max-w-xl mx-auto">
            Willkommen! Hier findest du deine persönlichen Fotogalerien. 
            Schau dir deine Bilder an, markiere deine Favoriten und lade sie herunter.
          </p>
        </div>
      </div>

      {/* Galleries List */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="font-serif text-2xl text-sage-800 mb-8">Deine Galerien</h2>
        
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-sage-500 mx-auto" />
          </div>
        ) : galleries.length === 0 ? (
          <div className="text-center py-12 text-sage-600">
            <Images className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Galerien vorhanden.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {galleries.map((gallery) => (
              <Link
                key={gallery.id}
                to={`/g/${gallery.slug}`}
                className="card p-6 hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-serif text-xl text-sage-800 group-hover:text-sage-600 transition-colors">
                      {gallery.title}
                    </h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-sage-500">
                      <span className="flex items-center gap-1.5">
                        <Images className="w-4 h-4" />
                        {gallery.photoCount} Fotos
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(gallery.createdAt)}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-sage-400 group-hover:text-sage-600 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
