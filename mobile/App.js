import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashScreen from './src/Telas/Splash';
import WelcomeScreen from './src/Telas/Welcome';
import OnboardingScreen from './src/Telas/Quiiz';
import LoginScreen from './src/Telas/Login';
import RegisterScreen from './src/Telas/Cadastro';
import HomeScreen from './src/Telas/Painel';
import DashboardScreen from './src/Telas/Dashboard';
import BMIScreen from './src/Telas/IMC';
import GoalScreen from './src/Telas/Metas';
import WorkoutPlanScreen from './src/Telas/PlanodeTreino';
import MealsScreen from './src/Telas/Refeicoes';
import DiarioScreen from './src/Telas/Diario';
import ConfiguracoesScreen from './src/Telas/Configuracoes';
import MeusDadosScreen from './src/Telas/MeusDados';
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
            <Stack.Screen name="Quiiz" component={OnboardingScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Principal" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
            <Stack.Screen name="IMC" component={BMIScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Meta" component={GoalScreen} options={{ title: 'Meta de Peso' }} />
            <Stack.Screen name="PlanoTreino" component={WorkoutPlanScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Refeicoes" component={MealsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Diario" component={DiarioScreen} options={{ headerShown: false }} />
            <Stack.Screen name="MeusDados" component={MeusDadosScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Configuracoes" component={ConfiguracoesScreen} options={{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </ProvedorAutenticacao>
    </SafeAreaProvider>
  );
}
