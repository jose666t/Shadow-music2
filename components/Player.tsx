
import React from 'react';
import { SpotifyTrack } from './types';
import { PlayIcon, PauseIcon, PlusIcon } from './IconComponents';

interface PlayerProps {
  currentTrack: SpotifyTrack;
  isPlaying: boolean;
  onPlayPause: () => void;
  onOpenFullScreen: () => void;
  onAddToLibrary: (trackId: string) => void;
}

const Player: React.FC<PlayerProps> = ({ currentTrack, isPlaying, onPlayPause, onOpenFullScreen, onAddToLibrary }) => {
  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToLibrary(currentTrack.id);
  };
  
  return (
    <div 
      className="fixed bottom-20 left-2 right-2 h-16 bg-green-600 rounded-lg z-40 text-white p-2 shadow-lg cursor-pointer"
      style={{ transform: 'translateZ(0)' }} // Promotes to its own layer to prevent jitter
      onClick={onOpenFullScreen}
      aria-label="Abrir reproductor a pantalla completa"
      role="button"
    >
      <div className="w-full h-full flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden">
          <img 
            src={currentTrack.album.images[0]?.url} 
            alt={currentTrack.name} 
            className="w-12 h-12 rounded object-cover flex-shrink-0 bg-green-700" 
          />
          <div className="truncate flex-grow">
            <p className="font-bold truncate text-sm">{currentTrack.name}</p>
            <p className="text-xs text-green-100 truncate">{currentTrack.artists.map(a => a.name).join(', ')}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0 pr-2">
           <button onClick={handleAddClick} className="text-white hover:text-white/80 transition-colors" aria-label="Añadir a Tu Biblioteca" >
              <PlusIcon className="w-6 h-6" />
            </button>
            <button onClick={(e) => { e.stopPropagation(); onPlayPause(); }} className="text-white hover:text-white/80 transition-colors" aria-label={isPlaying ? "Pausar" : "Reproducir"}>
              {isPlaying ? <PauseIcon className="w-8 h-8" /> : <PlayIcon className="w-8 h-8" />}
            </button>
        </div>
      </div>
    </div>
  );
};

export default Player;
