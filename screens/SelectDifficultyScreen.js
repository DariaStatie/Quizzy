// ✅ SelectDifficultyScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import socket from '../socket';
import { fetchQuestions } from '../utils/questionUtils';

export default function SelectDifficultyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subject, roomId } = route.params;

  const [selectedDifficulty, setSelectedDifficulty] = useState(null);

  const normalize = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

  // 👇 Așteaptă semnalul de la server pentru START QUIZ
  useEffect(() => {
    socket.on('start_quiz', ({ subject, difficulty, questions }) => {
      navigation.replace('Quiz', {
        subject,
        difficulty,
        questions,
        roomId,
        isMultiplayer: true,
      });
    });

    return () => {
      socket.off('start_quiz');
    };
  }, [roomId]);

  const handleContinue = async () => {
    if (!selectedDifficulty) return;

    const safeDifficulty = normalize(selectedDifficulty);

    // 1. Trimite setările către server
    socket.emit('set_quiz_settings', {
      roomId,
      subject,
      difficulty: safeDifficulty,
    });

    // 2. Întreabă dacă utilizatorul este host
    socket.emit('who_is_host', roomId, async (isHost) => {
      if (isHost) {
        const questions = await fetchQuestions(subject, safeDifficulty);
        socket.emit('set_questions', { roomId, questions });
      }
      // ❗ Nu navigăm spre Quiz aici – așteptăm evenimentul 'start_quiz'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>← Înapoi</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Alege dificultatea:</Text>

      {['Ușor', 'Mediu', 'Dificil'].map((level) => (
        <TouchableOpacity
          key={level}
          style={[
            styles.optionButton,
            selectedDifficulty === level && styles.selectedOption,
          ]}
          onPress={() => setSelectedDifficulty(level)}
        >
          <Text style={styles.optionText}>{level}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedDifficulty && styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={!selectedDifficulty}
      >
        <Text style={styles.continueText}>Continuă</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5ebff', padding: 20, paddingTop: 40 },
  backText: { color: '#9333ea', fontSize: 16, marginBottom: 20 },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6b21a8',
    textAlign: 'center',
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#fff',
    borderColor: '#9333ea',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedOption: { backgroundColor: '#ede9fe' },
  optionText: { fontSize: 16, color: '#111827' },
  continueButton: {
    backgroundColor: '#9333ea',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 30,
  },
  continueText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  disabledButton: { backgroundColor: '#d4d4d8' },
});
