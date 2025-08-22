import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { apiFetch, BASE_URL } from '../services/api';
import { useAuth } from '../services/AuthContext';

export default function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      const data = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
      await signIn(data.token, data.user);
      navigation.replace('Home');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>NutriSnap</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <TouchableOpacity onPress={handleLogin} style={styles.button}><Text style={styles.btnText}>Entrar</Text></TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Register')}><Text style={styles.link}>Não tem conta? Cadastre-se</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, justifyContent:'center', padding:24, backgroundColor:'#f3f4f6' },
  title: { fontSize:32, fontWeight:'800', color:'#10b981', textAlign:'center', marginBottom:24 },
  input: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  button: { backgroundColor:'#10b981', padding:14, borderRadius:12, marginTop:8 },
  btnText: { color:'#fff', fontWeight:'700', textAlign:'center' },
  link: { color:'#2563eb', textAlign:'center', marginTop:16 }
});
