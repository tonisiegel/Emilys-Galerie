import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from './firebase';
import type { Gallery, Photo, MarkerColor } from '../types';

// ============ GALLERIES ============

export async function createGallery(gallery: Omit<Gallery, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const galleriesRef = collection(db, 'galleries');
  const newGalleryRef = doc(galleriesRef);
  
  await setDoc(newGalleryRef, {
    ...gallery,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  
  return newGalleryRef.id;
}

export async function getGallery(id: string): Promise<Gallery | null> {
  const docRef = doc(db, 'galleries', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
  } as Gallery;
}

export async function getGalleryBySlug(slug: string): Promise<Gallery | null> {
  const q = query(collection(db, 'galleries'), where('slug', '==', slug));
  const querySnapshot = await getDocs(q);
  
  if (querySnapshot.empty) return null;
  
  const docSnap = querySnapshot.docs[0];
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
    updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
  } as Gallery;
}

export async function getAllGalleries(): Promise<Gallery[]> {
  const q = query(collection(db, 'galleries'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      createdAt: (data.createdAt as Timestamp)?.toDate() || new Date(),
      updatedAt: (data.updatedAt as Timestamp)?.toDate() || new Date()
    } as Gallery;
  });
}

export async function updateGallery(id: string, updates: Partial<Gallery>): Promise<void> {
  const docRef = doc(db, 'galleries', id);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });
}

export async function deleteGallery(id: string): Promise<void> {
  // First delete all photos in the gallery
  const photos = await getGalleryPhotos(id);
  for (const photo of photos) {
    await deletePhoto(photo.id);
  }
  
  // Then delete the gallery itself
  const docRef = doc(db, 'galleries', id);
  await deleteDoc(docRef);
}

// ============ PHOTOS ============

export async function addPhoto(photo: Omit<Photo, 'id' | 'uploadedAt'>): Promise<string> {
  const photosRef = collection(db, 'photos');
  const newPhotoRef = doc(photosRef);
  
  await setDoc(newPhotoRef, {
    ...photo,
    uploadedAt: serverTimestamp()
  });
  
  return newPhotoRef.id;
}

export async function getPhoto(id: string): Promise<Photo | null> {
  const docRef = doc(db, 'photos', id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data();
  return {
    id: docSnap.id,
    ...data,
    uploadedAt: (data.uploadedAt as Timestamp)?.toDate() || new Date()
  } as Photo;
}

export async function getGalleryPhotos(galleryId: string): Promise<Photo[]> {
  const q = query(
    collection(db, 'photos'), 
    where('galleryId', '==', galleryId),
    orderBy('order', 'asc')
  );
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      ...data,
      uploadedAt: (data.uploadedAt as Timestamp)?.toDate() || new Date()
    } as Photo;
  });
}

export async function updatePhoto(id: string, updates: Partial<Photo>): Promise<void> {
  const docRef = doc(db, 'photos', id);
  await updateDoc(docRef, updates);
}

export async function deletePhoto(id: string): Promise<void> {
  const docRef = doc(db, 'photos', id);
  await deleteDoc(docRef);
}

export async function updatePhotoOrder(photos: { id: string; order: number }[]): Promise<void> {
  for (const photo of photos) {
    const docRef = doc(db, 'photos', photo.id);
    await updateDoc(docRef, { order: photo.order });
  }
}

// ============ MARKERS ============

export async function addMarker(
  photoId: string, 
  visitorId: string, 
  visitorName: string | null, 
  color: MarkerColor
): Promise<void> {
  const markersRef = collection(db, 'markers');
  const markerDocId = `${photoId}_${visitorId}`;
  const docRef = doc(markersRef, markerDocId);
  
  await setDoc(docRef, {
    photoId,
    visitorId,
    visitorName,
    color,
    markedAt: serverTimestamp()
  });
}

export async function removeMarker(photoId: string, visitorId: string): Promise<void> {
  const markerDocId = `${photoId}_${visitorId}`;
  const docRef = doc(db, 'markers', markerDocId);
  await deleteDoc(docRef);
}

export async function getPhotoMarkers(photoId: string): Promise<Array<{
  visitorId: string;
  visitorName: string | null;
  color: MarkerColor;
  markedAt: Date;
}>> {
  const q = query(collection(db, 'markers'), where('photoId', '==', photoId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map(docSnap => {
    const data = docSnap.data();
    return {
      visitorId: data.visitorId,
      visitorName: data.visitorName,
      color: data.color as MarkerColor,
      markedAt: (data.markedAt as Timestamp)?.toDate() || new Date()
    };
  });
}

export async function getGalleryMarkers(galleryId: string): Promise<Map<string, Array<{
  visitorId: string;
  visitorName: string | null;
  color: MarkerColor;
  markedAt: Date;
}>>> {
  // First get all photos in the gallery
  const photos = await getGalleryPhotos(galleryId);
  const photoIds = photos.map(p => p.id);
  
  if (photoIds.length === 0) return new Map();
  
  // Then get all markers for those photos
  const markersMap = new Map<string, Array<{
    visitorId: string;
    visitorName: string | null;
    color: MarkerColor;
    markedAt: Date;
  }>>();
  
  for (const photoId of photoIds) {
    const markers = await getPhotoMarkers(photoId);
    if (markers.length > 0) {
      markersMap.set(photoId, markers);
    }
  }
  
  return markersMap;
}

// ============ WEBSITE CONTENT ============

interface WebsiteContent {
  branding: {
    name: string;
    logoUrl: string;
  };
  hero: {
    title: string;
    subtitle: string;
    backgroundImage: string;
    desktopCrop: { x: number; y: number; width: number; height: number };
    mobileCrop: { x: number; y: number; width: number; height: number };
  };
  about: {
    text: string;
    image: string;
  };
  portfolio: Array<{
    id: string;
    url: string;
    alt: string;
    size: 'S' | 'M' | 'L';
  }>;
  faq: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  reviews: Array<{
    id: string;
    name: string;
    text: string;
    rating: number;
    date: string;
  }>;
  contact: {
    email: string;
    instagram: string;
    instagramHandle: string;
  };
}

export async function getWebsiteContent(): Promise<WebsiteContent | null> {
  const docRef = doc(db, 'website', 'content');
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) return null;
  
  return docSnap.data() as WebsiteContent;
}

export async function updateWebsiteContent(section: keyof WebsiteContent, data: unknown): Promise<void> {
  const docRef = doc(db, 'website', 'content');
  await setDoc(docRef, { [section]: data }, { merge: true });
}

export async function initializeWebsiteContent(content: WebsiteContent): Promise<void> {
  const docRef = doc(db, 'website', 'content');
  await setDoc(docRef, content);
}
