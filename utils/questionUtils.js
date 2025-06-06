// utils/questionUtils.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

// Helper function for seeded random (will produce the same sequence for the same seed)
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

export const fetchQuestions = async (subject, difficulty, isMultiplayer = false, seed = null) => {
  const q = query(
    collection(db, 'questions'),
    where('subject', '==', subject),
    where('difficulty', '==', difficulty)
  );
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  let shuffled;
  
  if (isMultiplayer && seed !== null) {
    // Use seeded shuffling for multiplayer to ensure consistent order
    shuffled = [...data];
    let currentIndex = shuffled.length;
    
    // Fisher-Yates shuffle with seeded random
    while (currentIndex > 0) {
      const randomIndex = Math.floor(seededRandom(seed + currentIndex) * currentIndex);
      currentIndex--;
      
      // Swap elements
      [shuffled[currentIndex], shuffled[randomIndex]] = 
      [shuffled[randomIndex], shuffled[currentIndex]];
    }
  } else {
    // Regular random shuffle for single player
    shuffled = data.sort(() => Math.random() - 0.5);
  }
  
  return shuffled.slice(0, 5);
};
