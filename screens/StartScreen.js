import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function StartScreen({ navigation }) {
  return (
    <View style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Quizzy</Text>
        <Text style={styles.subtitle}>Testează-ți cunoștințele și distrează-te!</Text>

        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.buttonText}>Autentificare</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate('Signup')}
        >
          <Text style={styles.buttonText}>Creare cont</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#f3e8ff', 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#8b5cf6',
    marginBottom: 40,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#a855f7',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 30,
    marginBottom: 20,
    width: '80%',
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#d8b4fe',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
