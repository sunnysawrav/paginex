import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCGUcCBxFdxpm8m9DALd4No_EmLq8SCyxk",
  authDomain: "paginex.firebaseapp.com",
  projectId: "paginex",
  storageBucket: "paginex.firebasestorage.app",
  messagingSenderId: "120304978040",
  appId: "1:120304978040:web:9099352321371b8965458d",
  measurementId: "G-68PGLY5VMS"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;