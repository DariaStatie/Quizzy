// utils/questionUtils.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchQuestions = async (subject, difficulty) => {
  const q = query(
    collection(db, 'questions'),
    where('subject', '==', subject),
    where('difficulty', '==', difficulty)
  );
  const snapshot = await getDocs(q);
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

  const shuffled = data.sort(() => Math.random() - 0.5).slice(0, 5);
  return shuffled;
};
