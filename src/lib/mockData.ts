import type { Gallery, Photo, MarkerColor } from '../types';

// Demo galleries for development
export const mockGalleries: Gallery[] = [
  {
    id: 'gallery-1',
    slug: 'hochzeit-mueller-2024',
    title: 'Hochzeit Familie Müller',
    welcomeText: 'Liebe Familie Müller,\n\nvielen Dank, dass ich euren besonderen Tag begleiten durfte! Hier findet ihr alle Bilder zum Anschauen und Herunterladen. Markiert eure Favoriten gerne mit den farbigen Markierungen.\n\nHerzliche Grüße,\nEmily 📸',
    photoCount: 12,
    totalSize: 45000000,
    isPublic: true,
    allowDownload: true,
    allowMarking: true,
    availableMarkers: ['green', 'yellow', 'red'],
    createdAt: new Date('2024-06-15'),
    updatedAt: new Date('2024-06-16'),
  },
  {
    id: 'gallery-2',
    slug: 'portrait-schmidt',
    title: 'Portrait Session Schmidt',
    welcomeText: 'Hier sind eure Portraits! Markiert bitte eure Top 5 mit grün.',
    photoCount: 8,
    totalSize: 28000000,
    isPublic: true,
    allowDownload: true,
    allowMarking: true,
    availableMarkers: ['green', 'yellow'],
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-07-21'),
  },
  {
    id: 'gallery-3',
    slug: 'firmenfeier-techcorp',
    title: 'TechCorp Sommerfest 2024',
    welcomeText: 'Impressionen vom Sommerfest. Downloads sind freigeschaltet!',
    photoCount: 24,
    totalSize: 89000000,
    isPublic: true,
    allowDownload: true,
    allowMarking: false,
    availableMarkers: [],
    createdAt: new Date('2024-08-10'),
    updatedAt: new Date('2024-08-12'),
  },
];

// Demo photos with placeholder images
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1519741497674-611481863552?w=800',
  'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800',
  'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800',
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=800',
  'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800',
  'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800',
];

function generateMockPhotos(galleryId: string, count: number): Photo[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${galleryId}-photo-${i + 1}`,
    galleryId,
    filename: `photo_${i + 1}.jpg`,
    originalName: `IMG_${1000 + i}.jpg`,
    url: DEMO_IMAGES[i % DEMO_IMAGES.length],
    thumbnailUrl: DEMO_IMAGES[i % DEMO_IMAGES.length].replace('w=800', 'w=400'),
    width: 1920,
    height: 1280,
    size: 3500000 + Math.random() * 1500000,
    markers: i % 3 === 0 ? [
      { visitorId: 'demo-visitor', visitorName: 'Max', color: 'green' as MarkerColor, markedAt: new Date() }
    ] : [],
    uploadedAt: new Date(Date.now() - i * 3600000),
    order: i,
  }));
}

export const mockPhotos: Record<string, Photo[]> = {
  'gallery-1': generateMockPhotos('gallery-1', 12),
  'gallery-2': generateMockPhotos('gallery-2', 8),
  'gallery-3': generateMockPhotos('gallery-3', 24),
};

// Helper to simulate async operations
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Mock API functions
export async function fetchGalleryBySlug(slug: string): Promise<Gallery | null> {
  await delay(300);
  return mockGalleries.find(g => g.slug === slug) || null;
}

export async function fetchGalleryPhotos(galleryId: string): Promise<Photo[]> {
  await delay(500);
  return mockPhotos[galleryId] || [];
}

export async function fetchAllGalleries(): Promise<Gallery[]> {
  await delay(300);
  return mockGalleries;
}
