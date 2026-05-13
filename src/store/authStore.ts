import { create } from 'zustand';
import { auth } from '../services/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth';
import { SocialLogin } from '@capgo/capacitor-social-login';
import { Capacitor } from '@capacitor/core';
import { useMasteryStore } from './masteryStore';

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

const googleProvider = new GoogleAuthProvider();

SocialLogin.initialize({
  google: {
    webClientId: '784915926349-cfenp22743kln0kqm6q8rkchp3agup36.apps.googleusercontent.com',
  }
});

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isGuest: false,
  loading: true,
  error: null,
  signIn: async () => {
    set({ loading: true, error: null });
    try {
      const isNative = Capacitor.isNativePlatform();
      if (isNative) {
        const result = await SocialLogin.login({
          provider: 'google',
          options: { scopes: ['profile', 'email'] }
        });
        const idToken = result.result.idToken;
        if (!idToken) throw new Error('No ID token returned from Google');
        const credential = GoogleAuthProvider.credential(idToken);
        await signInWithCredential(auth, credential);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error) {
      const authError = error as { code?: string; message?: string };
      console.error('Sign-in failed:', authError.code, authError.message);
      set({ error: authError.message || 'Sign-in failed', loading: false });
    }
  },
  skipSignIn: () => {
    const guestUser = {
      uid: 'guest_user',
      displayName: 'Guest Student',
      photoURL: null,
    } as User;
    set({ user: guestUser, isGuest: true, loading: false });
    useMasteryStore.getState().syncFromCloud('guest_user');
  },
  logout: async () => {
    try {
      if (Capacitor.isNativePlatform()) {
        await SocialLogin.logout({ provider: 'google' });
      }
      await signOut(auth);
      set({ user: null, isGuest: false });
      useMasteryStore.getState().clearLocalData();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  },
  setUser: (user) => set({ user, loading: false }),
}));

onAuthStateChanged(auth, (user) => {
  if (user === null && useAuthStore.getState().isGuest) return;
  useAuthStore.getState().setUser(user);
});
