import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, ChevronDown, ChevronUp, Camera, Loader2, Star } from 'lucide-react';
import { getWebsiteContent } from '../lib/firestoreService';

// Types for editable content
interface BrandingContent {
  name: string;
  logoUrl: string;
}

interface HeroContent {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

interface AboutContent {
  text: string;
  image: string;
}

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
}

// Initialen aus dem Namen ableiten — erstes Wort + letztes Wort, Sonderzeichen wie & ignorieren
function getInitials(name: string): string {
  const cleaned = name.replace(/[^\p{L}\s]/gu, ' ').trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

interface ContactContent {
  email: string;
  instagram: string;
  instagramHandle: string;
}

// Fallback content if Firebase is empty
const fallbackBranding: BrandingContent = {
  name: "emilykleinfotografie",
  logoUrl: ""
};

const fallbackHero: HeroContent = {
  title: "Emily's Fotografie",
  subtitle: "Momente festhalten, Erinnerungen schaffen",
  backgroundImage: ""
};

const fallbackAbout: AboutContent = {
  text: "Willkommen auf meiner Webseite! Hier erfährst du bald mehr über mich.",
  image: ""
};

const fallbackContact: ContactContent = {
  email: 'info@example.de',
  instagram: '',
  instagramHandle: ''
};

export function LandingPage() {
  const [branding, setBranding] = useState<BrandingContent>(fallbackBranding);
  const [hero, setHero] = useState<HeroContent>(fallbackHero);
  const [about, setAbout] = useState<AboutContent>(fallbackAbout);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [contact, setContact] = useState<ContactContent>(fallbackContact);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Load content from Firebase
  useEffect(() => {
    async function loadContent() {
      try {
        const content = await getWebsiteContent();
        if (content) {
          if (content.branding) setBranding(content.branding);
          if (content.hero) setHero(content.hero);
          if (content.about) setAbout(content.about);
          if (content.portfolio) setPortfolio(content.portfolio);
          if (content.faq) setFaqs(content.faq);
          if (content.reviews) setReviews(content.reviews);
          if (content.contact) setContact(content.contact);
        }
      } catch (error) {
        console.error('Error loading website content:', error);
      } finally {
        setLoading(false);
      }
    }
    loadContent();
  }, []);

  // Handle scroll for header background
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-sage-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Fixed Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className={`flex items-center gap-2 font-serif text-xl transition-colors ${
            scrolled ? 'text-sage-700' : 'text-white'
          }`}>
            {branding.logoUrl ? (
              <img
                src={branding.logoUrl}
                alt={branding.name}
                className="h-10 w-auto object-contain"
              />
            ) : (
              <>
                <Camera className="w-6 h-6" />
                {branding.name}
              </>
            )}
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {[
              { label: 'Über mich', anchor: 'über-mich' },
              { label: 'Portfolio', anchor: 'portfolio' },
              { label: 'Fragen', anchor: 'fragen' },
              { label: 'Rezensionen', anchor: 'rezensionen' },
              { label: 'Kontakt', anchor: 'kontakt' },
            ].map((item) => (
              <a
                key={item.anchor}
                href={`#${item.anchor}`}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  scrolled ? 'text-sage-700' : 'text-white'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image */}
        <div className={`absolute inset-0 ${!hero.backgroundImage ? 'bg-sage-600' : ''}`}>
          {hero.backgroundImage && (
            <img
              src={hero.backgroundImage}
              alt=""
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-7xl mb-4">{hero.title}</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">{hero.subtitle}</p>
          <a 
            href="#portfolio"
            className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 
                       text-white px-8 py-3 rounded-full hover:bg-white/30 transition-colors"
          >
            Meine Arbeit entdecken
          </a>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/70 animate-bounce">
          <ChevronDown className="w-8 h-8" />
        </div>
      </section>

      {/* About Section */}
      <section id="über-mich" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl bg-sage-200">
                {about.image ? (
                  <img
                    src={about.image}
                    alt="Emily"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-sage-400">
                    <Camera className="w-16 h-16" />
                  </div>
                )}
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sage-200 rounded-2xl -z-10" />
            </div>

            {/* Text */}
            <div>
              <h2 className="font-serif text-4xl text-sage-800 mb-6">Über mich</h2>
              <div className="prose prose-sage">
                {about.text.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-sage-600 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Portfolio Section */}
      {portfolio.length > 0 && (
        <section id="portfolio" className="py-24 px-4 bg-sand-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="font-serif text-4xl text-sage-800 mb-4 text-center">Portfolio</h2>
            <p className="text-sage-600 text-center mb-12 max-w-xl mx-auto">
              Eine Auswahl meiner liebsten Arbeiten
            </p>

            {/* Masonry Grid */}
            <div className="columns-3 gap-3 space-y-3">
              {portfolio.map((image) => {
                // Determine height based on size
                const heightClass = 
                  image.size === 'L' ? 'aspect-[3/4]' :
                  image.size === 'M' ? 'aspect-square' :
                  'aspect-[4/3]';

                return (
                  <div 
                    key={image.id}
                    className={`break-inside-avoid rounded-xl overflow-hidden shadow-md 
                               hover:shadow-xl transition-shadow duration-300 ${heightClass}`}
                  >
                    <img
                      src={image.url}
                      alt={image.alt}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FAQ Section */}
      {faqs.length > 0 && (
        <section id="fragen" className="py-24 px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl text-sage-800 mb-4 text-center">Häufige Fragen</h2>
            <p className="text-sage-600 text-center mb-12 max-w-xl mx-auto">
              Alles, was du vor unserem Shooting wissen solltest
            </p>

            <div className="space-y-3">
              {faqs.map((item) => {
                const isOpen = openFaqId === item.id;
                return (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-sand-100 shadow-sm overflow-hidden"
                  >
                    <button
                      onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-sand-50 transition-colors"
                    >
                      <span className="font-medium text-sage-800">{item.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-sage-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-sage-500 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-5 text-sage-600 leading-relaxed whitespace-pre-line">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <section id="rezensionen" className="py-24 px-4 bg-sand-50">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-4xl text-sage-800 mb-4 text-center">Rezensionen</h2>
            <p className="text-sage-600 text-center mb-12 max-w-xl mx-auto">
              Was meine Kund:innen über die Shootings sagen
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl p-6 shadow-sm border border-sand-100 flex flex-col"
                >
                  {review.rating > 0 && (
                    <div className="flex gap-0.5 mb-3">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-sand-300'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sage-600 leading-relaxed mb-4 flex-1 italic">
                    „{review.text}"
                  </p>
                  <div className="flex items-center gap-3 border-t border-sand-100 pt-3">
                    {review.image ? (
                      <img
                        src={review.image}
                        alt={review.name}
                        loading="lazy"
                        decoding="async"
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-sage-100 text-sage-700 flex items-center justify-center font-medium text-sm flex-shrink-0">
                        {getInitials(review.name)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sage-800 truncate">{review.name}</p>
                      {review.date && (
                        <p className="text-sm text-sage-400 truncate">{review.date}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact / Instagram Section */}
      <section id="kontakt" className="py-24 px-4 bg-sage-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl mb-4">Let's connect!</h2>
          <p className="text-white/80 mb-12 max-w-xl mx-auto">
            Schreib mir eine Nachricht{contact.instagram ? ' oder folge mir auf Instagram für mehr Einblicke in meine Arbeit.' : '.'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Email Button */}
            <a 
              href={`mailto:${contact.email}`}
              className="flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 
                        px-8 py-4 rounded-full hover:bg-white/20 transition-colors group"
            >
              <Mail className="w-5 h-5" />
              <span>{contact.email}</span>
            </a>

            {/* Instagram Button - Special Design */}
            {contact.instagram && (
              <a 
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 
                          px-8 py-4 rounded-full hover:opacity-90 transition-opacity shadow-lg
                          hover:shadow-xl hover:scale-105 transform transition-all duration-300"
              >
                <Instagram className="w-5 h-5" />
                <span className="font-medium">{contact.instagramHandle}</span>
              </a>
            )}
          </div>

          {/* Instagram Feed Preview Placeholder */}
          {portfolio.length > 0 && contact.instagram && (
            <div className="mt-16 grid grid-cols-3 md:grid-cols-6 gap-2 max-w-2xl mx-auto">
              {portfolio.slice(0, 6).map((img) => (
                <a 
                  key={img.id}
                  href={contact.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="aspect-square rounded-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
                >
                  <img src={img.url} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-sage-700 text-white/60 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {branding.name}. Alle Rechte vorbehalten.</p>
          <div className="flex items-center gap-6">
            <Link to="/impressum" className="hover:text-white transition-colors">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
            <Link to="/admin/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
