import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Mail, ChevronDown, Camera, Loader2 } from 'lucide-react';
import { getWebsiteContent } from '../lib/firestoreService';

// Types for editable content
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

interface PricePackage {
  id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
}

interface ContactContent {
  email: string;
  instagram: string;
  instagramHandle: string;
}

// Fallback content if Firebase is empty
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
  const [hero, setHero] = useState<HeroContent>(fallbackHero);
  const [about, setAbout] = useState<AboutContent>(fallbackAbout);
  const [portfolio, setPortfolio] = useState<PortfolioImage[]>([]);
  const [prices, setPrices] = useState<PricePackage[]>([]);
  const [contact, setContact] = useState<ContactContent>(fallbackContact);
  const [scrolled, setScrolled] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load content from Firebase
  useEffect(() => {
    async function loadContent() {
      try {
        const content = await getWebsiteContent();
        if (content) {
          if (content.hero) setHero(content.hero);
          if (content.about) setAbout(content.about);
          if (content.portfolio) setPortfolio(content.portfolio);
          if (content.prices) setPrices(content.prices);
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
            <Camera className="w-6 h-6" />
            Emily's Fotografie
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            {['Über mich', 'Portfolio', 'Preise', 'Kontakt'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  scrolled ? 'text-sage-700' : 'text-white'
                }`}
              >
                {item}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center">
        {/* Background Image */}
        <div 
          className={`absolute inset-0 bg-cover bg-center ${!hero.backgroundImage ? 'bg-sage-600' : ''}`}
          style={hero.backgroundImage ? { backgroundImage: `url(${hero.backgroundImage})` } : undefined}
        >
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
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Prices Section */}
      {prices.length > 0 && (
        <section id="preise" className="py-24 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-serif text-4xl text-sage-800 mb-4 text-center">Preise</h2>
            <p className="text-sage-600 text-center mb-12 max-w-xl mx-auto">
              Transparente Preise für unvergessliche Erinnerungen
            </p>

            <div className={`grid gap-6 ${prices.length === 1 ? 'max-w-md mx-auto' : prices.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' : 'md:grid-cols-3'}`}>
              {prices.map((pkg, idx) => (
              <div 
                key={pkg.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-sand-100
                           hover:shadow-lg transition-shadow ${
                             idx === 1 ? 'md:-mt-4 md:mb-4 ring-2 ring-sage-300' : ''
                           }`}
              >
                <h3 className="font-serif text-2xl text-sage-800 mb-2">{pkg.name}</h3>
                <p className="text-3xl font-medium text-sage-600 mb-3">{pkg.price}</p>
                <p className="text-sage-500 text-sm mb-6">{pkg.description}</p>
                
                <ul className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-sage-600">
                      <span className="text-sage-400 mt-1">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <a 
                  href="#kontakt"
                  className="block mt-6 text-center py-2.5 rounded-lg bg-sand-100 text-sage-700 
                           hover:bg-sage-600 hover:text-white transition-colors font-medium"
                >
                  Anfragen
                </a>
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
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </a>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-sage-700 text-white/60 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} Emily's Fotografie. Alle Rechte vorbehalten.</p>
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
