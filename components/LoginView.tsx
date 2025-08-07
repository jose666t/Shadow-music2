import React from 'react';
import { redirectToLogin } from '../services/spotifyService';
import { MusicNoteIcon } from './IconComponents';

const LoginView = () => {
    return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-neutral-950 text-white p-6 text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <MusicNoteIcon className="w-12 h-12 text-black" />
            </div>
            <h1 className="text-4xl font-bold mb-2">Gemini Music Player</h1>
            <p className="text-neutral-400 mb-8 max-w-md">Inicia sesión para descubrir nueva música y escuchar tus canciones favoritas directamente desde Spotify.</p>
            <button
                onClick={redirectToLogin}
                className="bg-green-500 text-black font-bold text-lg px-8 py-3 rounded-full hover:bg-green-400 transition-transform hover:scale-105"
            >
                Iniciar sesión con Spotify
            </button>
        </div>
    );
};

export default LoginView;
