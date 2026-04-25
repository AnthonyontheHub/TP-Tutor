import { create } from 'zustand';
import { auth, googleProvider } from '../services/firebase';
import { 
  signInWithPopup, 
  signInWithRedirect, 
  getRedirectResult, 
  signOut, 
  onAuthStateChanged, 
  type User 
} from 'firebase/auth';
import { useMasteryStore } from './masteryStore'; // Import masteryStore

interface AuthState {
  user: User | null;
  isGuest: boolean;
  loading: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  skipSignIn: () => void;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  loading: true,
  error: null,
  signIn: async () => {
    set({ loading: true, error: null });
    try {
      console.log('Attempting sign-in with popup...');
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Sign-in popup failed:', error.code, error.message);
      
      // Fallback for Chromebooks/blocked popups
      if (
        error.code === 'auth/popup-blocked' || 
        error.code === 'auth/popup-closed-by-user' || 
        error.code === 'auth/cancelled-popup-request'
      ) {
        console.log('Switching to redirect mode...');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError: any) {
          console.error('Sign-in redirect failed:', redirectError.code);
          set({ error: redirectError.message, loading: false });
        }
      } else {
        set({ error: error.message, loading: false });
      }
    }
  },
  skipSignIn: () => {
    const guestUser = {
      uid: 'guest_user',
      displayName: 'Guest Student',
      photoURL: null,
    } as User;
    set({ user: guestUser, isGuest: true, loading: false });
    // Sync mastery store with guest user ID to ensure it's initialized correctly
    useMasteryStore.getState().syncFromCloud('guest_user'); 
  },
  logout: async () => {
    try {
      await signOut(auth);
      set({ user: null, isGuest: false });
      // Reset mastery store to a default/guest state upon logout
      useMasteryStore.getState().clearLocalData(); // Clears vocabulary, profile, etc.
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
  setUser: (user) => set({ user, loading: false }),
}));

// Handle redirect result on initialization
getRedirectResult(auth).catch((error) => {
  console.error('Error getting redirect result:', error.code, error.message);
});

// Initialize auth state listener
// Note: syncFromCloud is handled by App.tsx's useEffect with proper unsubscribe cleanup.
// This listener only updates auth state and clears local data on logout.
onAuthStateChanged(auth, (user) => {
  useAuthStore.getState().setUser(user);
  if (!user) {
    useMasteryStore.getState().clearLocalData();
  }
});
