import { create } from 'zustand';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthState {
  user: any | null;
  userName: string;
  userBio: string;
  userImage: string;
  userMood: string;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  updateProfile: (data: { name?: string; bio?: string; image?: string }) => void;
  setMood: (mood: string) => void;
  logout: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userName: 'Artist Name',
  userBio: 'Enter your artist biography here...',
  userImage: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
  userMood: 'Creative',
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setMood: (mood) => set({ userMood: mood }),

  updateProfile: (data) => {
    set((state) => ({
      userName: data.name ?? state.userName,
      userBio: data.bio ?? state.userBio,
      userImage: data.image ?? state.userImage,
    }));
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      set({ 
        user: userCredential.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message?.replace('Firebase: ', '') || 'Login failed.',
        isLoading: false 
      });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Automatically log them in in state
      set({ 
        user: userCredential.user, 
        isAuthenticated: true, 
        isLoading: false 
      });
      return true;
    } catch (error: any) {
      set({ 
        error: error.message?.replace('Firebase: ', '') || 'Registration failed.',
        isLoading: false 
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
    set({ user: null, isAuthenticated: false, isLoading: false, error: null });
  },

  clearError: () => set({ error: null })
}));
