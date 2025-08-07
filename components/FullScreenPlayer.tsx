
import React from 'react';
import { SpotifyTrack } from './types';
import {
  ChevronDownIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  PlayIcon,
  PauseIcon,
  PreviousIcon,
  NextIcon,
  ShareIcon,
  DevicePhoneMobileIcon,
} from './IconComponents';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  track: SpotifyTrack;
  isPlaying: boolean;
  progress: number;
  duration: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onAddToLibrary: (trackId: string) => void;
}

const formatTime = (timeInMillis: number) => {
  if (isNaN(timeInMillis) || timeInMillis === 0) return '0:00';
  const totalSeconds = Math.floor(timeInMillis / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
};

const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen,
  onClose,
  track,
  isPlaying,
  progress,
  duration,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onAddToLibrary,
}) => {
  return (
    <div
      className={`fixed inset-0 bg-gradient-to-b from-green-800 to-neutral-900 text-white flex flex-col transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-y-0' : 'translate-y-full'
      }`}
    >
      {/* Cabecera */}
      <header className="relative flex items-center justify-between p-4 z-10">
        <button onClick={onClose} aria-label="Cerrar reproductor">
          <ChevronDownIcon className="w-7 h-7" />
        </button>
        <p className="font-semibold">{track.album.name}</p>
        <button aria-label="Más opciones">
          <EllipsisHorizontalIcon className="w-7 h-7" />
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="relative flex-1 flex flex-col justify-between p-6 space-y-6 z-10">
        {/* Artwork */}
        <div className="flex-1 flex items-center justify-center">
             <img 
                src={track.album.images[0]?.url}
                alt={track.name} 
                className="w-full max-w-sm aspect-square rounded-lg object-cover shadow-2xl shadow-black/50"
             />
        </div>

        {/* Información de la pista y acciones */}
        <div className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold truncate">{track.name}</h1>
              <p className="text-neutral-300 truncate">{track.artists.map(a => a.name).join(', ')}</p>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => onAddToLibrary(track.id)} aria-label="Añadir a Tu Biblioteca">
                <HeartIcon className="w-7 h-7 text-neutral-300 hover:text-white transition-colors" />
              </button>
            </div>
          </div>
        </div>

        {/* Barra de Progreso */}
        <div className="flex-shrink-0 space-y-1.5">
          <input
            type="range"
            min="0"
            max={duration}
            value={progress}
            onChange={onSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs font-mono text-neutral-300">
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controles */}
        <div className="flex-shrink-0 flex items-center justify-around">
          <button onClick={onPrevious} aria-label="Canción anterior" className="text-neutral-300 hover:text-white transition-colors">
            <PreviousIcon className="w-10 h-10" />
          </button>
          <button
            onClick={onPlayPause}
            className="bg-white text-black rounded-full p-4 shadow-lg transform hover:scale-105 transition-transform"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? <PauseIcon className="w-10 h-10" /> : <PlayIcon className="w-10 h-10" />}
          </button>
          <button onClick={onNext} aria-label="Siguiente canción" className="text-neutral-300 hover:text-white transition-colors">
            <NextIcon className="w-10 h-10" />
          </button>
        </div>

        {/* Acciones del pie de página */}
        <div className="flex-shrink-0 flex items-center justify-between pt-2">
          <button aria-label="Conectar a un dispositivo" className="text-neutral-300 hover:text-white transition-colors">
            <DevicePhoneMobileIcon className="w-6 h-6" />
          </button>
          <button aria-label="Compartir" className="text-neutral-300 hover:text-white transition-colors">
            <ShareIcon className="w-6 h-6" />
          </button>
        </div>
      </main>
    </div>
  );
};

export default FullScreenPlayer;
