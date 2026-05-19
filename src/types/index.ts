// Marker colors available for photos
export type MarkerColor = 'none' | 'green' | 'yellow' | 'red' | 'blue';

export interface MarkerConfig {
  color: MarkerColor;
  label: string;
  bgClass: string;
  borderClass: string;
}

export const MARKER_COLORS: Record<MarkerColor, MarkerConfig> = {
  none: { color: 'none', label: 'Keine', bgClass: 'bg-gray-200', borderClass: 'border-gray-300' },
  green: { color: 'green', label: 'Grün', bgClass: 'bg-emerald-400', borderClass: 'border-emerald-500' },
  yellow: { color: 'yellow', label: 'Gelb', bgClass: 'bg-amber-400', borderClass: 'border-amber-500' },
  red: { color: 'red', label: 'Rot', bgClass: 'bg-rose-400', borderClass: 'border-rose-500' },
  blue: { color: 'blue', label: 'Blau', bgClass: 'bg-sky-400', borderClass: 'border-sky-500' },
};

// Photo marker - who marked what
export interface PhotoMarker {
  visitorId: string;
  visitorName?: string;
  color: MarkerColor;
  markedAt: Date;
}

// Individual photo in a gallery
export interface Photo {
  id: string;
  galleryId: string;
  filename: string;
  originalName: string;
  url: string; // Original — wird beim Download geliefert
  watermarkUrl?: string; // verkleinerte Version mit Wasserzeichen, für die Anzeige
  thumbnailUrl?: string;
  width: number;
  height: number;
  size: number; // bytes
  markers: PhotoMarker[];
  uploadedAt: Date;
  order: number;
}

// Gallery containing photos
export interface Gallery {
  id: string;
  slug: string; // URL-friendly identifier
  title: string;
  welcomeText?: string;
  coverPhotoIds?: string[]; // Up to 3 cover photos for collage
  photoCount: number;
  totalSize: number; // bytes
  isPublic: boolean;
  allowDownload: boolean;
  allowMarking: boolean;
  availableMarkers: MarkerColor[];
  watermarkEnabled?: boolean; // wenn true (Default), wird beim Upload ein WZ aufs Bild gerendert
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

// Visitor session (stored in localStorage)
export interface Visitor {
  id: string;
  name?: string;
  createdAt: Date;
}

// Admin user (Emily)
export interface AdminUser {
  uid: string;
  email: string;
  displayName?: string;
}

// Upload progress tracking
export interface UploadProgress {
  photoId: string;
  filename: string;
  progress: number; // 0-100
  status: 'pending' | 'uploading' | 'processing' | 'done' | 'error';
  error?: string;
}

// Gallery statistics
export interface GalleryStats {
  totalViews: number;
  uniqueVisitors: number;
  totalDownloads: number;
  markedPhotos: number;
}
