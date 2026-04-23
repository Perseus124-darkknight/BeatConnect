const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');

const firebaseConfig = {
  apiKey: "AIzaSyBU3uK9hxQAQ28jjz6LRBzvRG8SUm-85rc",
  authDomain: "beatconnect-5a89d.firebaseapp.com",
  databaseURL: "https://beatconnect-5a89d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beatconnect-5a89d",
  storageBucket: "beatconnect-5a89d.firebasestorage.app",
  messagingSenderId: "134902428872",
  appId: "1:134902428872:web:6f1b0ae3b1594cdcd9e1fd"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

async function test() {
  try {
    const snapshot = await get(ref(db, 'artists'));
    if(snapshot.exists()){
       console.log(JSON.stringify(snapshot.val(), null, 2));
    } else {
       console.log("No artists found.");
    }
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}

test();
