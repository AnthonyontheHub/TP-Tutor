const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBCK-D_zNi8LazyaEhP9VLUYWeeGa2QXcI",
  authDomain: "tp-tutor.firebaseapp.com",
  projectId: "tp-tutor",
  storageBucket: "tp-tutor.firebasestorage.app",
  messagingSenderId: "784915926349",
  appId: "1:784915926349:web:86aa45878b95b170217b04"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const USER_ID = '4wFRnyqCXZXuJBybqJTZvo6YAXt1';

async function run() {
  const docSnap = await getDoc(doc(db, 'users', USER_ID));
  const data = docSnap.data();
  const ala = data.vocabulary.find(v => v.word === 'ala');
  console.log('ala POS:', ala.partOfSpeech);
  const alasa = data.vocabulary.find(v => v.word === 'alasa');
  console.log('alasa POS:', alasa.partOfSpeech);
  const usawi = data.vocabulary.find(v => v.word === 'usawi');
  console.log('usawi POS:', usawi ? usawi.partOfSpeech : 'not found');
}
run();
