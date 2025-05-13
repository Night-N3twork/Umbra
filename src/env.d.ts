/// <reference types="astro/client" />

interface Window {
  musicPlayer: {
    playTrack: (songId: string) => Promise<any>;
    pauseTrack: () => any;
    resumeTrack: () => any;
    togglePlay: () => any;
    seekTo: (position: number) => any;
    nextTrack: () => Promise<any>;
    previousTrack: () => Promise<any>;
    toggleRepeat: () => any;
    toggleShuffle: () => any;
    setVolume: (volume: number) => any;
    addToQueue: (songId: string) => void;
    getState: () => any;
  };
}