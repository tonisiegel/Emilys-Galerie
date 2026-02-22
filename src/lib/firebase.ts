import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_emH1NZ0CiTAY26rmCcWSohIzmJERwoM",
  authDomain: "website-fotografie-1e243.firebaseapp.com",
  projectId: "website-fotografie-1e243",
  storageBucket: "website-fotografie-1e243.firebasestorage.app",
  messagingSenderId: "212300744706",
  appId: "1:212300744706:web:b79b03d04b98bc21503f1b"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;
