import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Web SDK Configuration (Parsed dynamically from google-services.json context)
const firebaseConfig = {
  apiKey: "AIzaSyBU3uK9hxQAQ28jjz6LRBzvRG8SUm-85rc",
  authDomain: "beatconnect-5a89d.firebaseapp.com",
  databaseURL: "https://beatconnect-5a89d-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "beatconnect-5a89d",
  storageBucket: "beatconnect-5a89d.firebasestorage.app",
  messagingSenderId: "134902428872",
  appId: "1:134902428872:web:6f1b0ae3b1594cdcd9e1fd" // Fallback representation
};

// Initialize Firebase only if it hasn't been initialized yet
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db, app };
