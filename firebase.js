// firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Configurația aplicației tale Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9q5ygrlwWbX5pFVM6jVJGeSqw4uUdpGI",
  authDomain: "quizzy-e3f25.firebaseapp.com",
  projectId: "quizzy-e3f25",
  storageBucket: "quizzy-e3f25.firebasestorage.app",
  messagingSenderId: "488519910715",
  appId: "1:488519910715:web:f1c8d8d212565c6182231e",
  measurementId: "G-YPN5HFC4BX"
};

// Inițializarea aplicației Firebase
const app = initializeApp(firebaseConfig);

// Inițializarea serviciilor Firebase
const auth = getAuth(app);
const db = getFirestore(app);

// Exportăm instanțele
export { auth, db };
