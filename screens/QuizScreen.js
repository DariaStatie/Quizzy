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
import socket from '../socket';

export default function QuizScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subject, difficulty, isMultiplayer = false, roomId = null } = route.params;

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [incorrectAnswers, setIncorrectAnswers] = useState([]);
  const [opponentAnswered, setOpponentAnswered] = useState(null);

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
          const timedOutQuestion = {
            ...questions[current],
            correctAnswer: questions[current].options[questions[current].correctAnswer],
            timedOut: true,
          };
          setTimeout(() => handleNext(timedOutQuestion, score), 0);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [current, questions]);

  useEffect(() => {
    if (!isMultiplayer || !roomId) return;

    socket.on('opponent_answered', ({ answer, questionIndex }) => {
      if (questionIndex === current) setOpponentAnswered(answer);
    });

    return () => {
      socket.off('opponent_answered');
    };
  }, [current, isMultiplayer, roomId]);

  const shuffleArray = (arr) => arr.sort(() => Math.random() - 0.5);

  const handleAnswer = (index) => {
    if (selected !== null) return;
    setSelected(index);

    const isCorrect = index === questions[current].correctAnswer;

    clearInterval(timerRef.current);

    const currentQuestion = {
      ...questions[current],
      correctAnswer: questions[current].options[questions[current].correctAnswer],
      timedOut: false,
    };

    if (isMultiplayer && roomId) {
      socket.emit('answer', {
        roomId,
        answer: index,
        questionIndex: current,
      });
    }

    if (isCorrect) {
      const newScore = score + 1;
      setScore(newScore);
      setTimeout(() => handleNext(null, newScore), 1500);
    } else {
      setTimeout(() => handleNext(currentQuestion, score), 1500);
    }
  };

  const handleNext = (lastIncorrect = null, latestScore = score) => {
    setSelected(null);
    setOpponentAnswered(null);
    setTimeLeft(30);

    if (lastIncorrect) {
      setIncorrectAnswers(prev => [...prev, lastIncorrect]);
    }

    if (current + 1 < questions.length) {
      setCurrent(current + 1);
    } else {
      if (isMultiplayer && roomId) {
        socket.emit('submit_score', { roomId, score: latestScore });
      }

      navigation.replace('ResultScreen', {
        score: latestScore,
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
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backContainer}>
          <Text style={styles.backText}>← Înapoi</Text>
        </TouchableOpacity>
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
          {isMultiplayer && opponentAnswered === i && (
            <Text style={{ fontSize: 12, color: '#6b7280' }}>
              Adversarul a ales această opțiune
            </Text>
          )}
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
    padding: 20,
    backgroundColor: '#f8f1ff',
  },
  backContainer: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  backText: {
    fontSize: 16,
    color: '#9333ea',
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
    marginTop: 100,
  },
});
