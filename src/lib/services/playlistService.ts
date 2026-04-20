// ============================================================
// playlistService.ts — Playlist Business Logic + RBAC Layer
// Enforces role-based access control rules:
//   - Guests (unauthenticated): no access
//   - Users (authenticated, non-admin): read only
//   - Admins: full create, read, update, delete
// Routes call this service — they never touch the DB directly.
// ============================================================

import * as playlistRepo from '@/lib/repositories/playlistRepository';
import { Playlist } from '@/app/lib/types';

// Helper: throw a 401 if not authenticated
function requireAuth(role: string | undefined | null) {
  if (!role) throw Object.assign(new Error('Authentication required'), { status: 401 });
}

// Helper: throw a 403 if not an admin
function requireAdmin(role: string | undefined | null) {
  requireAuth(role);
  if (role !== 'admin') throw Object.assign(new Error('Admin access required'), { status: 403 });
}

// GET all playlists — authenticated users and admins only
export async function listPlaylists(role: string | undefined | null): Promise<Playlist[]> {
  requireAuth(role);
  return playlistRepo.getAllPlaylists();
}

// GET one playlist — authenticated users and admins only
export async function getPlaylist(
  playlistId: number,
  role: string | undefined | null
): Promise<Playlist> {
  requireAuth(role);
  const playlist = await playlistRepo.getPlaylistById(playlistId);
  if (!playlist) throw Object.assign(new Error('Playlist not found'), { status: 404 });
  return playlist;
}

// POST create playlist — admins only
export async function createPlaylist(
  name: string,
  role: string | undefined | null
): Promise<Playlist> {
  requireAdmin(role);
  if (!name?.trim()) throw Object.assign(new Error('Missing playlist name'), { status: 400 });
  return playlistRepo.createPlaylist(name.trim());
}

// PUT rename playlist — admins only
export async function updatePlaylist(
  playlistId: number,
  name: string,
  role: string | undefined | null
): Promise<Playlist> {
  requireAdmin(role);
  if (!name?.trim()) throw Object.assign(new Error('Missing name'), { status: 400 });
  const updated = await playlistRepo.updatePlaylist(playlistId, name.trim());
  if (!updated) throw Object.assign(new Error('Playlist not found'), { status: 404 });
  return updated;
}

// DELETE playlist — admins only
export async function deletePlaylist(
  playlistId: number,
  role: string | undefined | null
): Promise<void> {
  requireAdmin(role);
  const deleted = await playlistRepo.deletePlaylist(playlistId);
  if (!deleted) throw Object.assign(new Error('Playlist not found'), { status: 404 });
}

// POST add track to playlist — admins only
export async function addTrack(
  playlistId: number,
  trackId: number,
  position: number,
  role: string | undefined | null
): Promise<void> {
  requireAdmin(role);
  await playlistRepo.addTrackToPlaylist(playlistId, trackId, position);
}

// DELETE remove track from playlist — admins only
export async function removeTrack(
  playlistId: number,
  trackId: number,
  role: string | undefined | null
): Promise<void> {
  requireAdmin(role);
  await playlistRepo.removeTrackFromPlaylist(playlistId, trackId);
}
