import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  StatusBar,
} from 'react-native';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { useNavigation } from '@react-navigation/native';

export default function ScoreScreen() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchScores = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const q = query(
          collection(db, 'scores'),
          where('uid', '==', user.uid),
          orderBy('timestamp', 'desc')
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setScores(data);
      } catch (e) {
        console.log('Eroare la preluarea scorurilor:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, []);

  const renderItem = ({ item }) => {
    const date = item.timestamp?.seconds
      ? new Date(item.timestamp.seconds * 1000)
      : new Date();
    const formattedDate = date.toLocaleString();

    return (
      <View style={styles.scoreBox}>
        <Text style={styles.scoreText}>Scor: {item.score} / {item.total}</Text>
        <Text style={styles.metaText}>{formattedDate}</Text>

        {item.incorrectQuestions?.length > 0 && (
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() =>
              navigation.navigate('IncorrectAnswers', {
                questions: item.incorrectQuestions,
              })
            }
          >
            <Text style={styles.detailText}>Vezi greșelile</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.wrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>← Înapoi</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Scorurile mele</Text>
        </View>

        <View style={styles.container}>
          {loading ? (
            <ActivityIndicator size="large" color="#9333ea" />
          ) : scores.length === 0 ? (
            <Text style={styles.empty}>Nu ai încă scoruri salvate.</Text>
          ) : (
            <FlatList
              data={scores}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingBottom: 30 }}
            />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#f8f1ff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  wrapper: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    backgroundColor: '#f8f1ff',
    paddingTop: 20,
  },
  backText: {
    fontSize: 16,
    color: '#9333ea',
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6b21a8',
    textAlign: 'center',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scoreBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  metaText: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  detailButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#e0e7ff',
    borderRadius: 8,
  },
  detailText: {
    color: '#4f46e5',
    fontWeight: 'bold',
  },
  empty: {
    textAlign: 'center',
    fontSize: 16,
    color: '#777',
    marginTop: 50,
  },
});
