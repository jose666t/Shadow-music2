
import React, { useState } from 'react';
import { SpotifyTrack } from './types';
import { SearchIcon, MusicNoteIcon } from './IconComponents';

interface SearchViewProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
  results: SpotifyTrack[];
  onTrackSelect: (track: SpotifyTrack, context: SpotifyTrack[]) => void;
  error: string | null;
  currentTrackId?: string | null;
}

const SearchView: React.FC<SearchViewProps> = ({ onSearch, isLoading, results, onTrackSelect, error, currentTrackId }) => {
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  return (
    <div className="p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-white mb-4">Buscar</h1>
      <form onSubmit={handleSearch} className="w-full max-w-md mb-6">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca canciones, artistas..."
            className="w-full bg-neutral-800 border border-transparent text-white rounded-lg py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
            disabled={isLoading}
          />
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-neutral-400" />
          </div>
        </div>
      </form>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-1">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-2 rounded-lg bg-neutral-900 animate-pulse">
                 <div className="w-14 h-14 bg-neutral-800 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-800 rounded w-3/4"></div>
                  <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                </div>
              </div>
            ))}
        </div>
      )}
      
      {/* Error Message */}
      {error && !isLoading && (
          <div className="text-center py-10 px-6 bg-neutral-900 rounded-lg">
              <p className="text-red-400 font-semibold">Oops! Algo salió mal.</p>
              <p className="text-neutral-400 mt-2">{error}</p>
          </div>
      )}

      {/* No Results and Initial State */}
      {!isLoading && !error && results.length === 0 && (
          <div className="text-center text-neutral-500 py-20 px-6">
              <h2 className="text-2xl font-bold text-white">Encuentra tu música</h2>
              <p className="mt-2">Busca en el catálogo de Spotify para empezar a escuchar.</p>
          </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
         <div className="space-y-1">
            {results.map((track) => {
              const isActive = currentTrackId === track.id;
              
              return (
                <div
                  key={track.id}
                  className={`flex items-center gap-4 p-2 rounded-lg transition-all duration-200 cursor-pointer ${isActive ? 'bg-green-500/20' : 'hover:bg-white/10'}`}
                  onClick={() => onTrackSelect(track, results)}
                  aria-label={`Reproducir ${track.name} de ${track.artists.map(a => a.name).join(', ')}`}
                >
                  <div className="relative w-14 h-14 flex-shrink-0">
                    <img src={track.album.images[0]?.url} alt={track.name} className="w-full h-full object-cover rounded bg-neutral-800" />
                  </div>
                  <div className="truncate">
                    <p className={`font-medium truncate ${isActive ? 'text-green-400' : 'text-white'}`}>{track.name}</p>
                    <p className="text-sm text-neutral-400 truncate">{track.artists.map(a => a.name).join(', ')}</p>
                  </div>
                   {isActive && (
                      <div className="ml-auto pr-4">
                        <MusicNoteIcon className="w-5 h-5 text-green-400 animate-pulse" />
                      </div>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default SearchView;
