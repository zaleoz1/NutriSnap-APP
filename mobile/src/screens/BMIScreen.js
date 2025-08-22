import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

export default function BMIScreen() {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [bmi, setBmi] = useState(null);
  const [category, setCategory] = useState('');

  function calculateBMI() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    if (!w || !h || w<=0 || h<=0) return;
    const v = w / (h*h);
    setBmi(v.toFixed(2));
    if (v < 18.5) setCategory('Abaixo do peso');
    else if (v < 25) setCategory('Peso normal');
    else if (v < 30) setCategory('Sobrepeso');
    else if (v < 35) setCategory('Obesidade I');
    else if (v < 40) setCategory('Obesidade II');
    else setCategory('Obesidade III');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Calculadora de IMC</Text>
      <TextInput placeholder="Peso (kg)" keyboardType="numeric" value={weight} onChangeText={setWeight} style={styles.input} />
      <TextInput placeholder="Altura (m) ex: 1.75" keyboardType="numeric" value={height} onChangeText={setHeight} style={styles.input} />
      <TouchableOpacity onPress={calculateBMI} style={styles.button}><Text style={styles.btnText}>Calcular</Text></TouchableOpacity>
      {bmi && <View style={styles.result}><Text style={styles.resultText}>IMC: {bmi}</Text><Text style={styles.resultText}>Classificação: {category}</Text></View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  title: { fontSize:24, fontWeight:'800', color:'#10b981', textAlign:'center', marginBottom:16 },
  input: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  button: { backgroundColor:'#10b981', padding:14, borderRadius:12 },
  btnText: { color:'#fff', textAlign:'center', fontWeight:'700' },
  result: { marginTop:16, backgroundColor:'#fff', padding:16, borderRadius:12, borderWidth:1, borderColor:'#e5e7eb' },
  resultText: { textAlign:'center', fontSize:16 }
});
