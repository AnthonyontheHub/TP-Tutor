import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY_FROM_FIREBASE_CONSOLE", // You must paste your real API key here
  authDomain: "tp-tutor-26792.firebaseapp.com",
  projectId: "tp-tutor-26792",
  storageBucket: "tp-tutor-26792.appspot.com",
  messagingSenderId: "331006450625", // Pulled from your Project Number
  appId: "YOUR_APP_ID_FROM_FIREBASE_CONSOLE" // You must paste your real App ID here
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
