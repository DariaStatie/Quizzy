import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function IncorrectAnswersScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { questions } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Înapoi</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Întrebări greșite</Text>

        {questions.map((item, idx) => (
          <View key={idx} style={styles.card}>
            <Text style={styles.qtext}>❌ {item.question}</Text>
            <Text style={styles.ctext}>✅ Răspuns corect: {item.correctAnswer}</Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f1ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  backText: {
    fontSize: 16,
    color: '#9333ea',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#6b21a8',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  qtext: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 6,
    color: '#dc2626',
  },
  ctext: {
    color: '#16a34a',
    fontSize: 15,
  },
});
