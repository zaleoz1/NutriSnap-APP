import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import BMIScreen from './src/screens/BMIScreen';
import GoalScreen from './src/screens/GoalScreen';
import WorkoutPlanScreen from './src/screens/WorkoutPlanScreen';
import MealsScreen from './src/screens/MealsScreen';
import { AuthProvider } from './src/services/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'NutriSnap' }} />
          <Stack.Screen name="BMI" component={BMIScreen} options={{ title: 'IMC' }} />
          <Stack.Screen name="Goal" component={GoalScreen} options={{ title: 'Meta de Peso' }} />
          <Stack.Screen name="WorkoutPlan" component={WorkoutPlanScreen} options={{ title: 'Rotina de Treino' }} />
          <Stack.Screen name="Meals" component={MealsScreen} options={{ title: 'Refeições' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
