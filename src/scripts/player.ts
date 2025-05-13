/**
 * Music player functionality
 * Handles audio playback, queue management, and playback controls
 */

// Player state
let audioElement: HTMLAudioElement | null = null;
let currentTrack: any = null;
let queue: string[] = [];
let queueIndex = 0;
let isPlaying = false;
let repeatEnabled = false;
let shuffleEnabled = false;
let volume = 0.7; // 0-1

// Initialize player
function initPlayer() {
  if (!audioElement) {
    audioElement = new Audio();
    
    // Set up event listeners
    audioElement.addEventListener('ended', () => {
      if (repeatEnabled) {
        audioElement?.play();
      } else {
        nextTrack();
      }
    });
    
    audioElement.addEventListener('timeupdate', () => {
      updatePlayerState();
    });
    
    audioElement.volume = volume;
  }
}

// Update player state and notify UI
function updatePlayerState() {
  if (!audioElement || !currentTrack) return;
  
  const playerState = {
    isPlaying,
    currentTime: audioElement.currentTime,
    duration: audioElement.duration,
    volume: audioElement.volume,
    repeatEnabled,
    shuffleEnabled,
    title: currentTrack.title,
    artist: currentTrack.artist,
    album: currentTrack.album,
    artwork: currentTrack.artwork
  };
  
  // Dispatch event for UI to update
  const event = new CustomEvent('playerStateChanged', { detail: playerState });
  window.dispatchEvent(event);
  
  return playerState;
}

// Load and play a track
export async function playTrack(songId: string) {
  try {
    initPlayer();
    
    // This would normally fetch the song from IndexedDB and file system
    // For demo, we're using placeholder data
    const track = {
      id: songId,
      title: `Song ${songId.split('-').pop()}`,
      artist: 'Demo Artist',
      album: 'Demo Album',
      duration: 180,
      artwork: `https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260`,
      filePath: '/path/to/song.mp3' // This would be the actual file path
    };
    
    // Set as current track
    currentTrack = track;
    
    // Update queue if not already in queue
    if (!queue.includes(songId)) {
      queue.splice(queueIndex + 1, 0, songId);
      queueIndex = queue.indexOf(songId);
    } else {
      queueIndex = queue.indexOf(songId);
    }
    
    // Load and play the audio
    if (audioElement) {
      // In a real app, this would load from the file system
      // For demo, just use a sample MP3
      audioElement.src = 'https://samplelib.com/lib/preview/mp3/sample-15s.mp3';
      audioElement.load();
      await audioElement.play();
      isPlaying = true;
      
      // Update last played info in DB (would happen in real app)
      
      // Dispatch song change event
      const songChangeEvent = new CustomEvent('songChange', { detail: { songId } });
      document.dispatchEvent(songChangeEvent);
      
      // Return updated player state
      return updatePlayerState();
    }
  } catch (error) {
    console.error('Failed to play track:', error);
    return null;
  }
}

// Pause the current track
export function pauseTrack() {
  if (audioElement && isPlaying) {
    audioElement.pause();
    isPlaying = false;
    return updatePlayerState();
  }
  return null;
}

// Resume the current track
export function resumeTrack() {
  if (audioElement && !isPlaying) {
    audioElement.play();
    isPlaying = true;
    return updatePlayerState();
  }
  return null;
}

// Toggle play/pause
export function togglePlay() {
  if (isPlaying) {
    return pauseTrack();
  } else {
    return resumeTrack();
  }
}

// Seek to a specific position (0-1 percentage)
export function seekTo(position: number) {
  if (audioElement && currentTrack) {
    const seekTime = position * audioElement.duration;
    audioElement.currentTime = seekTime;
    return updatePlayerState();
  }
  return null;
}

// Play next track in queue
export async function nextTrack() {
  if (queue.length === 0) return null;
  
  if (shuffleEnabled) {
    // Play a random track from the queue that's not the current one
    const availableTracks = queue.filter((_, index) => index !== queueIndex);
    if (availableTracks.length > 0) {
      const randomIndex = Math.floor(Math.random() * availableTracks.length);
      const nextSongId = availableTracks[randomIndex];
      return playTrack(nextSongId);
    }
    return null;
  } else {
    // Play next track in sequence
    if (queueIndex < queue.length - 1) {
      queueIndex++;
      return playTrack(queue[queueIndex]);
    } else if (repeatEnabled) {
      // If repeat is enabled and we're at the end, start over
      queueIndex = 0;
      return playTrack(queue[queueIndex]);
    }
    return null;
  }
}

// Play previous track in queue
export async function previousTrack() {
  if (queue.length === 0) return null;
  
  // If we're more than 3 seconds into the song, restart it
  if (audioElement && audioElement.currentTime > 3) {
    audioElement.currentTime = 0;
    return updatePlayerState();
  } else {
    // Play previous track
    if (queueIndex > 0) {
      queueIndex--;
      return playTrack(queue[queueIndex]);
    } else if (repeatEnabled) {
      // If repeat is enabled and we're at the beginning, go to end
      queueIndex = queue.length - 1;
      return playTrack(queue[queueIndex]);
    }
    return null;
  }
}

// Toggle repeat mode
export function toggleRepeat() {
  repeatEnabled = !repeatEnabled;
  return updatePlayerState();
}

// Toggle shuffle mode
export function toggleShuffle() {
  shuffleEnabled = !shuffleEnabled;
  return updatePlayerState();
}

// Set volume (0-1)
export function setVolume(newVolume: number) {
  if (audioElement) {
    volume = Math.max(0, Math.min(1, newVolume));
    audioElement.volume = volume;
    return updatePlayerState();
  }
  return null;
}

// Add a song to the play queue
export function addToQueue(songId: string) {
  if (!queue.includes(songId)) {
    queue.push(songId);
    
    // If nothing is playing, start playing the added song
    if (!currentTrack) {
      playTrack(songId);
    }
  }
}

// Play an album
export async function playAlbum(albumId: string) {
  // This would normally fetch all songs from the album and add to queue
  console.log(`Playing album ${albumId}`);
  return playTrack(`song-1`);
}

// Play all songs by an artist
export async function playArtist(artistId: string) {
  // This would normally fetch all songs by the artist and add to queue
  console.log(`Playing artist ${artistId}`);
  return playTrack(`song-2`);
}

// Play a playlist
export async function playPlaylist(playlistId: string) {
  // This would normally fetch all songs in the playlist and add to queue
  console.log(`Playing playlist ${playlistId}`);
  return playTrack(`song-3`);
}

// Add a song to a playlist
export async function addToPlaylist(songId: string, playlistId: string) {
  // This would normally add the song to the playlist in IndexedDB
  console.log(`Adding song ${songId} to playlist ${playlistId}`);
  
  // Dispatch event to update UI
  const event = new CustomEvent('playlistUpdated', { detail: { playlistId } });
  document.dispatchEvent(event);
}

// Download a song
export async function downloadSong(songId: string) {
  // This would normally get the file from the file system and download it
  console.log(`Downloading song ${songId}`);
  
  // Create a fake download
  const a = document.createElement('a');
  a.href = 'https://samplelib.com/lib/download/mp3/sample-15s.mp3';
  a.download = `Song ${songId.split('-').pop()}.mp3`;
  a.click();
}

// Delete a song from the library
export async function deleteSong(songId: string) {
  // This would normally delete the song from the file system and database
  console.log(`Deleting song ${songId}`);
  
  // If the song is the current track, play next
  if (currentTrack && currentTrack.id === songId) {
    nextTrack();
  }
  
  // Remove from queue
  queue = queue.filter(id => id !== songId);
  if (queueIndex >= queue.length) {
    queueIndex = Math.max(0, queue.length - 1);
  }
  
  // Dispatch event to update UI
  const event = new CustomEvent('libraryUpdated');
  document.dispatchEvent(event);
}

// Get current player state
export function getState() {
  return updatePlayerState();
}

// Export the player as a global object for easy access
if (typeof window !== 'undefined') {
  window.musicPlayer = {
    playTrack,
    pauseTrack,
    resumeTrack,
    togglePlay,
    seekTo,
    nextTrack,
    previousTrack,
    toggleRepeat,
    toggleShuffle,
    setVolume,
    addToQueue,
    getState
  };
}