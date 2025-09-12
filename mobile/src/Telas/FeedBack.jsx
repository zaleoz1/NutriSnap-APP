/** 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import * as MailComposer from 'expo-mail-composer';

export default function FeedBack({ navigation }) {
  const [mensagem, setMensagem] = useState('');

  const enviarFeedback = async () => {
    if (!mensagem.trim()) {
      Alert.alert('Erro', 'Digite sua mensagem de feedback.');
      return;
    }
    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Erro', 'O envio de e-mail não está disponível neste dispositivo.');
      return;
    }
    await MailComposer.composeAsync({
      recipients: ['kaioalexandre2681@gmail.com'],
      subject: 'Feedback NutriSnap',
      body: mensagem,
    });
    setMensagem('');
    Alert.alert('Obrigado!', 'Seu feedback foi preparado para envio por e-mail.');
    if (navigation) navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.titulo}>Envie seu Feedback</Text>
      <TextInput
        style={styles.input}
        multiline
        placeholder="Digite seu feedback aqui..."
        placeholderTextColor="#888"
        value={mensagem}
        onChangeText={setMensagem}
        maxLength={500}
      />
      <TouchableOpacity style={styles.botaoEnviar} onPress={enviarFeedback}>
        <Text style={styles.textoBotao}>Enviar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#181818',
    padding: 24,
    justifyContent: 'center',
  },
  titulo: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 14,
    minHeight: 100,
    fontSize: 16,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  botaoEnviar: {
    backgroundColor: '#2ecc71',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
  },
  textoBotao: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    },
}); **/