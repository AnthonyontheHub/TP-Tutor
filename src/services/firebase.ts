import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCK-D_zNi8LazyaEhP9VLUYWeeGa2QXcI",
  authDomain: "tp-tutor.firebaseapp.com",
  projectId: "tp-tutor",
  storageBucket: "tp-tutor.firebasestorage.app",
  messagingSenderId: "784915926349",
  appId: "1:784915926349:web:86aa45878b95b170217b04",
  measurementId: "G-04EFDCZM9G"
};

// 1. Initialize the app
const app = initializeApp(firebaseConfig);

// 2. Export the database connection (Critical: 'export' must be here!)
export const db = getFirestore(app);
