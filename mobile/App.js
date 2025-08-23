import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BMIScreen from './src/screens/BMIScreen';
import GoalScreen from './src/screens/GoalScreen';
import TelaPlanoTreino from './src/screens/WorkoutPlanScreen';
import MealsScreen from './src/screens/MealsScreen';
import { ProvedorAutenticacao } from './src/services/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ProvedorAutenticacao>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
          <Stack.Screen name="Principal" component={HomeScreen} options={{ title: 'NutriSnap' }} />
          <Stack.Screen name="IMC" component={BMIScreen} options={{ title: 'IMC' }} />
          <Stack.Screen name="Meta" component={GoalScreen} options={{ title: 'Meta de Peso' }} />
          <Stack.Screen name="PlanoTreino" component={TelaPlanoTreino} options={{ title: 'Rotina de Treino' }} />
          <Stack.Screen name="Refeicoes" component={MealsScreen} options={{ title: 'Refeições' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </ProvedorAutenticacao>
  );
}
