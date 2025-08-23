import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { buscarApi, URL_BASE } from '../services/api';
import { usarAutenticacao } from '../services/AuthContext';

export default function TelaLogin({ navigation }) {
  const { entrar } = usarAutenticacao();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  async function lidarComLogin() {
    try {
      const dados = await buscarApi('/api/autenticacao/entrar', { method: 'POST', body: { email, senha } });
      await entrar(dados.token, dados.usuario);
      navigation.replace('Principal');
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>NutriSnap</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={estilos.entrada} />
      <TextInput placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry style={estilos.entrada} />
      <TouchableOpacity onPress={lidarComLogin} style={estilos.botao}><Text style={estilos.textoBotao}>Entrar</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Registrar')}><Text style={estilos.link}>Não tem conta? Cadastre-se</Text></TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:24, backgroundColor:'#f3f4f6' },
  titulo: { fontSize:32, fontWeight:'800', color:'#10b981', textAlign:'center', marginBottom:24 },
  entrada: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  botao: { backgroundColor:'#10b981', padding:14, borderRadius:12, marginTop:8 },
  textoBotao: { color:'#fff', fontWeight:'700', textAlign:'center' },
  link: { color:'#2563eb', textAlign:'center', marginTop:16 }
});