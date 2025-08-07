import React, { useState, useEffect } from 'react';
import { SpotifyPlaylist } from './types';
import { getFeaturedPlaylists } from '../services/spotifyService';

interface HomeViewProps {
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


const HomeView: React.FC<HomeViewProps> = ({ onPlaylistPlay, token }) => {
    const [featuredPlaylists, setFeaturedPlaylists] = useState<SpotifyPlaylist[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlaylists = async () => {
            if (!token) return;
            try {
                setIsLoading(true);
                const { playlists } = await getFeaturedPlaylists(token);
                setFeaturedPlaylists(playlists.items);
            } catch (error) {
                console.error("Failed to fetch featured playlists", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlaylists();
    }, [token]);

    return (
        <div className="space-y-8 p-4 sm:p-6">
            <PlaylistSection 
                title="Playlists destacadas"
                playlists={featuredPlaylists}
                isLoading={isLoading}
                onPlaylistPlay={onPlaylistPlay}
            />
        </div>
    );
};

export default HomeView;
