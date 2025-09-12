import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

// Lista de mensagens motivacionais
const mensagensMotivacionais = [
  "Hoje é mais um dia para você correr atrás dos seus objetivos. Mantenha o foco!",
  "A disciplina de hoje é o sucesso de amanhã. Vá em frente!",
  "Pequenas mudanças diárias levam a grandes resultados. Você consegue!",
  "Não desista! Cada passo, por menor que seja, te leva mais perto da sua meta.",
  "Sua saúde é seu maior investimento. Cuide bem de si mesmo hoje.",
  "Comece onde você está. Use o que você tem. Faça o que você pode. 💪",
  "O único treino ruim é aquele que não aconteceu. Vamos lá!",
  "Lembre-se do seu objetivo. A motivação vem da ação. Aja hoje!"
];

// Função para agendar uma notificação diária
export async function agendarNotificacaoDiaria() {
  // 1. Pedir permissão para enviar notificações
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    Alert.alert(
      "Permissão de Notificação",
      "Para receber mensagens diárias de motivação, por favor, habilite as notificações nas configurações do seu celular.",
    );
    return;
  }

  // 2. Limpar todas as notificações agendadas para evitar duplicidade
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 3. Escolher uma mensagem aleatória
  const mensagemAleatoria = mensagensMotivacionais[Math.floor(Math.random() * mensagensMotivacionais.length)];

  // 4. Agendar a notificação
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "NutriSnap - Lembrete Diário",
      body: mensagemAleatoria,
      sound: true, // Adicionar som à notificação
      priority: Notifications.AndroidNotificationPriority.HIGH,
    },
    trigger: {
      hour: 8, // Hora em que a notificação será enviada (8h da manhã)
      minute: 0,
      repeats: true, // Repetir todos os dias
    },
  });

  console.log('✅ Notificação diária agendada para 8h da manhã.');
}

// Função para cancelar as notificações agendadas
export async function cancelarNotificacoes() {
  await Notifications.cancelAllScheduledNotificationsAsync();
  console.log('❌ Todas as notificações agendadas foram canceladas.');
}