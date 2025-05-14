import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from 'react-native';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function AllQuestionsScreen() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchQuestions = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'questions'));
      const questionList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setQuestions(questionList);
    } catch (error) {
      Alert.alert('Eroare', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchQuestions);
    return unsubscribe;
  }, [navigation]);

  const handleDelete = async (id) => {
    Alert.alert('Confirmare', 'Sigur vrei să ștergi această întrebare?', [
      { text: 'Anulează', style: 'cancel' },
      {
        text: 'Șterge',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'questions', id));
            fetchQuestions(); // Refresh după ștergere
          } catch (error) {
            Alert.alert('Eroare la ștergere', error.message);
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.questionBox}>
      <Text style={styles.questionText}>❓ {item.question}</Text>
      {item.options.map((opt, index) => (
        <Text
          key={index}
          style={[
            styles.optionText,
            index === item.correctAnswer && styles.correctOption,
          ]}
        >
          {index + 1}. {opt}
        </Text>
      ))}

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('EditQuestion', { questionData: item })}
        >
          <Text style={styles.actionText}>✏️ Editează</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.actionText}>🗑️ Șterge</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <Text style={styles.backText}>← Înapoi</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Toate întrebările</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#9333ea" />
      ) : (
        <FlatList
          data={questions}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1ff',
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 5,
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
    marginBottom: 20,
  },
  questionBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  questionText: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 16,
  },
  optionText: {
    fontSize: 15,
    marginBottom: 5,
  },
  correctOption: {
    color: '#16a34a',
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  editButton: {
    backgroundColor: '#e0e7ff',
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#fee2e2',
    padding: 8,
    borderRadius: 8,
  },
  actionText: {
    fontWeight: 'bold',
    color: '#111827',
  },
});
