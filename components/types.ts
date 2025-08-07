export interface SpotifyImage {
  url: string;
  height: number;
  width: number;
}

export interface SpotifyArtist {
  name: string;
  uri: string;
}

export interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
  uri: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  duration_ms: number;
  uri: string;
  explicit: boolean;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: SpotifyImage[];
  uri: string;
  tracks: {
    href: string;
    total: number;
  };
}

// This will represent the state from the Web Playback SDK
export interface SpotifyPlayerState {
    track_window: {
        current_track: SpotifyTrack;
        previous_tracks: SpotifyTrack[];
        next_tracks: SpotifyTrack[];
    };
    duration: number;
    position: number;
    paused: boolean;
    // ... and many other properties
}
