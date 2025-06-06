// utils/questionUtils.js
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export const fetchQuestions = async (subject, difficulty) => {
  try {
    console.log(`🔍 Fetching questions for ${subject} / ${difficulty}`);
    
    const q = query(
      collection(db, 'questions'),
      where('subject', '==', subject),
      where('difficulty', '==', difficulty)
    );
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    console.log(`📚 Found ${data.length} questions in database`);
    
    // Amestecare fixă pentru a evita probleme
    const shuffled = [...data]
      .sort((a, b) => a.id.localeCompare(b.id))
      .slice(0, 5);
    
    console.log(`🎲 Returning ${shuffled.length} questions`);
    
    return shuffled;
  } catch (error) {
    console.error('❌ Error fetching questions:', error);
    return [];
  }
};
