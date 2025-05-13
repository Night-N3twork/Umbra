/**
 * FileSystem handling for music player
 * Manages client-side file storage with FileSystemAPI and ServiceWorker
 */

import * as musicMetadata from 'music-metadata';

// Store imported files in the file system
export async function importMusicFiles(
  files: FileList | File[], 
  progressCallback?: (processed: number, total: number, percentage: number) => void
) {
  const total = files.length;
  let processed = 0;
  
  for (const file of files) {
    try {
      // Only process audio files
      if (!file.type.startsWith('audio/')) {
        processed++;
        updateProgress();
        continue;
      }
      
      // Extract metadata from file
      const metadata = await musicMetadata.parseBlob(file);
      
      // Generate a unique ID for the song
      const songId = `song-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      // Create song object with metadata
      const song = {
        id: songId,
        title: metadata.common.title || file.name.replace(/\.[^/.]+$/, ''),
        artist: metadata.common.artist || 'Unknown Artist',
        album: metadata.common.album || 'Unknown Album',
        year: metadata.common.year,
        duration: metadata.format.duration || 0,
        filePath: `/music/${songId}`,
        fileSize: file.size,
        mimeType: file.type,
        dateAdded: Date.now(),
        playCount: 0
      };
      
      // Extract artwork if available
      if (metadata.common.picture && metadata.common.picture.length > 0) {
        const picture = metadata.common.picture[0];
        const blob = new Blob([picture.data], { type: picture.format });
        song['artwork'] = URL.createObjectURL(blob);
      }
      
      // Store file in the file system (via service worker)
      await storeFile(songId, file);
      
      // Store metadata in IndexedDB
      await storeSongMetadata(song);
      
      // Update album and artist data
      await updateLibraryOrganization(song);
      
      processed++;
      updateProgress();
    } catch (error) {
      console.error(`Error importing file ${file.name}:`, error);
      processed++;
      updateProgress();
    }
  }
  
  // Dispatch event to notify that the library has been updated
  const event = new CustomEvent('libraryUpdated');
  document.dispatchEvent(event);
  
  function updateProgress() {
    if (progressCallback) {
      const percentage = (processed / total) * 100;
      progressCallback(processed, total, percentage);
    }
  }
  
  return processed;
}

export async function importMusicFromUrl(url: string, metadata: { title: string, artist: string }) {
  try {
    // Fetch the file from URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }
    
    const blob = await response.blob();
    const file = new File([blob], `${metadata.title}.mp3`, { type: blob.type || 'audio/mpeg' });
    
    // Import the file
    await importMusicFiles([file]);
    
    return true;
  } catch (error) {
    console.error('Error importing from URL:', error);
    throw error;
  }
}

// Store file in the client-side file system (via service worker)
async function storeFile(id: string, file: File): Promise<void> {
  // This would normally use the service worker to store the file
  console.log(`Storing file ${id} (${file.name})`);
  return Promise.resolve();
}

// Store song metadata in IndexedDB
async function storeSongMetadata(song: any): Promise<void> {
  // This would normally store data in IndexedDB
  console.log(`Storing metadata for ${song.title}`);
  return Promise.resolve();
}

// Update album and artist organization based on song metadata
async function updateLibraryOrganization(song: any): Promise<void> {
  // This would normally update album and artist data
  console.log(`Updating library organization for ${song.title}`);
  return Promise.resolve();
}