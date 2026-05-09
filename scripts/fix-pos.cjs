const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, updateDoc } = require('firebase/firestore');
const fs = require('fs');

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

// 1. Load ground truth from initialMasteryMap.ts
const mapFile = fs.readFileSync('src/data/initialMasteryMap.ts', 'utf8');
const vocabMatch = mapFile.match(/const initialVocabulary = (\[[\s\S]*?\]);/);
if (!vocabMatch) {
  console.error('Could not find initialVocabulary array');
  process.exit(1);
}

const groundTruth = {};
const entryRegex = /\{[\s\S]*?\}/g;
let m;
while ((m = entryRegex.exec(vocabMatch[1])) !== null) {
  const entry = m[0];
  const wordMatch = entry.match(/word: "([^"]+)"/);
  const posMatch = entry.match(/partOfSpeech: "([^"]+)"/);
  if (wordMatch && posMatch) {
    groundTruth[wordMatch[1].toLowerCase()] = posMatch[1];
  }
}

async function run() {
  try {
    console.log(`Ground truth loaded: ${Object.keys(groundTruth).length} words.`);
    console.log(`Fetching document for user ${USER_ID}...`);
    const docRef = doc(db, 'users', USER_ID);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      console.error('User document not found');
      return;
    }

    const data = docSnap.data();
    const vocabArray = data.vocabulary || [];
    let updatedCount = 0;

    console.log(`Cloud document found with ${vocabArray.length} words.`);

    const updatedVocab = vocabArray.map(v => {
      const correctPOS = groundTruth[v.word.toLowerCase()];
      if (correctPOS && v.partOfSpeech !== correctPOS) {
        console.log(`[FIXING] ${v.word}: "${v.partOfSpeech}" -> "${correctPOS}"`);
        v.partOfSpeech = correctPOS;
        updatedCount++;
      }
      return v;
    });

    console.log(`Updating ${vocabArray.length} words in Firestore unconditionally...`);
    await updateDoc(docRef, { vocabulary: updatedVocab });
    console.log(`Done! Total words modified in local array: ${updatedCount}.`);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
