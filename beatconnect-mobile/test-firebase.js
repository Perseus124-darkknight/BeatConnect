const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBU3uK9hxQAQ28jjz6LRBzvRG8SUm-85rc",
  authDomain: "beatconnect-5a89d.firebaseapp.com",
  projectId: "beatconnect-5a89d",
  storageBucket: "beatconnect-5a89d.firebasestorage.app",
  messagingSenderId: "134902428872",
  appId: "1:134902428872:web:6f1b0ae3b1594cdcd9e1fd"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
  const artistsRef = collection(db, 'artists');
  const newArtistRef = doc(artistsRef);
  console.log("Generated ID:", newArtistRef.id);
  try {
    await setDoc(newArtistRef, { test: true });
    console.log("Successfully wrote doc!");
  } catch (e) {
    console.error("Error writing doc:", e);
  }
}

test().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
