import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "...", 
  authDomain: "tp-tutor-26792.firebaseapp.com", // Double check this
  projectId: "tp-tutor-26792",                 // MUST match exactly
  storageBucket: "tp-tutor-26792.appspot.com",
  // ...
};

// 1. Initialize the app
const app = initializeApp(firebaseConfig);

// 2. Export the database connection (Critical: 'export' must be here!)
export const db = getFirestore(app);
