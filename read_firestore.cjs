const { spawnSync } = require('child_process');

// Get token from firebase CLI
const tokenResult = spawnSync('firebase', ['auth:print-token']);
const token = tokenResult.stdout.toString().trim();

if (!token) {
  console.error('Failed to get token');
  process.exit(1);
}

const projectId = 'tp-tutor';
const uid = '4wFRnyqCXZXuJBybqJTZvo6YAXt1';
const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/users/${uid}`;

const response = spawnSync('curl', [
  '-s',
  '-H', `Authorization: Bearer ${token}`,
  url
]);

const data = JSON.parse(response.stdout.toString());

if (data.error) {
  console.error('Error from Firestore:', JSON.stringify(data.error, null, 2));
  process.exit(1);
}

const vocabulary = data.fields.vocabulary.arrayValue.values;
const ala = vocabulary.find(v => {
  const fields = v.mapValue.fields;
  return fields.word && fields.word.stringValue === 'ala';
});

if (ala) {
  console.log('partOfSpeech for "ala":', ala.mapValue.fields.partOfSpeech.stringValue);
} else {
  console.log('Word "ala" not found in vocabulary');
}
