import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/screens/Splash';
import WelcomeScreen from './src/screens/Welcome';
import OnboardingScreen from './src/screens/Integracao';
import LoginScreen from './src/screens/Login';
import RegisterScreen from './src/screens/Registro';
import HomeScreen from './src/screens/Home';
import DashboardScreen from './src/screens/Dashboard';
import BMIScreen from './src/screens/BMI';
import GoalScreen from './src/screens/Metas';
import WorkoutPlanScreen from './src/screens/PlanodeTreino';
import MealsScreen from './src/screens/Refeicoes';
import { ProvedorAutenticacao } from './src/services/AuthContext';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <ProvedorAutenticacao>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Splash">
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
            <Stack.Screen name="Principal" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="IMC" component={BMIScreen} options={{ title: 'IMC' }} />
            <Stack.Screen name="Meta" component={GoalScreen} options={{ title: 'Meta de Peso' }} />
            <Stack.Screen name="PlanoTreino" component={WorkoutPlanScreen} options={{ title: 'Rotina de Treino' }} />
            <Stack.Screen name="Refeicoes" component={MealsScreen} options={{ title: 'Refeições' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ProvedorAutenticacao>
    </SafeAreaProvider>
  );
}
