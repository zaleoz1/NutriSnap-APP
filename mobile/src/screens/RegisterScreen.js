import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { apiFetch } from '../services/api';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleRegister() {
    try {
      await apiFetch('/api/auth/register', { method: 'POST', body: { name, email, password } });
      Alert.alert('Sucesso', 'Conta criada, faça login.');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar conta</Text>
      <TextInput placeholder="Nome" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha (mín. 6)" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={handleRegister} style={styles.button}><Text style={styles.btnText}>Cadastrar</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:24, backgroundColor:'#f3f4f6' },
  title: { fontSize:28, fontWeight:'800', color:'#111827', textAlign:'center', marginBottom:24 },
  input: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  button: { backgroundColor:'#10b981', padding:14, borderRadius:12, marginTop:8 },
  btnText: { color:'#fff', fontWeight:'700', textAlign:'center' },
});
