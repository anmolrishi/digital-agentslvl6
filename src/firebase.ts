import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: "AIzaSyDCiLD4rpI37O81PNL_CIvFSor6bJUW6tA",
  authDomain: "digital-agents-c8c36.firebaseapp.com",
  projectId: "digital-agents-c8c36",
  storageBucket: "digital-agents-c8c36.firebasestorage.app",
  messagingSenderId: "799763027243",
  appId: "1:799763027243:web:7abf929d00709afc1c616e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const functions = getFunctions(app);