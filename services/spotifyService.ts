import { SpotifyTrack, SpotifyPlaylist } from '../components/types';

const CLIENT_ID = '58210b4ab22e4b209cf4333bc46824ee'; 
const REDIRECT_URI = `${window.location.origin}/`;
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const API_ENDPOINT = "https://api.spotify.com/v1";

const SCOPES = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-library-read",
    "user-library-modify",
    "playlist-read-private"
];

export const redirectToLogin = () => {
    window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}&response_type=token&show_dialog=true`;
}

const fetchFromSpotify = async (token: string, endpoint: string) => {
    const response = await fetch(`${API_ENDPOINT}${endpoint}`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        throw new Error(`Spotify API responded with ${response.status}`);
    }
    return response.json();
}

export const searchTracks = async (token: string, query: string): Promise<SpotifyTrack[]> => {
    if (!query) return [];
    const result = await fetchFromSpotify(token, `/search?q=${encodeURIComponent(query)}&type=track&limit=20`);
    return result.tracks.items;
};

export const getFeaturedPlaylists = async (token: string): Promise<{message: string, playlists: { items: SpotifyPlaylist[] }}> => {
    return fetchFromSpotify(token, '/browse/featured-playlists?limit=10');
}

export const getPlaylistsForCategory = async (token: string, categoryId: string): Promise<{playlists: { items: SpotifyPlaylist[] }}> => {
    return fetchFromSpotify(token, `/browse/categories/${categoryId}/playlists?limit=10`);
}

export const play = async (token: string, deviceId: string, { context_uri, uris, offset }: { context_uri?: string, uris?: string[], offset?: any }) => {
  const body: { context_uri?: string, uris?: string[], offset?: any, position_ms: number } = { position_ms: 0 };
  if (context_uri) {
      body.context_uri = context_uri;
  } else if (uris) {
      body.uris = uris;
  }

  if (offset) {
      body.offset = offset;
  }

  await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
};

export const addToMySavedTracks = async (token: string, trackId: string) => {
    await fetch(`${API_ENDPOINT}/me/tracks`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: [trackId] }),
    });
}
