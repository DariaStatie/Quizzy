import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function SelectSubjectScreen() {
  const navigation = useNavigation();
  const [selectedSubject, setSelectedSubject] = useState(null);

  const subjects = ['Istorie', 'Biologie', 'Geografie', 'Matematică', 'Română'];

  const handleContinue = () => {
    if (selectedSubject) {
      navigation.navigate('SelectDifficulty', { subject: selectedSubject });
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Alege materia:</Text>

        {subjects.map((subject, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.subjectButton,
              selectedSubject === subject && styles.selectedButton,
            ]}
            onPress={() => setSelectedSubject(subject)}
          >
            <Text style={styles.subjectText}>{subject}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={[
            styles.continueButton,
            !selectedSubject && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={!selectedSubject}
        >
          <Text style={styles.continueText}>Continuă</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f1ff',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    flexGrow: 1,
  },
  backButton: {
    marginBottom: 10,
  },
  backText: {
    fontSize: 16,
    color: '#9333ea',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b21a8',
    textAlign: 'center',
    marginBottom: 30,
  },
  subjectButton: {
    backgroundColor: '#fff',
    borderColor: '#9333ea',
    borderWidth: 1,
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  selectedButton: {
    backgroundColor: '#e9d5ff',
  },
  subjectText: {
    fontSize: 18,
    color: '#111827',
  },
  continueButton: {
    backgroundColor: '#9333ea',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },
  continueText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});
