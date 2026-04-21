import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBCK-D_zNi8LazyaEhP9VLUYWeeGa2QXcI", // You must paste your real API key here
  authDomain: "tp-tutor.firebaseapp.com",
  projectId: "tp-tutor",
  storageBucket: "tp-tutor.firebasestorage.app",
  messagingSenderId: "784915926349", // Pulled from your Project Number
  appId: "1:784915926349:web:86aa45878b95b170217b04" // You must paste your real App ID here
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
