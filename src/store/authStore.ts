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
      if (import.meta.env.DEV) console.log('Attempting sign-in with popup...');
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      const authError = error as { code?: string; message?: string };
      console.error('Sign-in popup failed:', authError.code, authError.message);

      // Fallback for Chromebooks/blocked popups
      if (
        authError.code === 'auth/popup-blocked'
        || authError.code === 'auth/popup-closed-by-user'
        || authError.code === 'auth/cancelled-popup-request'
      ) {
        if (import.meta.env.DEV) console.log('Switching to redirect mode...');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectError) {
          const redirectAuthError = redirectError as { code?: string; message?: string };
          console.error('Sign-in redirect failed:', redirectAuthError.code);
          set({ error: redirectAuthError.message || 'Sign-in failed', loading: false });
        }
      } else {
        set({ error: authError.message || 'Sign-in failed', loading: false });
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

// Initialize auth state listener.
// We only update the auth store's user state here. App.tsx is responsible for
// kicking off (and tearing down) the Firestore subscription via syncFromCloud
// so that the unsubscribe handle isn't dropped on the floor — duplicating the
// call here previously created leaked listeners.
// We also do NOT clearLocalData on null: this listener fires once on app load
// before the user has had a chance to sign in, which would silently wipe
// persisted local/guest data. Explicit logout() still clears.
// Finally, if we're already in Guest mode (no real Firebase session, just an
// in-memory guestUser), ignore the null Firebase event so we don't kick the
// user back to the login screen mid-session — that produced a login loop.
onAuthStateChanged(auth, (user) => {
  if (user === null && useAuthStore.getState().isGuest) return;
  useAuthStore.getState().setUser(user);
});
