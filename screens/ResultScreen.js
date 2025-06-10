import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { auth, db } from '../firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import socket from '../socket';
import ConfettiCannon from 'react-native-confetti-cannon';
import LottieView from 'lottie-react-native';

export default function ResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();

  // ✅ Adăugăm fallback = [] dacă undefined
  const {
    score,
    total,
    incorrectAnswers = [],
    roomId,
    opponentScore: paramOpponentScore,
    winMessage,
  } = route.params ?? {};

  const [opponentScore, setOpponentScore] = useState(paramOpponentScore || null);
  const [finalMessage, setFinalMessage] = useState(winMessage || '');
  const [showConfetti, setShowConfetti] = useState(winMessage?.includes('câștigat'));
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const saveScore = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        await addDoc(collection(db, 'scores'), {
          uid: user.uid,
          score,
          total,
          timestamp: serverTimestamp(),
          incorrectQuestions: incorrectAnswers.map(q => ({
            question: q.question,
            correctAnswer: q.correctAnswer,
            timedOut: !!q.timedOut,
          })),
        });
      } catch (error) {
        console.log('Eroare la salvarea scorului:', error);
      }
    };
    saveScore();
  }, []);

  useEffect(() => {
    if (!roomId || paramOpponentScore !== null) return;
    socket.on('receive_scores', ({ player1, player2 }) => {
      const opponent = player1 === score ? player2 : player1;
      setOpponentScore(opponent);
      if (score > opponent) {
        setFinalMessage('🏆 Ai câștigat!');
        setShowConfetti(true);
      } else if (score < opponent) {
        setFinalMessage('😞 Ai pierdut!');
        triggerShake();
      } else {
        setFinalMessage('🤝 Egalitate!');
      }
    });
    return () => socket.off('receive_scores');
  }, [roomId, paramOpponentScore, score]);

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Test finalizat ✅</Text>
      <Text style={styles.scoreText}>Scorul tău: {score} / {total}</Text>

      {roomId && opponentScore !== null && (
        <>
          <Text style={styles.scoreText}>Scor adversar: {opponentScore} / {total}</Text>
          <Animated.Text style={[styles.resultText, { transform: [{ translateX: shakeAnim }] }]}>
            {finalMessage}
          </Animated.Text>
        </>
      )}

      {finalMessage.includes('câștigat') && (
        <LottieView
          source={require('../assets/medal_star.json')}
          autoPlay
          loop={false}
          style={{ width: 180, height: 180, marginBottom: 20 }}
        />
      )}

      {incorrectAnswers.length > 0 && (
        <View style={styles.incorrectSection}>
          <Text style={styles.subtitle}>Întrebări greșite:</Text>
          {incorrectAnswers.map((q, idx) => (
            <View key={idx} style={styles.wrongBox}>
              <Text style={styles.qtext}>❌ {q.question}</Text>
              <Text style={styles.ctext}>✅ Răspuns corect: {q.correctAnswer}</Text>
              {q.timedOut && <Text style={styles.timeoutNote}>⏱ Timpul a expirat</Text>}
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.replace('Home')}
      >
        <Text style={styles.buttonText}>🏠 Înapoi</Text>
      </TouchableOpacity>

      {showConfetti && (
        <ConfettiCannon count={120} origin={{ x: 200, y: 0 }} fadeOut />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 80,
    paddingBottom: 50,
    backgroundColor: '#f8f1ff',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6b21a8',
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 22,
    color: '#111827',
    textAlign: 'center',
    marginBottom: 10,
  },
  resultText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 30,
    color: '#9333ea',
    textAlign: 'center',
  },
  incorrectSection: {
    width: '100%',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#7c3aed',
  },
  wrongBox: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    width: '100%',
  },
  qtext: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#dc2626',
  },
  ctext: {
    color: '#16a34a',
  },
  timeoutNote: {
    color: '#ea580c',
    marginTop: 5,
    fontStyle: 'italic',
  },
  button: {
    marginTop: 30,
    backgroundColor: '#9333ea',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
