import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  SafeAreaView,
  Platform,
  StatusBar
} from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function AddQuestionScreen() {
  const navigation = useNavigation();
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const handleSave = async () => {
    if (!question || options.some(opt => !opt) || correctAnswer === '' || !subject || !difficulty) {
      Alert.alert('Toate câmpurile sunt obligatorii!');
      return;
    }

    try {
      await addDoc(collection(db, 'questions'), {
        question,
        options,
        correctAnswer: parseInt(correctAnswer),
        subject,
        difficulty,
      });
      Alert.alert('Succes', 'Întrebare adăugată!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Eroare', error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Text style={styles.backText}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Adaugă întrebare nouă</Text>

        <TextInput
          placeholder="Întrebarea"
          value={question}
          onChangeText={setQuestion}
          style={styles.input}
        />

        {options.map((opt, index) => (
          <TextInput
            key={index}
            placeholder={`Răspuns ${index + 1}`}
            value={opt}
            onChangeText={(text) => {
              const updated = [...options];
              updated[index] = text;
              setOptions(updated);
            }}
            style={styles.input}
          />
        ))}

        <TextInput
          placeholder="Indexul răspunsului corect (0-3)"
          value={correctAnswer}
          onChangeText={setCorrectAnswer}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Materie (ex: Istorie)"
          value={subject}
          onChangeText={setSubject}
          style={styles.input}
        />

        <TextInput
          placeholder="Dificultate (ex: Ușor, Mediu, Greu)"
          value={difficulty}
          onChangeText={setDifficulty}
          style={styles.input}
        />

        <TouchableOpacity style={styles.button} onPress={handleSave}>
          <Text style={styles.buttonText}>Salvează întrebarea</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f1ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    color: '#9333ea',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6b21a8',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  button: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
