import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

export default function AdminScreen() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      navigation.replace('Login');
    } catch (error) {
      alert('Eroare la delogare: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Panou Administrator</Text>
      <Text style={styles.subtitle}>Bine ai venit! Alege o acțiune:</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AddQuestion')}
      >
        <Text style={styles.buttonText}>➕ Adaugă întrebare</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('AllQuestions')}
      >
        <Text style={styles.buttonText}>📋 Vezi toate întrebările</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>🔒 Delogare</Text>
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
    padding: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#a855f7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutButton: {
    marginTop: 30,
  },
  logoutText: {
    color: '#9333ea',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
