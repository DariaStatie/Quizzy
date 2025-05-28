// firebase.js
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore'; 

const firebaseConfig = {
  apiKey: "AIzaSyA9q5ygrlwWbX5pFVM6jVJGeSqw4uUdpGI",
  authDomain: "quizzy-e3f25.firebaseapp.com",
  projectId: "quizzy-e3f25",
  storageBucket: "quizzy-e3f25.firebasestorage.app",
  messagingSenderId: "488519910715",
  appId: "1:488519910715:web:f1c8d8d212565c6182231e",
  measurementId: "G-YPN5HFC4BX"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore(); 

export { auth, db }; 
