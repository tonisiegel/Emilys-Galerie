import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Instagram, Mail, ChevronDown, Camera } from "lucide-react";

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
  size: "S" | "M" | "L";
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

// Demo content - later from Firebase
const defaultHero: HeroContent = {
  title: "Emily's Fotografie",
  subtitle: "Momente festhalten, Erinnerungen schaffen",
  backgroundImage:
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1920&q=80",
};

const defaultAbout: AboutContent = {
  text: `Hallo, ich bin Emily! 📸

Seit über 5 Jahren fotografiere ich mit Leidenschaft Menschen und ihre Geschichten. Ob Hochzeit, Portrait oder Familienfeier - ich liebe es, authentische Momente einzufangen.

Mein Stil ist natürlich, warm und persönlich. Ich möchte, dass ihr euch vor meiner Kamera wohlfühlt und einfach ihr selbst sein könnt.

Ich freue mich darauf, euch kennenzulernen!`,
  image:
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
};

const defaultPortfolio: PortfolioImage[] = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800",
    alt: "Hochzeit",
    size: "L",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800",
    alt: "Portrait",
    size: "M",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800",
    alt: "Portrait",
    size: "S",
  },
  {
    id: "4",
    url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800",
    alt: "Fashion",
    size: "S",
  },
  {
    id: "5",
    url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800",
    alt: "Hochzeit",
    size: "M",
  },
  {
    id: "6",
    url: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800",
    alt: "Hochzeit",
    size: "L",
  },
  {
    id: "7",
    url: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800",
    alt: "Hochzeit",
    size: "S",
  },
  {
    id: "8",
    url: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800",
    alt: "Familie",
    size: "M",
  },
  {
    id: "9",
    url: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800",
    alt: "Portrait",
    size: "S",
  },
  {
    id: "10",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800",
    alt: "Portrait",
    size: "M",
  },
  {
    id: "11",
    url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800",
    alt: "Beauty",
    size: "L",
  },
  {
    id: "12",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800",
    alt: "Portrait",
    size: "S",
  },
];

const defaultPrices: PricePackage[] = [
  {
    id: "1",
    name: "Portrait Session",
    price: "ab 150€",
    description: "Perfekt für Einzelportraits und Bewerbungsfotos",
    features: [
      "1-2 Stunden Shooting",
      "10 bearbeitete Bilder",
      "Online-Galerie",
      "Alle Bilder als Download",
    ],
  },
  {
    id: "2",
    name: "Paar & Familie",
    price: "ab 250€",
    description: "Für Paare, Familien und kleine Gruppen",
    features: [
      "2-3 Stunden Shooting",
      "20 bearbeitete Bilder",
      "Online-Galerie",
      "Alle Bilder als Download",
      "Location nach Wahl",
    ],
  },
  {
    id: "3",
    name: "Hochzeit",
    price: "ab 1.200€",
    description: "Euer großer Tag in Bildern",
    features: [
      "Ganztägige Begleitung",
      "200+ bearbeitete Bilder",
      "Online-Galerie",
      "Alle Bilder als Download",
      "Verlobungsshooting inkl.",
      "Hochzeitsalbum optional",
    ],
  },
];

const defaultContact: ContactContent = {
  email: "hello@emilys-fotografie.de",
  instagram: "https://instagram.com/emilys_fotografie",
  instagramHandle: "@emilys_fotografie",
};

export function LandingPage() {
  const [hero] = useState<HeroContent>(defaultHero);
  const [about] = useState<AboutContent>(defaultAbout);
  const [portfolio] = useState<PortfolioImage[]>(defaultPortfolio);
  const [prices] = useState<PricePackage[]>(defaultPrices);
  const [contact] = useState<ContactContent>(defaultContact);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll for header background
  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 50);
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-cream-50">
      {/* Fixed Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-sm shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            to="/"
            className={`flex items-center gap-2 font-serif text-xl transition-colors ${
              scrolled ? "text-sage-700" : "text-white"
            }`}
          >
            <Camera className="w-6 h-6" />
            Emily's Fotografie
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {["Über mich", "Portfolio", "Preise", "Kontakt"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                className={`text-sm font-medium transition-colors hover:opacity-70 ${
                  scrolled ? "text-sage-700" : "text-white"
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
        <div className="absolute inset-0">
          <img
            src={hero.backgroundImage}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="font-serif text-5xl md:text-7xl mb-4">{hero.title}</h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            {hero.subtitle}
          </p>
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
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-xl">
                <img
                  src={about.image}
                  alt="Emily"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sage-200 rounded-2xl -z-10" />
            </div>

            {/* Text */}
            <div>
              <h2 className="font-serif text-4xl text-sage-800 mb-6">
                Über mich
              </h2>
              <div className="prose prose-sage">
                {about.text.split("\n\n").map((paragraph, idx) => (
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
      <section id="portfolio" className="py-24 px-4 bg-sand-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-serif text-4xl text-sage-800 mb-4 text-center">
            Portfolio
          </h2>
          <p className="text-sage-600 text-center mb-12 max-w-xl mx-auto">
            Eine Auswahl meiner liebsten Arbeiten
          </p>

          {/* Masonry Grid */}
          <div className="columns-3 gap-3 space-y-3">
            {portfolio.map((image) => {
              // Determine height based on size
              const heightClass =
                image.size === "L"
                  ? "aspect-[3/4]"
                  : image.size === "M"
                    ? "aspect-square"
                    : "aspect-[4/3]";

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

      {/* Prices Section */}
      <section id="preise" className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-serif text-4xl text-sage-800 mb-4 text-center">
            Preise
          </h2>
          <p className="text-sage-600 text-center mb-12 max-w-xl mx-auto">
            Transparente Preise für unvergessliche Erinnerungen
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            {prices.map((pkg, idx) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl p-6 shadow-sm border border-sand-100
                           hover:shadow-lg transition-shadow ${
                             idx === 1
                               ? "md:-mt-4 md:mb-4 ring-2 ring-sage-300"
                               : ""
                           }`}
              >
                <h3 className="font-serif text-2xl text-sage-800 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-3xl font-medium text-sage-600 mb-3">
                  {pkg.price}
                </p>
                <p className="text-sage-500 text-sm mb-6">{pkg.description}</p>

                <ul className="space-y-2">
                  {pkg.features.map((feature, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-sage-600"
                    >
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

      {/* Contact / Instagram Section */}
      <section id="kontakt" className="py-24 px-4 bg-sage-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-4xl mb-4">Let's connect!</h2>
          <p className="text-white/80 mb-12 max-w-xl mx-auto">
            Schreib mir eine Nachricht oder folge mir auf Instagram für mehr
            Einblicke in meine Arbeit.
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
          </div>

          {/* Instagram Feed Preview Placeholder */}
          <div className="mt-16 grid grid-cols-3 md:grid-cols-6 gap-2 max-w-2xl mx-auto">
            {portfolio.slice(0, 6).map((img) => (
              <a
                key={img.id}
                href={contact.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="aspect-square rounded-lg overflow-hidden opacity-80 hover:opacity-100 transition-opacity"
              >
                <img
                  src={img.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-sage-700 text-white/60 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>
            © {new Date().getFullYear()} Emily's Fotografie. Alle Rechte
            vorbehalten.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/impressum"
              className="hover:text-white transition-colors"
            >
              Impressum
            </Link>
            <Link
              to="/datenschutz"
              className="hover:text-white transition-colors"
            >
              Datenschutz
            </Link>
            <Link
              to="/admin/login"
              className="hover:text-white transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
