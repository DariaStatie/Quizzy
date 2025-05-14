import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function QuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subject, difficulty } = route.params;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);

  const timerRef = useRef();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const q = query(
          collection(db, 'questions'),
          where('subject', '==', subject),
          where('difficulty', '==', difficulty)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const shuffled = shuffleArray(data).slice(0, 5);
        setQuestions(shuffled);
      } catch (e) {
        alert('Eroare la încărcarea întrebărilor');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    if (questions.length === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          clearInterval(timerRef.current);
          handleNext();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [current, questions]);

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  const handleAnswer = (index) => {
    if (selected !== null) return;
    setSelected(index);

    const isCorrect = index === questions[current].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    clearInterval(timerRef.current);
    setTimeout(() => handleNext(isCorrect ? null : questions[current]), 1500);
  };

  const handleNext = (lastIncorrect = null) => {
    setSelected(null);
    setTimeLeft(30);

    if (lastIncorrect) {
      setIncorrectAnswers(prev => [...prev, lastIncorrect]);
    }

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      navigation.replace('ResultScreen', {
        score,
        total: questions.length,
        incorrectAnswers: lastIncorrect
          ? [...incorrectAnswers, lastIncorrect]
          : incorrectAnswers,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#9333ea" />
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Nu există întrebări pentru această selecție.</Text>
      </View>
    );
  }

  const question = questions[current];

  return (
    <View style={styles.container}>
      <Text style={styles.timer}>⏳ {timeLeft}s</Text>
      <Text style={styles.question}>{question.question}</Text>

      {question.options.map((opt, i) => (
        <TouchableOpacity
          key={i}
          style={[
            styles.option,
            selected !== null && i === question.correctAnswer && styles.correct,
            selected !== null && selected === i && selected !== question.correctAnswer && styles.incorrect,
          ]}
          onPress={() => handleAnswer(i)}
          disabled={selected !== null}
        >
          <Text style={styles.optionText}>{opt}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1ff',
    padding: 20,
    justifyContent: 'center',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f1ff',
  },
  question: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6b21a8',
  },
  option: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  correct: {
    backgroundColor: '#4ade80',
    borderColor: '#16a34a',
  },
  incorrect: {
    backgroundColor: '#fecaca',
    borderColor: '#dc2626',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  timer: {
    fontSize: 18,
    color: '#9333ea',
    textAlign: 'right',
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b21a8',
    textAlign: 'center',
  },
});
