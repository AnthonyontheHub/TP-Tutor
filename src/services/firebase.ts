import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // PASTE YOUR COPIED CONFIG HERE
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
