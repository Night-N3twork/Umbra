/**
 * Database interface for music player
 * Handles IndexedDB storage of music metadata and library organization
 */

import { openDB, type IDBPDatabase } from 'idb';

// Database schema
interface MusicPlayerDB {
  songs: {
    key: string;
    value: {
      id: string;
      title: string;
      artist: string;
      album: string;
      year?: number;
      duration: number;
      filePath: string;
      fileSize: number;
      mimeType: string;
      artwork?: string;
      dateAdded: number;
      lastPlayed?: number;
      playCount: number;
    };
    indexes: {
      'by-artist': string;
      'by-album': string;
      'by-title': string;
      'by-date-added': number;
      'by-last-played': number;
    };
  };
  
  albums: {
    key: string;
    value: {
      id: string;
      title: string;
      artist: string;
      year?: number;
      artwork?: string;
      songCount: number;
      dateAdded: number;
    };
    indexes: {
      'by-artist': string;
      'by-title': string;
    };
  };
  
  artists: {
    key: string;
    value: {
      id: string;
      name: string;
      image?: string;
      songCount: number;
      albumCount: number;
    };
    indexes: {
      'by-name': string;
    };
  };
  
  playlists: {
    key: string;
    value: {
      id: string;
      name: string;
      description?: string;
      createdAt: number;
      updatedAt: number;
      songIds: string[];
    };
    indexes: {
      'by-name': string;
      'by-updated': number;
    };
  };
}

// Singleton database instance
let dbPromise: Promise<IDBPDatabase<MusicPlayerDB>> | null = null;

// Get database instance
async function getDB(): Promise<IDBPDatabase<MusicPlayerDB>> {
  if (!dbPromise) {
    dbPromise = openDB<MusicPlayerDB>('music-player', 1, {
      upgrade(db) {
        // Songs store
        const songsStore = db.createObjectStore('songs', { keyPath: 'id' });
        songsStore.createIndex('by-artist', 'artist');
        songsStore.createIndex('by-album', 'album');
        songsStore.createIndex('by-title', 'title');
        songsStore.createIndex('by-date-added', 'dateAdded');
        songsStore.createIndex('by-last-played', 'lastPlayed');
        
        // Albums store
        const albumsStore = db.createObjectStore('albums', { keyPath: 'id' });
        albumsStore.createIndex('by-artist', 'artist');
        albumsStore.createIndex('by-title', 'title');
        
        // Artists store
        const artistsStore = db.createObjectStore('artists', { keyPath: 'id' });
        artistsStore.createIndex('by-name', 'name');
        
        // Playlists store
        const playlistsStore = db.createObjectStore('playlists', { keyPath: 'id' });
        playlistsStore.createIndex('by-name', 'name');
        playlistsStore.createIndex('by-updated', 'updatedAt');
      }
    });
  }
  
  return dbPromise;
}

// Mock data generation for demo UI
const sampleArtwork = [
  'https://images.pexels.com/photos/1699161/pexels-photo-1699161.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/1389429/pexels-photo-1389429.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/167092/pexels-photo-167092.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/96380/pexels-photo-96380.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
  'https://images.pexels.com/photos/159376/turntable-top-view-audio-equipment-159376.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260'
];

function getRandomArtwork() {
  return sampleArtwork[Math.floor(Math.random() * sampleArtwork.length)];
}

// Mock data retrieval functions
export async function getRecentSongs() {
  // In a real app, this would fetch from IndexedDB
  return Array.from({ length: 5 }, (_, i) => ({
    id: `song-${i}`,
    title: `Sample Song ${i + 1}`,
    artist: `Artist ${Math.floor(i / 2) + 1}`,
    album: `Album ${Math.floor(i / 3) + 1}`,
    duration: 180 + i * 30,
    artwork: getRandomArtwork()
  }));
}

export async function getRecentImports() {
  return Array.from({ length: 3 }, (_, i) => ({
    id: `import-${i}`,
    title: `Newly Imported Song ${i + 1}`,
    artist: `New Artist ${i + 1}`,
    album: `New Album ${i + 1}`,
    duration: 200 + i * 20,
    artwork: getRandomArtwork()
  }));
}

export async function getTopAlbums() {
  return Array.from({ length: 6 }, (_, i) => ({
    id: `album-${i}`,
    title: `Album Title ${i + 1}`,
    artist: `Artist ${i + 1}`,
    songCount: 10 + i,
    artwork: getRandomArtwork()
  }));
}

export async function getAllAlbums() {
  return Array.from({ length: 12 }, (_, i) => ({
    id: `album-${i}`,
    title: `Album Title ${i + 1}`,
    artist: `Artist ${Math.floor(i / 3) + 1}`,
    songCount: 8 + i % 5,
    artwork: getRandomArtwork()
  }));
}

export async function getAllArtists() {
  return Array.from({ length: 10 }, (_, i) => ({
    id: `artist-${i}`,
    name: `Artist ${i + 1}`,
    songCount: 10 + i * 2,
    albumCount: 2 + Math.floor(i / 3),
    image: getRandomArtwork()
  }));
}

export async function getUserPlaylists() {
  return Array.from({ length: 4 }, (_, i) => ({
    id: `playlist-${i}`,
    name: `My Playlist ${i + 1}`,
    description: `A collection of songs for ${['relaxing', 'working out', 'focus', 'party'][i]}`,
    songCount: 12 + i * 3,
    artworks: Array.from({ length: 4 }, () => getRandomArtwork())
  }));
}

export async function getLibraryStats() {
  return {
    songCount: 38,
    storageUsed: '152.4 MB'
  };
}

export async function getDatabaseStats() {
  return {
    databaseSize: '156.2 MB',
    songCount: 38,
    albumCount: 12,
    artistCount: 10
  };
}

// Search functionality
export async function searchMusic(query: string) {
  // This would normally search the IndexedDB
  return {
    songs: Array.from({ length: 2 }, (_, i) => ({
      id: `search-song-${i}`,
      title: `${query} Result ${i + 1}`,
      artist: `Matching Artist ${i + 1}`,
      album: `Album Result ${i + 1}`,
      duration: 180 + i * 45,
      artwork: getRandomArtwork()
    })),
    albums: Array.from({ length: 1 }, (_, i) => ({
      id: `search-album-${i}`,
      title: `${query} Album`,
      artist: `Matching Artist`,
      songCount: 10,
      artwork: getRandomArtwork()
    })),
    artists: Array.from({ length: 1 }, (_, i) => ({
      id: `search-artist-${i}`,
      name: `${query} Artist`,
      songCount: 15,
      albumCount: 2,
      image: getRandomArtwork()
    }))
  };
}

// Playlist management
export async function getPlaylists() {
  const db = await getDB();
  return db.getAll('playlists');
}

export async function createPlaylist(name: string) {
  const db = await getDB();
  const id = `playlist-${Date.now()}`;
  
  await db.add('playlists', {
    id,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    songIds: []
  });
  
  return id;
}

export async function addToPlaylist(playlistId: string, songId: string) {
  const db = await getDB();
  const playlist = await db.get('playlists', playlistId);
  
  if (!playlist) {
    throw new Error('Playlist not found');
  }
  
  if (!playlist.songIds.includes(songId)) {
    playlist.songIds.push(songId);
    playlist.updatedAt = Date.now();
    await db.put('playlists', playlist);
  }
}

export async function removeFromPlaylist(playlistId: string, songId: string) {
  const db = await getDB();
  const playlist = await db.get('playlists', playlistId);
  
  if (!playlist) {
    throw new Error('Playlist not found');
  }
  
  playlist.songIds = playlist.songIds.filter(id => id !== songId);
  playlist.updatedAt = Date.now();
  await db.put('playlists', playlist);
}

// Library management
export async function exportLibrary() {
  const db = await getDB();
  
  const exportData = {
    songs: await db.getAll('songs'),
    albums: await db.getAll('albums'),
    artists: await db.getAll('artists'),
    playlists: await db.getAll('playlists')
  };
  
  const blob = new Blob([JSON.stringify(exportData)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `umbra-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  
  URL.revokeObjectURL(url);
}

export async function clearCache() {
  // This would normally clear the audio file cache
  // while preserving the metadata in the database
  console.log('Clearing cache...');
  return Promise.resolve();
}

export async function resetLibrary() {
  // This would delete all data and reset the database
  const db = await getDB();
  
  await Promise.all([
    db.clear('songs'),
    db.clear('albums'),
    db.clear('artists'),
    db.clear('playlists')
  ]);
  
  return Promise.resolve();
}