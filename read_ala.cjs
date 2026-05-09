const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const uid = '4wFRnyqCXZXuJBybqJTZvo6YAXt1';

async function run() {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      const ala = data.vocabulary.find(v => v.word === 'ala');
      if (ala) {
        console.log('partOfSpeech for "ala":', ala.partOfSpeech);
      } else {
        console.log('Word "ala" not found in vocabulary');
      }
    } else {
      console.log('No such document!');
    }
  } catch (err) {
    console.error('Error reading document:', err.message);
  }
}

run();
