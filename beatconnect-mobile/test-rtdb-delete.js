const { initializeApp } = require('firebase/app');
const { getDatabase, ref, remove } = require('firebase/database');

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
    await remove(ref(db, 'artists/-OqnEQe9rJWB3AjlWJ0-'));
    console.log("Successfully deleted!");
  } catch (e) {
    console.error("Error:", e.message);
  }
  process.exit(0);
}

test();
