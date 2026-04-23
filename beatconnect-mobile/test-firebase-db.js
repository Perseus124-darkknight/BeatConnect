const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBU3uK9hxQAQ28jjz6LRBzvRG8SUm-85rc",
  authDomain: "beatconnect-5a89d.firebaseapp.com",
  projectId: "beatconnect-5a89d",
  storageBucket: "beatconnect-5a89d.firebasestorage.app",
  messagingSenderId: "134902428872",
  appId: "1:134902428872:web:6f1b0ae3b1594cdcd9e1fd"
};

const app = initializeApp(firebaseConfig);

async function checkDb(dbName) {
  const db = getFirestore(app, dbName);
  const artistsRef = collection(db, 'artists');
  try {
    const snapshot = await getDocs(artistsRef);
    console.log(`Success for DB: ${dbName}, Docs found: ${snapshot.docs.length}`);
    return true;
  } catch (e) {
    console.error(`Error for DB: ${dbName} - ${e.message}`);
    return false;
  }
}

async function run() {
  await checkDb('(default)');
  await checkDb('beatconnect');
  await checkDb('beatconnect-db');
  process.exit(0);
}

run();
