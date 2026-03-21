export type Track = {
  id?: number;
  number: number;
  title: string;
  lyrics?: string | null;
  video?: string | null;
};

export type Album = {
  id: number;
  title: string;
  artist: string;
  year: number;
  image?: string | null;
  description?: string | null;
  tracks?: Track[];
};

export type Playlist = {
  id: number;
  name: string;
  user_id?: number | null;
  created_at?: string;
  track_count?: number;
  tracks?: Track[];
};

export type PlaylistTrack = {
  id: number;
  playlist_id: number;
  track_id: number;
  position: number;
};