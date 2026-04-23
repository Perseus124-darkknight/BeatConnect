import { ref, get, set, push, update, remove, child, onValue } from 'firebase/database';
import { db } from '../config/firebase';

export interface Artist {
  artist_id?: string;
  artist_name: string;
  genres: string[];
  songs: string[];
  image: string;
}

const COLLECTION_NAME = 'artists';

// Helper for timeout
const withTimeout = <T>(promise: Promise<T>, ms: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Operation timed out. Please check your connection or database configuration.')), ms)
    )
  ]);
};

// GET ALL
export const fetchArtists = async (): Promise<Artist[]> => {
  const snapshot = await withTimeout(get(ref(db, COLLECTION_NAME)));
  
  if (!snapshot.exists()) {
    return [];
  }

  const data = snapshot.val();
  const artists: Artist[] = Object.keys(data).map(key => ({
    ...data[key],
    artist_id: key
  }));

  // Sort by artist_name asc
  return artists.sort((a, b) => a.artist_name.localeCompare(b.artist_name));
};

// GET ONE
export const fetchArtistById = async (id: string): Promise<Artist | null> => {
  const snapshot = await withTimeout(get(ref(db, `${COLLECTION_NAME}/${id}`)));
  
  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...snapshot.val(),
    artist_id: id
  };
};

// REAL-TIME LISTENER
export const subscribeToArtists = (callback: (artists: Artist[]) => void): () => void => {
  const artistsRef = ref(db, COLLECTION_NAME);
  
  const unsubscribe = onValue(artistsRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback([]);
      return;
    }
    
    const data = snapshot.val();
    const artists: Artist[] = Object.keys(data).map(key => ({
      ...data[key],
      artist_id: key
    }));
    
    callback(artists.sort((a, b) => a.artist_name.localeCompare(b.artist_name)));
  });

  return unsubscribe;
};


// CREATE
export const addArtist = async (artist: Omit<Artist, 'artist_id'>): Promise<string> => {
  const artistsListRef = ref(db, COLLECTION_NAME);
  const newArtistRef = push(artistsListRef);
  
  const newDoc = {
    artist_id: newArtistRef.key,
    ...artist
  };
  
  await withTimeout(set(newArtistRef, newDoc));
  return newArtistRef.key as string;
};

// UPDATE
export const editArtist = async (id: string, artistData: Partial<Artist>): Promise<void> => {
  const docRef = ref(db, `${COLLECTION_NAME}/${id}`);
  await withTimeout(update(docRef, artistData));
};

// DELETE
export const removeArtist = async (id: string): Promise<void> => {
  const docRef = ref(db, `${COLLECTION_NAME}/${id}`);
  await withTimeout(remove(docRef));
};
