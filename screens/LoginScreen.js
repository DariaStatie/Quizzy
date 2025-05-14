import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ImageBackground,
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
  registerForPushNotificationsAsync,
  sendPushNotification,
} from '../lib/notifications';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [expoPushToken, setExpoPushToken] = useState(null);

  const db = getFirestore();

  useEffect(() => {
    // obține tokenul la montarea ecranului
    registerForPushNotificationsAsync().then(token => {
      if (token) setExpoPushToken(token);
    });
  }, []);

  const handleLogin = async () => {
    console.log('🔐 Autentificare cu:', email);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        console.log('⚠️ Email neverificat! Trimit notificare...');
        if (expoPushToken) {
          await sendPushNotification(
            expoPushToken,
            'Email neverificat',
            'Te rugăm să îți confirmi adresa de email pentru a continua.'
          );
        }

        Alert.alert(
          'Email neverificat',
          'Te rugăm să îți confirmi adresa de email pentru a continua.'
        );
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        Alert.alert('Eroare', 'Utilizatorul nu există în baza de date.');
        return;
      }

      const role = userDoc.data().role;
      console.log('🎭 Rol detectat:', role);

      if (role === 'admin') {
        navigation.navigate('Admin');
      } else {
        navigation.navigate('Home');
      }
    } catch (error) {
      console.log('❌ Eroare la autentificare:', error.message);
      Alert.alert('Eroare la autentificare', error.message);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/start-bg.jpg')}
      style={styles.background}
    >
      <View style={styles.container}>
        <Text style={styles.title}>Autentificare</Text>

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
  },
});
