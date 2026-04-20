// ============================================================
// albumService.ts — Album Business Logic Layer
// Sits between the API routes (controllers) and the repository.
// Handles validation and orchestration — routes stay thin,
// repositories stay focused on SQL only.
// ============================================================

import * as albumRepo from '@/lib/repositories/albumRepository';
import { Album, Track } from '@/app/lib/types';

// Return all albums with their tracks
export async function listAlbums(): Promise<Album[]> {
  return albumRepo.getAllAlbums();
}

// Return a single album or throw if not found
export async function getAlbum(albumId: number): Promise<Album> {
  const album = await albumRepo.getAlbumById(albumId);
  if (!album) throw new Error('Album not found');
  return album;
}

// Validate required fields and create a new album
export async function createAlbum(data: {
  title: string;
  artist: string;
  year: number;
  description?: string | null;
  image?: string | null;
  tracks?: Track[];
}): Promise<number> {
  // Business rule: title, artist, and year are required
  if (!data.title || !data.artist || data.year == null) {
    throw new Error('Missing required fields: title, artist, year');
  }
  return albumRepo.createAlbum(data);
}

// Validate and update an existing album
export async function updateAlbum(
  albumId: number,
  data: {
    title: string;
    artist: string;
    year: number;
    description?: string | null;
    image?: string | null;
    tracks?: Track[];
  }
): Promise<void> {
  if (!albumId) throw new Error('Missing albumId');
  await albumRepo.updateAlbum(albumId, data);
}

// Delete an album and return whether it existed
export async function deleteAlbum(albumId: number): Promise<boolean> {
  return albumRepo.deleteAlbum(albumId);
}
