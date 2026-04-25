import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "missing",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "missing",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "missing",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "missing",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "missing",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "missing"
};

// Log a warning if keys are missing but don't crash the whole JS bundle
if (Object.values(firebaseConfig).includes("missing")) {
  console.warn("Firebase configuration is incomplete. Cloud sync will likely fail.");
}

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
