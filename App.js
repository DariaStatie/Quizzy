import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, LogBox } from 'react-native'; 
import Toast from 'react-native-toast-message'; 

import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import StartScreen from './screens/StartScreen';
import AddQuestionScreen from './screens/AddQuestionScreen';
import AdminScreen from './screens/AdminScreen';
import AllQuestionsScreen from './screens/AllQuestionsScreen';
import EditQuestionScreen from './screens/EditQuestionScreen';
import SelectSubjectScreen from './screens/SelectSubjectScreen';
import SelectDifficultyScreen from './screens/SelectDifficultyScreen';
import QuizScreen from './screens/QuizScreen';
import ScoreScreen from './screens/ScoreScreen';
import ResultScreen from './screens/ResultScreen';
import IncorrectAnswersScreen from './screens/IncorrectAnswersScreen';

const Stack = createNativeStackNavigator();


LogBox.ignoreLogs(['Text strings must be rendered within a <Text> component']);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const prepareApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 500)); 
      } catch (error) {
        console.error('❌ Eroare la inițializare:', error);
      } finally {
        setIsReady(true);
      }
    };

    prepareApp();
  }, []);

  if (!isReady) return null;

  return (
    <NavigationContainer>
      <View style={{ flex: 1 }}>
        <Stack.Navigator initialRouteName="Start" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Start" component={StartScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="AddQuestion" component={AddQuestionScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
          <Stack.Screen name="AllQuestions" component={AllQuestionsScreen} />
          <Stack.Screen name="EditQuestion" component={EditQuestionScreen} />
          <Stack.Screen name="SelectSubject" component={SelectSubjectScreen} />
          <Stack.Screen name="SelectDifficulty" component={SelectDifficultyScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="ScoreScreen" component={ScoreScreen} />
          <Stack.Screen name="ResultScreen" component={ResultScreen} />
          <Stack.Screen name="IncorrectAnswers" component={IncorrectAnswersScreen} />
        </Stack.Navigator>

        <Toast />
      </View>
    </NavigationContainer>
  );
}
