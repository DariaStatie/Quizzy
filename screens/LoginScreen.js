import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Modal,
  Alert,
} from 'react-native';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { auth } from '../firebase';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [customError, setCustomError] = useState('');

  const db = getFirestore();

  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();

      if (userData?.role === 'admin') {
        navigation.replace('Admin');
      } else {
        navigation.replace('Home');
      }
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setCustomError('Adresa de email este deja folosită.');
      } else if (error.code === 'auth/invalid-email') {
        setCustomError('Adresa de email nu este validă.');
      } else if (error.code === 'auth/wrong-password') {
        setCustomError('Parolă incorectă.');
      } else {
        setCustomError('Eroare la autentificare.');
      }
    }
  };

  const handlePasswordReset = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      Alert.alert('Email trimis', 'Verifică adresa de email pentru a reseta parola.');
      setResetModalVisible(false);
      setResetEmail('');
    } catch (error) {
      Alert.alert('Eroare', 'Email invalid sau cont inexistent.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/start-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Autentificare</Text>

        {customError !== '' && (
          <Text style={styles.errorBox}>{customError}</Text>
        )}

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

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Autentifică-te</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
          <Text style={styles.link}>Nu ai cont? Creează unul</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setResetModalVisible(true)}>
          <Text style={styles.forgotText}>Ai uitat parola?</Text>
        </TouchableOpacity>

        <Modal visible={resetModalVisible} transparent animationType="slide">
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Resetare parolă</Text>
              <TextInput
                style={styles.input}
                placeholder="Introdu emailul tău"
                placeholderTextColor="#aaa"
                value={resetEmail}
                onChangeText={setResetEmail}
              />
              <TouchableOpacity style={styles.modalButton} onPress={handlePasswordReset}>
                <Text style={styles.buttonText}>Trimite email</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setResetModalVisible(false)}>
                <Text style={styles.link}>Renunță</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    marginBottom: 20,
    borderColor: '#d1d5db',
    borderWidth: 1,
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
    marginTop: 10,
  },
  forgotText: {
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
    color: '#7c3aed',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6b21a8',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#6d28d9',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
});
