
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { SpotifyTrack, SpotifyPlayerState, SpotifyPlaylist } from './components/types';
import * as spotifyService from './services/spotifyService';
import SearchView from './components/SearchView';
import Player from './components/Player';
import HomeView from './components/HomeView';
import BottomNav from './components/BottomNav';
import TopHeader from './components/TopHeader';
import FullScreenPlayer from './components/FullScreenPlayer';
import MusicView from './components/MusicView';
import LoginView from './components/LoginView';

// Spotify SDK type definitions for TypeScript
declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: typeof Spotify;
  }
}

declare namespace Spotify {
  interface PlayerInit {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume?: number;
  }

  interface Player {
    connect(): Promise<boolean>;
    disconnect(): void;
    addListener(event: 'ready' | 'not_ready', cb: (state: { device_id: string }) => void): void;
    addListener(event: 'player_state_changed', cb: (state: any | null) => void): void;
    addListener(
      event: 'initialization_error' | 'authentication_error' | 'account_error',
      cb: (error: { message: string }) => void
    ): void;
    togglePlay(): Promise<void>;
    nextTrack(): Promise<void>;
    previousTrack(): Promise<void>;
    seek(position_ms: number): Promise<void>;
  }

  const Player: {
    new(options: PlayerInit): Player;
  };
}


type ActiveView = 'home' | 'search' | 'library' | 'create';
type HomeViewType = 'all' | 'music';

const App: React.FC = () => {
  // Estado de la vista
  const [activeView, setActiveView] = useState<ActiveView>('home');
  const [activeHomeView, setActiveHomeView] = useState<HomeViewType>('all');
  const [isFullScreenPlayerOpen, setIsFullScreenPlayerOpen] = useState(false);

  // Estado de Spotify
  const [token, setToken] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);
  const [playerState, setPlayerState] = useState<SpotifyPlayerState | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isSdkReady, setIsSdkReady] = useState(false);
  
  // Búsqueda
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estado común
  const [error, setError] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLElement>(null);
  
  const currentTrack = playerState?.track_window?.current_track;
  const isPlaying = playerState ? !playerState.paused : false;

  // Manejar token de autenticación
  useEffect(() => {
    const hash = window.location.hash;
    let storedToken = window.sessionStorage.getItem('spotify_token');

    if (!storedToken && hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      if (accessToken) {
        storedToken = accessToken;
        window.sessionStorage.setItem('spotify_token', accessToken);
        window.location.hash = '';
      }
    }
    setToken(storedToken);
  }, []);
  
  // Inicializar Spotify Web Playback SDK
  useEffect(() => {
    if (!token) {
      return;
    }

    const initializePlayer = () => {
      const player = new window.Spotify.Player({
          name: 'Gemini Music Player',
          getOAuthToken: cb => { cb(token); },
          volume: 0.5
      });

      player.addListener('ready', ({ device_id }) => {
          console.log('Ready with Device ID', device_id);
          setDeviceId(device_id);
          setIsSdkReady(true);
      });

      player.addListener('not_ready', ({ device_id }) => {
          console.log('Device ID has gone offline', device_id);
          setDeviceId(null);
      });

      player.addListener('player_state_changed', (state) => {
          if (!state) {
              setPlayerState(null);
              return;
          }
          setPlayerState(state as SpotifyPlayerState);
          console.log(state);
      });
      
      player.addListener('initialization_error', ({ message }) => { 
          console.error('Failed to initialize', message); 
          setError(`Error de inicialización: ${message}. Asegúrate de tener una cuenta Spotify Premium.`);
      });
      player.addListener('authentication_error', ({ message }) => { 
          console.error('Failed to authenticate', message); 
          setError(`Error de autenticación: ${message}. Intenta iniciar sesión de nuevo.`);
          window.sessionStorage.removeItem('spotify_token');
          setToken(null);
      });
      player.addListener('account_error', ({ message }) => { 
          console.error('Account error', message); 
          setError(`Error de cuenta: ${message}. Se requiere Spotify Premium para la reproducción.`);
      });

      player.connect();
      playerRef.current = player;
    };

    if (window.Spotify) {
      // If SDK is already loaded, initialize immediately.
      initializePlayer();
    } else {
      // Otherwise, set the callback.
      window.onSpotifyWebPlaybackSDKReady = initializePlayer;
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.disconnect();
        playerRef.current = null;
      }
    }
  }, [token]);


  const handleSearch = useCallback(async (query: string) => {
    if (!token) return;
    setIsSearching(true);
    setSearchResults([]);
    setError(null);
    mainContentRef.current?.scrollTo(0, 0);
    setActiveView('search');
    
    try {
        const results = await spotifyService.searchTracks(token, query);
        setSearchResults(results);
        if (results.length === 0) {
          setError(`No se encontraron resultados para "${query}" en Spotify.`);
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Ocurrió un error desconocido";
        console.error("Spotify search failed", error);
        setError(`Error al buscar en Spotify: ${errorMessage}`);
    } finally {
        setIsSearching(false);
    }
  }, [token]);
  
  const handlePlayPause = () => playerRef.current?.togglePlay();
  const handleNext = () => playerRef.current?.nextTrack();
  const handlePrevious = () => playerRef.current?.previousTrack();
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => playerRef.current?.seek(Number(e.target.value));

  const handleTrackSelect = (track: SpotifyTrack, context: SpotifyTrack[]) => {
      if (!token || !deviceId) return;
      const uris = context.map(t => t.uri);
      const offset = context.findIndex(t => t.id === track.id);
      
      spotifyService.play(token, deviceId, { uris, offset: { position: offset } });
      setIsFullScreenPlayerOpen(true);
  };

  const handlePlaylistPlay = (playlist: SpotifyPlaylist) => {
    if (!token || !deviceId) return;
    spotifyService.play(token, deviceId, { context_uri: playlist.uri });
    setIsFullScreenPlayerOpen(true);
  }
  
  const handleAddToLibrary = useCallback((trackId: string) => {
      if (!token) return;
      spotifyService.addToMySavedTracks(token, trackId)
        .then(() => {
            // Can show a confirmation notification here
            console.log("Track added to library");
        })
        .catch(err => console.error("Could not add to library", err));
  }, [token]);
  

  const renderView = () => {
    switch(activeView) {
      case 'home':
        if (activeHomeView === 'music') {
          return <MusicView onPlaylistPlay={handlePlaylistPlay} token={token} />;
        }
        return <HomeView onPlaylistPlay={handlePlaylistPlay} token={token}/>;
      case 'search':
        return <SearchView
          onSearch={handleSearch}
          isLoading={isSearching}
          results={searchResults}
          onTrackSelect={handleTrackSelect}
          error={error}
          currentTrackId={currentTrack?.id}
        />;
      case 'library':
      case 'create':
        return <div className="p-6 text-center text-neutral-400">
            <h2 className="text-2xl font-bold text-white mb-2">Página en construcción</h2>
            <p>Esta sección estará disponible próximamente.</p>
          </div>
      default:
        return <HomeView onPlaylistPlay={handlePlaylistPlay} token={token}/>;
    }
  }

  if (!token) {
      return <LoginView />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-neutral-950 text-white overflow-hidden">
        <main ref={mainContentRef} className="flex-1 overflow-y-auto" style={{ paddingBottom: currentTrack ? '144px' : '80px' }}>
            {activeView === 'home' && (
              <TopHeader activeHomeView={activeHomeView} setActiveHomeView={setActiveHomeView} />
            )}
            {error && <div className="bg-red-500/80 text-white text-center p-2 text-sm">{error}</div>}
            {!isSdkReady && <div className="bg-yellow-500/80 text-black text-center p-2 text-sm">Conectando con Spotify...</div>}
            {renderView()}
        </main>
        
        {currentTrack && !isFullScreenPlayerOpen && (
          <Player
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onOpenFullScreen={() => setIsFullScreenPlayerOpen(true)}
            onAddToLibrary={handleAddToLibrary}
          />
        )}

        {currentTrack && playerState && (
          <FullScreenPlayer
            isOpen={isFullScreenPlayerOpen}
            onClose={() => setIsFullScreenPlayerOpen(false)}
            track={currentTrack}
            isPlaying={isPlaying}
            progress={playerState.position}
            duration={playerState.duration}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSeek={handleSeek}
            onAddToLibrary={handleAddToLibrary}
          />
        )}
        
        <BottomNav activeView={activeView} setActiveView={setActiveView} />

    </div>
  );
};

export default App;
