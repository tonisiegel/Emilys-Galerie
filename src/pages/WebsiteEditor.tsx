import { useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { ImageCropSelector } from "../components/ImageCropSelector";
import { useDropzone } from "react-dropzone";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ArrowLeft,
  Save,
  Upload,
  X,
  Loader2,
  Check,
  Camera,
  Plus,
  Trash2,
  GripVertical,
  ExternalLink,
} from "lucide-react";

// Types
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

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Sortable Portfolio Image
function SortablePortfolioImage({
  image,
  onRemove,
  onSizeChange,
}: {
  image: PortfolioImage;
  onRemove: (id: string) => void;
  onSizeChange: (id: string, size: "S" | "M" | "L") => void;
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
    image.size === "L"
      ? "aspect-[3/4]"
      : image.size === "M"
        ? "aspect-square"
        : "aspect-[4/3]";

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
        {(["S", "M", "L"] as const).map((size) => (
          <button
            key={size}
            onClick={() => onSizeChange(image.id, size)}
            className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors ${
              image.size === size
                ? "bg-sage-600 text-white"
                : "bg-white/90 text-sage-700 hover:bg-white"
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

  const [heroTitle, setHeroTitle] = useState("Emily's Fotografie");
  const [heroSubtitle, setHeroSubtitle] = useState(
    "Momente festhalten, Erinnerungen schaffen",
  );
  const [heroImage, setHeroImage] = useState(
    "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=1920&q=80",
  );
  const [heroDesktopCrop, setHeroDesktopCrop] = useState<CropArea>({
    x: 0,
    y: 10,
    width: 100,
    height: 50,
  });
  const [heroMobileCrop, setHeroMobileCrop] = useState<CropArea>({
    x: 35,
    y: 0,
    width: 30,
    height: 100,
  });

  // About state
  const [aboutText, setAboutText] = useState(`Hallo, ich bin Emily! 📸

Seit über 5 Jahren fotografiere ich mit Leidenschaft Menschen und ihre Geschichten. Ob Hochzeit, Portrait oder Familienfeier - ich liebe es, authentische Momente einzufangen.

Mein Stil ist natürlich, warm und persönlich. Ich möchte, dass ihr euch vor meiner Kamera wohlfühlt und einfach ihr selbst sein könnt.

Ich freue mich darauf, euch kennenzulernen!`);
  const [aboutImage, setAboutImage] = useState(
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&q=80",
  );

  // Portfolio state
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([
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
  ]);

  // Prices state
  const [prices, setPrices] = useState<PricePackage[]>([
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
  ]);

  // Contact state
  const [contactEmail, setContactEmail] = useState(
    "hello@emilys-fotografie.de",
  );
  const [contactInstagram, setContactInstagram] = useState(
    "https://instagram.com/emilys_fotografie",
  );
  const [contactInstagramHandle, setContactInstagramHandle] =
    useState("@emilys_fotografie");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Handle image upload
  const onDropHero = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setHeroImage(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const onDropAbout = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) {
      setAboutImage(URL.createObjectURL(acceptedFiles[0]));
    }
  }, []);

  const onDropPortfolio = useCallback((acceptedFiles: File[]) => {
    const newImages = acceptedFiles.map((file, idx) => ({
      id: `new-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      alt: file.name,
      size: "M" as const,
    }));
    setPortfolioImages((prev) => [...prev, ...newImages]);
  }, []);

  const heroDropzone = useDropzone({
    onDrop: onDropHero,
    accept: { "image/*": [] },
    multiple: false,
  });
  const aboutDropzone = useDropzone({
    onDrop: onDropAbout,
    accept: { "image/*": [] },
    multiple: false,
  });
  const portfolioDropzone = useDropzone({
    onDrop: onDropPortfolio,
    accept: { "image/*": [] },
    multiple: true,
  });

  // Portfolio handlers
  function handlePortfolioDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPortfolioImages((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  }

  function removePortfolioImage(id: string) {
    setPortfolioImages((prev) => prev.filter((img) => img.id !== id));
  }

  function changeImageSize(id: string, size: "S" | "M" | "L") {
    setPortfolioImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, size } : img)),
    );
  }

  // Price handlers
  function updatePrice(
    id: string,
    field: keyof PricePackage,
    value: string | string[],
  ) {
    setPrices((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function addFeature(priceId: string) {
    setPrices((prev) =>
      prev.map((p) =>
        p.id === priceId ? { ...p, features: [...p.features, ""] } : p,
      ),
    );
  }

  function updateFeature(priceId: string, featureIndex: number, value: string) {
    setPrices((prev) =>
      prev.map((p) =>
        p.id === priceId
          ? {
              ...p,
              features: p.features.map((f, i) =>
                i === featureIndex ? value : f,
              ),
            }
          : p,
      ),
    );
  }

  function removeFeature(priceId: string, featureIndex: number) {
    setPrices((prev) =>
      prev.map((p) =>
        p.id === priceId
          ? { ...p, features: p.features.filter((_, i) => i !== featureIndex) }
          : p,
      ),
    );
  }

  function addPricePackage() {
    setPrices((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        name: "Neues Paket",
        price: "ab X€",
        description: "Beschreibung",
        features: ["Leistung 1"],
      },
    ]);
  }

  function removePricePackage(id: string) {
    setPrices((prev) => prev.filter((p) => p.id !== id));
  }

  // Save handler
  async function handleSave() {
    setSaving(true);
    // TODO: Save to Firebase
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  // Section titles
  const sectionTitles: Record<string, string> = {
    hero: "Hero-Bereich",
    about: "Über mich",
    portfolio: "Portfolio",
    prices: "Preise",
    contact: "Kontakt",
  };

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
                {sectionTitles[section || ""] || "Bearbeiten"}
              </span>
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
              {saving ? "Speichern..." : saved ? "Gespeichert!" : "Speichern"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Editor */}
        {section === "hero" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">
                Hintergrundbild
              </h2>

              {/* Upload Zone */}
              <div
                {...heroDropzone.getRootProps()}
                className={`mb-6 border-2 border-dashed rounded-xl p-6 text-center cursor-pointer ${
                  heroDropzone.isDragActive
                    ? "border-sage-400 bg-sage-50"
                    : "border-sand-200 hover:border-sage-300"
                }`}
              >
                <input {...heroDropzone.getInputProps()} />
                <Upload className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                <p className="text-sage-600">Neues Bild hochladen</p>
              </div>

              {/* Crop Selector */}
              <ImageCropSelector
                imageUrl={heroImage}
                desktopCrop={heroDesktopCrop}
                mobileCrop={heroMobileCrop}
                onDesktopCropChange={setHeroDesktopCrop}
                onMobileCropChange={setHeroMobileCrop}
              />
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">Texte</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">
                    Überschrift
                  </label>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">
                    Untertitel
                  </label>
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
        {section === "about" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">
                Profilbild
              </h2>
              <div
                {...aboutDropzone.getRootProps()}
                className={`relative w-48 aspect-[4/5] rounded-xl overflow-hidden cursor-pointer border-2 border-dashed ${
                  aboutDropzone.isDragActive
                    ? "border-sage-400 bg-sage-50"
                    : "border-sand-200"
                }`}
              >
                <input {...aboutDropzone.getInputProps()} />
                <img
                  src={aboutImage}
                  alt="Profil"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                  <Upload className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">
                Text über dich
              </h2>
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
        {section === "portfolio" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">
                Portfolio-Bilder
              </h2>

              {/* Upload Zone */}
              <div
                {...portfolioDropzone.getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer mb-6 ${
                  portfolioDropzone.isDragActive
                    ? "border-sage-400 bg-sage-50"
                    : "border-sand-200 hover:border-sage-300"
                }`}
              >
                <input {...portfolioDropzone.getInputProps()} />
                <Upload className="w-8 h-8 text-sage-400 mx-auto mb-2" />
                <p className="text-sage-600">
                  Bilder hierher ziehen oder klicken
                </p>
              </div>

              {/* Images Grid */}
              <p className="text-sm text-sage-500 mb-3">
                Ziehe Bilder um die Reihenfolge zu ändern. Wähle S/M/L für die
                Größe.
              </p>

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handlePortfolioDragEnd}
              >
                <SortableContext
                  items={portfolioImages.map((i) => i.id)}
                  strategy={rectSortingStrategy}
                >
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

        {/* Prices Editor */}
        {section === "prices" && (
          <div className="space-y-6">
            {prices.map((pkg, idx) => (
              <div key={pkg.id} className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-sage-800">
                    Paket {idx + 1}
                  </h2>
                  {prices.length > 1 && (
                    <button
                      onClick={() => removePricePackage(pkg.id)}
                      className="text-sage-400 hover:text-rose-500 p-1"
                      title="Paket löschen"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1.5">
                        Name
                      </label>
                      <input
                        type="text"
                        value={pkg.name}
                        onChange={(e) =>
                          updatePrice(pkg.id, "name", e.target.value)
                        }
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-sage-700 mb-1.5">
                        Preis
                      </label>
                      <input
                        type="text"
                        value={pkg.price}
                        onChange={(e) =>
                          updatePrice(pkg.id, "price", e.target.value)
                        }
                        className="input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1.5">
                      Beschreibung
                    </label>
                    <input
                      type="text"
                      value={pkg.description}
                      onChange={(e) =>
                        updatePrice(pkg.id, "description", e.target.value)
                      }
                      className="input"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-1.5">
                      Leistungen
                    </label>
                    <div className="space-y-2">
                      {pkg.features.map((feature, featureIdx) => (
                        <div key={featureIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) =>
                              updateFeature(pkg.id, featureIdx, e.target.value)
                            }
                            className="input flex-1"
                            placeholder="z.B. 10 bearbeitete Bilder"
                          />
                          <button
                            onClick={() => removeFeature(pkg.id, featureIdx)}
                            className="p-2 text-sage-400 hover:text-rose-500"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                      <button
                        onClick={() => addFeature(pkg.id)}
                        className="text-sm text-sage-500 hover:text-sage-700 flex items-center gap-1"
                      >
                        <Plus className="w-4 h-4" />
                        Leistung hinzufügen
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {prices.length < 5 && (
              <button
                onClick={addPricePackage}
                className="card p-6 border-2 border-dashed border-sand-200 hover:border-sage-300 
                   text-sage-500 hover:text-sage-700 transition-colors flex items-center justify-center gap-2 w-full"
              >
                <Plus className="w-5 h-5" />
                Paket hinzufügen
              </button>
            )}
          </div>
        )}

        {/* Contact Editor */}
        {section === "contact" && (
          <div className="space-y-6">
            <div className="card p-6">
              <h2 className="text-lg font-medium text-sage-800 mb-4">
                Kontaktdaten
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">
                    E-Mail
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">
                    Instagram Handle
                  </label>
                  <input
                    type="text"
                    value={contactInstagramHandle}
                    onChange={(e) => setContactInstagramHandle(e.target.value)}
                    className="input"
                    placeholder="@emilys_fotografie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-sage-700 mb-1.5">
                    Instagram Link
                  </label>
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
