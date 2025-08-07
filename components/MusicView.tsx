import React, { useState, useEffect } from 'react';
import { SpotifyPlaylist } from './types';
import { getPlaylistsForCategory } from '../services/spotifyService';

interface MusicViewProps {
    onPlaylistPlay: (playlist: SpotifyPlaylist) => void;
    token: string | null;
}

const PlaylistCard = ({ title, description, artwork, onClick }: { title: string, description: string, artwork: string, onClick?: () => void }) => (
    <div className="w-40 flex-shrink-0 cursor-pointer group" onClick={onClick} role={onClick ? 'button' : undefined}>
        <img src={artwork} alt={title} className="w-full h-40 object-cover rounded-lg bg-neutral-800 mb-2 transition-transform group-hover:scale-105" />
        <h4 className="font-bold text-white truncate">{title}</h4>
        <p className="text-xs text-neutral-400 truncate" dangerouslySetInnerHTML={{ __html: description }}></p>
    </div>
);

const PlaylistSection = ({ title, playlists, isLoading, onPlaylistPlay }: { title: string, playlists: SpotifyPlaylist[], isLoading: boolean, onPlaylistPlay: (playlist: SpotifyPlaylist) => void }) => {
    const renderSkeleton = () => (
        <div className="flex space-x-4">
            {Array.from({ length: 5 }).map((_, i) => (
                 <div key={i} className="w-40 flex-shrink-0 animate-pulse">
                    <div className="w-full h-40 bg-neutral-800 rounded-lg mb-2"></div>
                    <div className="h-4 bg-neutral-800 rounded w-3/4 mb-1"></div>
                    <div className="h-3 bg-neutral-800 rounded w-1/2"></div>
                </div>
            ))}
        </div>
    );

    return (
         <section>
            <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 no-scrollbar">
                {isLoading ? renderSkeleton() : playlists.map(playlist => (
                    <PlaylistCard 
                        key={playlist.id}
                        title={playlist.name}
                        description={playlist.description}
                        artwork={playlist.images[0]?.url}
                        onClick={() => onPlaylistPlay(playlist)}
                    />
                ))}
            </div>
        </section>
    );
};


const MusicView: React.FC<MusicViewProps> = ({ onPlaylistPlay, token }) => {
    const [popPlaylists, setPopPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [hipHopPlaylists, setHipHopPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [latinPlaylists, setLatinPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [isLoadingPop, setIsLoadingPop] = useState(true);
    const [isLoadingHipHop, setIsLoadingHipHop] = useState(true);
    const [isLoadingLatin, setIsLoadingLatin] = useState(true);

    useEffect(() => {
        const fetchCategory = async (
            categoryId: string, 
            setter: React.Dispatch<React.SetStateAction<SpotifyPlaylist[]>>,
            loaderSetter: React.Dispatch<React.SetStateAction<boolean>>
        ) => {
             if (!token) return;
            try {
                loaderSetter(true);
                const { playlists } = await getPlaylistsForCategory(token, categoryId);
                setter(playlists.items);
            } catch (error) {
                console.error(`Failed to fetch ${categoryId} playlists`, error);
            } finally {
                loaderSetter(false);
            }
        };

        fetchCategory('pop', setPopPlaylists, setIsLoadingPop);
        fetchCategory('hiphop', setHipHopPlaylists, setIsLoadingHipHop);
        fetchCategory('latin', setLatinPlaylists, setIsLoadingLatin);
        
    }, [token]);

    return (
        <div className="space-y-8 p-4 sm:p-6">
            <PlaylistSection 
                title="Top Pop"
                playlists={popPlaylists}
                isLoading={isLoadingPop}
                onPlaylistPlay={onPlaylistPlay}
            />
            <PlaylistSection 
                title="Hip-Hop Hits"
                playlists={hipHopPlaylists}
                isLoading={isLoadingHipHop}
                onPlaylistPlay={onPlaylistPlay}
            />
             <PlaylistSection 
                title="Ritmos Latinos"
                playlists={latinPlaylists}
                isLoading={isLoadingLatin}
                onPlaylistPlay={onPlaylistPlay}
            />
        </div>
    );
};

export default MusicView;
