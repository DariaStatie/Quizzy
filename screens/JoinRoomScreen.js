import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import socket from '../socket';
import { useNavigation } from '@react-navigation/native';

export default function JoinRoomScreen() {
  const [roomId, setRoomId] = useState('');
  const [players, setPlayers] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    socket.on('connect', () => {
      console.log('✅ Conectat la socket:', socket.id);
    });

    socket.on('player_joined', (roomPlayers) => {
      setPlayers(roomPlayers);
    });

    socket.on('start_quiz', ({ subject, difficulty }) => {
      console.log('✅ Start quiz cu setări:', subject, difficulty);
      navigation.replace('Quiz', { roomId, subject, difficulty });
    });

    socket.on('player_left', () => {
      Alert.alert('Atenție', 'Celălalt jucător a părăsit camera.');
      setPlayers([]);
    });

    return () => {
      socket.off('connect');
      socket.off('player_joined');
      socket.off('start_quiz');
      socket.off('player_left');
    };
  }, [roomId]);

  const joinRoom = () => {
    const trimmedRoom = roomId.trim();
    if (!trimmedRoom) {
      Alert.alert('Eroare', 'Te rog introdu un ID valid pentru cameră.');
      return;
    }

    console.log('🚀 Trimitere către server:', trimmedRoom);
    Alert.alert('Te conectezi la camera', trimmedRoom);
    socket.emit('join_room', trimmedRoom, ({ isCreator, subject, difficulty }) => {
      if (isCreator) {
        navigation.replace('SelectSubject', { roomId: trimmedRoom });
      } else if (subject && difficulty) {
        socket.emit('ready_to_start', { roomId: trimmedRoom });
      } else {
        Alert.alert('Așteaptă', 'Așteaptă ca primul jucător să aleagă opțiunile.');
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🔗 Intră într-o competiție</Text>

      <TextInput
        style={styles.input}
        placeholder="ID Cameră (ex: abc123)"
        value={roomId}
        onChangeText={setRoomId}
      />

      <TouchableOpacity style={styles.button} onPress={joinRoom}>
        <Text style={styles.buttonText}>Conectează-te</Text>
      </TouchableOpacity>

      {players.length > 0 && (
        <Text style={styles.status}>
          {players.length}/2 jucători conectați...
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f1ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    width: '80%',
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#9333ea',
    padding: 14,
    borderRadius: 10,
    width: '60%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  status: {
    marginTop: 20,
    fontSize: 16,
    color: '#6b21a8',
  },
});
