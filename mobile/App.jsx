import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProvedorAutenticacao } from './src/services/AuthContext';
import NavigationHandler from './src/components/NavigationHandler';

// Telas de autenticação
import TelaSplash from './src/Telas/Splash';
import TelaBoasVindas from './src/Telas/Welcome';
import TelaLogin from './src/Telas/Login';
import TelaCadastro from './src/Telas/Cadastro';

// Telas principais
import TelaPrincipal from './src/Telas/Painel';
import TelaDashboard from './src/Telas/Dashboard';
import TelaDiario from './src/Telas/Diario';
import TelaRefeicoes from './src/Telas/Refeicoes';
import TelaMetas from './src/Telas/Metas';
import TelaTreinos from './src/Telas/PlanodeTreino';
import TelaMeusDados from './src/Telas/MeusDados';
import TelaIMC from './src/Telas/IMC';
import TelaQuiz from './src/Telas/Quiiz';
import TelaConfiguracoes from './src/Telas/Configuracoes';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ProvedorAutenticacao>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{
            headerShown: false,
            animation: 'fade',
          }}
        >
          <Stack.Screen name="Splash" component={TelaSplash} />
          <Stack.Screen name="Welcome" component={TelaBoasVindas} />
          <Stack.Screen name="Login" component={TelaLogin} />
          <Stack.Screen name="Cadastro" component={TelaCadastro} />
          <Stack.Screen name="Principal" component={TelaPrincipal} />
          <Stack.Screen name="Dashboard" component={TelaDashboard} />
          <Stack.Screen name="Diario" component={TelaDiario} />
          <Stack.Screen name="Refeicoes" component={TelaRefeicoes} />
          <Stack.Screen name="Metas" component={TelaMetas} />
          <Stack.Screen name="Treinos" component={TelaTreinos} />
          <Stack.Screen name="MeusDados" component={TelaMeusDados} />
          <Stack.Screen name="IMC" component={TelaIMC} />
          <Stack.Screen name="Quiiz" component={TelaQuiz} />
          <Stack.Screen name="Configuracoes" component={TelaConfiguracoes} />
        </Stack.Navigator>
        <NavigationHandler />
      </NavigationContainer>
    </ProvedorAutenticacao>
  );
}
