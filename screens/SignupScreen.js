import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { auth } from '../firebase';

export default function SignupScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const db = getFirestore();

  // Reguli pentru parolă
  const checks = {
    minLength: password.length >= 8,
    hasNumber: /\d/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  const isValidPassword = () => {
    return checks.minLength && checks.hasNumber && checks.hasSpecial;
  };

  const handleSignup = async () => {
    if (!isValidPassword()) {
      Alert.alert(
        'Parolă slabă',
        'Parola trebuie să aibă minim 8 caractere, o cifră și un caracter special.'
      );
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Creează document Firestore cu rol implicit "user"
      await setDoc(doc(db, 'users', user.uid), {
           email: user.email,
           role: 'user',
           createdAt: new Date().toISOString(),
      });

      await sendEmailVerification(user);
      Alert.alert('Cont creat!', 'Verifică adresa de email pentru a confirma contul.');
      navigation.navigate('Login');
    } catch (error) {
      console.error(error);
      Alert.alert('Eroare la creare cont', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/start-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Creare cont</Text>

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#aaa"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Parolă"
          placeholderTextColor="#aaa"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        {/* Cerințe parolă dinamice */}
        <View style={styles.passwordRequirements}>
          <Text style={[styles.requirement, { color: checks.minLength ? 'green' : 'red' }]}>
            • minim 8 caractere
          </Text>
          <Text style={[styles.requirement, { color: checks.hasNumber ? 'green' : 'red' }]}>
            • cel puțin o cifră
          </Text>
          <Text style={[styles.requirement, { color: checks.hasSpecial ? 'green' : 'red' }]}>
            • un caracter special (!@#$%^&* etc.)
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Creează cont</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Ai deja cont? Autentifică-te</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: 'cover',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderColor: '#d1d5db',
    borderWidth: 1,
  },
  passwordRequirements: {
    marginBottom: 20,
    paddingLeft: 10,
  },
  requirement: {
    fontSize: 13,
  },
  button: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  link: {
    textAlign: 'center',
    color: '#6b21a8',
    textDecorationLine: 'underline',
  },
});
