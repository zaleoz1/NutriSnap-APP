import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { buscarApi } from '../services/api';

export default function TelaRegistro({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function lidarComRegistro() {
    try {
      await buscarApi('/api/autenticacao/registrar', { 
        method: 'POST', 
        body: { nome, email, senha } 
      });
      Alert.alert('Sucesso', 'Conta criada, faça login.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Criar conta</Text>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} style={estilos.entrada} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={estilos.entrada} />
      <TextInput placeholder="Senha (mín. 6)" value={senha} onChangeText={setSenha} secureTextEntry style={estilos.entrada} />
      <TouchableOpacity onPress={lidarComRegistro} style={estilos.botao}><Text style={estilos.textoBotao}>Cadastrar</Text></TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:24, backgroundColor:'#f3f4f6' },
  titulo: { fontSize:28, fontWeight:'800', color:'#111827', textAlign:'center', marginBottom:24 },
  entrada: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  botao: { backgroundColor:'#10b981', padding:14, borderRadius:12, marginTop:8 },
  textoBotao: { color:'#fff', fontWeight:'700', textAlign:'center' },
});
