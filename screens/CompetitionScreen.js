import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import io from 'socket.io-client';

const socket = io('https://quizzy-realtime-server-production.up.railway.app');

export default function CompetitionScreen({ navigation }) {
  const [roomId, setRoomId] = useState('default-room');
  const [players, setPlayers] = useState([]);
  const [status, setStatus] = useState('Așteptăm un alt jucător...');
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    socket.emit('join_room', roomId);

    socket.on('player_joined', (playersInRoom) => {
      setPlayers(playersInRoom);
    });

    socket.on('start_quiz', () => {
      setStatus('Quiz-ul începe!');
      setQuizStarted(true);
      // Navighează către ecranul de quiz dacă vrei să înceapă efectiv acolo
      // navigation.navigate('Quiz', { multiplayer: true, roomId });
    });

    socket.on('player_left', () => {
      setStatus('Celălalt jucător a ieșit din cameră.');
      setQuizStarted(false);
    });

    return () => {
      socket.off('player_joined');
      socket.off('start_quiz');
      socket.off('player_left');
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Concurs Live</Text>
      <Text style={styles.text}>Camera: {roomId}</Text>
      <Text style={styles.text}>Jucători conectați: {players.length}</Text>
      <Text style={styles.status}>{status}</Text>

      {!quizStarted && (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Înapoi</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3e8ff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginVertical: 5,
  },
  status: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#9333ea',
    marginTop: 20,
  },
  backButton: {
    marginTop: 30,
    padding: 12,
    backgroundColor: '#e11d48',
    borderRadius: 10,
  },
  backText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
