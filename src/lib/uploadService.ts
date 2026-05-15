// Photo Upload Service - uses Cloudflare Worker + R2
// Authenticates with Firebase Auth token

import { auth } from './firebase';

const WORKER_URL = import.meta.env.VITE_WORKER_URL || 'https://emilys-galerie.workers.dev';

// Get current user's auth token
async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Not authenticated');
  }
  return user.getIdToken();
}

// Generate unique filename
function generateUniqueFilename(originalName: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop()?.toLowerCase() || 'jpg';
  return `${timestamp}-${random}.${extension}`;
}

// Upload a single photo
export async function uploadPhoto(
  file: File,
  galleryId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; filename: string; size: number; width: number; height: number }> {
  const filename = generateUniqueFilename(file.name);
  const path = `galleries/${galleryId}/${filename}`;
  
  // Get image dimensions first
  const dimensions = await getImageDimensions(file);
  
  // Get auth token
  const token = await getAuthToken();
  
  // Upload with XMLHttpRequest for progress tracking
  const url = await new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable && onProgress) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url);
        } catch {
          reject(new Error('Invalid response'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });
    
    xhr.open('PUT', `${WORKER_URL}/${path}`);
    xhr.setRequestHeader('Content-Type', file.type);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    xhr.send(file);
  });
  
  return {
    url,
    filename,
    size: file.size,
    width: dimensions.width,
    height: dimensions.height,
  };
}

// Delete a photo
export async function deletePhotoFile(
  galleryId: string,
  filename: string
): Promise<void> {
  const path = `galleries/${galleryId}/${filename}`;
  const token = await getAuthToken();

  const response = await fetch(`${WORKER_URL}/${path}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Delete failed: ${response.status}`);
  }
}

// Komfort-Wrapper: löscht ein File anhand der vollständigen R2-URL.
// Schluckt Fehler bewusst — wenn das alte File nicht (mehr) existiert,
// darf der Save trotzdem durchgehen.
export async function deleteR2FileByUrl(url: string | undefined | null): Promise<void> {
  if (!url) return;
  try {
    const u = new URL(url);
    // URL-Format: https://<worker>/galleries/<galleryId>/<filename>
    const parts = u.pathname.split('/').filter(Boolean);
    if (parts.length < 3 || parts[0] !== 'galleries') return;
    const galleryId = parts[1];
    const filename = parts.slice(2).join('/'); // falls Pfad mal Unterordner enthält
    await deletePhotoFile(galleryId, filename);
  } catch (err) {
    console.warn('Konnte altes R2-File nicht löschen:', url, err);
  }
}

// Get image dimensions
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

// Komprimiert ein Bild fürs Web: skaliert auf maxWidth und encodet als JPEG.
// Das Re-Encoding via Canvas entfernt automatisch alle EXIF-Metadaten
// (GPS, Kamera-Modell, Datum etc.) — wichtig für die Privatsphäre.
export async function compressImage(
  file: File,
  maxWidth: number = 2400,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      // Auf maxWidth skalieren (Höhe proportional). Wenn Bild bereits kleiner ist,
      // bleiben Originalmaße — wir gehen aber trotzdem durchs Canvas, damit EXIF weg ist.
      if (width > maxWidth) {
        const ratio = maxWidth / width;
        width = maxWidth;
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas-Kontext nicht verfügbar'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Konvertierung fehlgeschlagen'));
            return;
          }
          // Dateiname auf .jpg setzen, da wir zu JPEG konvertieren
          const newName = file.name.replace(/\.[^.]+$/, '.jpg');
          resolve(new File([blob], newName, { type: 'image/jpeg' }));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Bild konnte nicht geladen werden'));
    };

    img.src = url;
  });
}

// Create a thumbnail (client-side)
export async function createThumbnail(
  file: File,
  maxWidth: number = 400,
  maxHeight: number = 400
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      
      // Calculate new dimensions
      let { width, height } = img;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      
      // Create canvas and draw resized image
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create thumbnail'));
          }
        },
        'image/jpeg',
        0.8
      );
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}
