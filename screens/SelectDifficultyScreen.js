import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import socket from '../socket';
import { fetchQuestions } from '../utils/questionUtils';

export default function SelectDifficultyScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { subject, roomId = null } = route.params || {};

  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const normalize = (text) =>
    text.normalize("NFD").replace(/[\u0300-\u036f]/g, '');

  // 🎮 Multiplayer: ascultă start_quiz
  useEffect(() => {
    if (!roomId) return;

    socket.on('start_quiz', ({ subject, difficulty, questions, isMultiplayer }) => {
      console.log(`✅ Primit start_quiz cu ${questions?.length} întrebări, isMultiplayer=${isMultiplayer}`);
      if (questions?.length > 0) {
        console.log(`📝 Prima întrebare: ${questions[0].question}`);
      }

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
    if (!selectedDifficulty || isLoading) return;

    setIsLoading(true);
    const safeDifficulty = normalize(selectedDifficulty);

    if (!roomId) {
      // ✅ Mod SINGLE PLAYER
      try {
        const questions = await fetchQuestions(subject, safeDifficulty);
        if (!questions || questions.length === 0) {
          Alert.alert('Eroare', 'Nu s-au găsit întrebări pentru selecția aleasă.');
          return;
        }

        navigation.replace('Quiz', {
          subject,
          difficulty: safeDifficulty,
          questions,
          isMultiplayer: false,
        });
      } catch (error) {
        console.error('❌ Eroare la fetchQuestions:', error);
        Alert.alert('Eroare', 'Nu s-au putut încărca întrebările.');
      } finally {
        setIsLoading(false);
      }

      return;
    }

    // ✅ Mod MULTIPLAYER
    try {
      socket.emit('set_quiz_settings', {
        roomId,
        subject,
        difficulty: safeDifficulty,
      });

      socket.emit('who_is_host', roomId, async (isHost) => {
        console.log(`🔍 Este host? ${isHost}`);

        if (isHost) {
          Alert.alert('Așteptați', 'Se încarcă întrebările...');

          try {
            const questions = await fetchQuestions(subject, safeDifficulty);

            console.log(`✅ Încărcate ${questions.length} întrebări, trimit la server`);
            if (questions.length > 0) {
              console.log(`📝 Prima întrebare: ${questions[0].question}`);
            }

            socket.emit('set_questions', { roomId, questions });

            Alert.alert('Pregătit', 'Întrebările au fost încărcate. Așteptați ca celălalt jucător să se conecteze...');
          } catch (error) {
            console.error('❌ Eroare la încărcarea întrebărilor:', error);
            Alert.alert('Eroare', 'Nu s-au putut încărca întrebările.');
          } finally {
            setIsLoading(false);
          }
        } else {
          // 👇 guest-ul nu încarcă nimic, doar trimite ready
          console.log('📱 Guest: Trimit ready_to_start');
          socket.emit('ready_to_start', { roomId });

          Alert.alert('Așteptați', 'Se așteaptă ca host-ul să aleagă setările și să înceapă jocul...');
          setIsLoading(false);
        }
      });
    } catch (error) {
      console.error('❌ Eroare:', error);
      Alert.alert('Eroare', 'A apărut o eroare la comunicarea cu serverul.');
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
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
          disabled={isLoading}
        >
          <Text style={styles.optionText}>{level}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[
          styles.continueButton,
          (!selectedDifficulty || isLoading) && styles.disabledButton,
        ]}
        onPress={handleContinue}
        disabled={!selectedDifficulty || isLoading}
      >
        <Text style={styles.continueText}>
          {isLoading ? 'Se încarcă...' : 'Continuă'}
        </Text>
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
