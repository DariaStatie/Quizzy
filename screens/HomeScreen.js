import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { auth } from '../firebase';
import socket from '../socket'; // 🔗 Importă socket-ul

export default function HomeScreen({ navigation }) {
  useEffect(() => {
    socket.on('connect', () => {
      console.log('🟢 Conectat la serverul de socket:', socket.id);
    });

    // Cleanup la demontare
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Start' }],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bine ai venit la Quizzy!</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('SelectSubject')}
      >
        <Text style={styles.buttonText}>🎯 Let's Start</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('ScoreScreen')}
      >
        <Text style={styles.buttonText}>📊 Scorurile Mele</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.secondaryButton]}
        onPress={() => navigation.navigate('JoinRoom')}
      >
        <Text style={styles.buttonText}>⚔️ Competiție</Text>
      </TouchableOpacity>


      <TouchableOpacity
        style={[styles.button, styles.logoutButton]}
        onPress={handleLogout}
      >
        <Text style={styles.buttonText}>🔒 Delogare</Text>
      </TouchableOpacity>
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#9333ea',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#7c3aed',
  },
  logoutButton: {
    backgroundColor: '#e11d48',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
