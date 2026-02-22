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