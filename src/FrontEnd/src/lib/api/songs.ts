import type { Song } from "@/lib/store";
import { apiFetch } from "./config";
import type { ApiSong } from "./types";

export function mapApiSongToSong(song: ApiSong): Song {
  return {
    id: song.id,
    name: song.title,
    artist: song.artist,
    key: song.keySignature,
    bpm: song.bpm ?? undefined,
    category: song.category ?? "Adoração",
  };
}

export async function fetchSongs(): Promise<Song[]> {
  const songs = await apiFetch<ApiSong[]>("/api/songs");
  return songs.map(mapApiSongToSong);
}
