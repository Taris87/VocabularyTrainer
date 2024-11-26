import { initializeApp } from 'firebase/app';
import { getAuth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyASmgCHGflpXXsz88epIQj_ru7rOfYB-N0",
  authDomain: "vokabelapp-e8e30.firebaseapp.com",
  projectId: "vokabelapp-e8e30",
  storageBucket: "vokabelapp-e8e30.appspot.com",
  messagingSenderId: "1089368381244",
  appId: "1:1089368381244:web:b1a5a3ad0180a81652b039",
  measurementId: "G-PBJWH45E20"
};

console.log('Firebase Config:', firebaseConfig); // Debug log

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Set persistence to local to avoid cross-site redirect issues
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

export const db = getFirestore(app);