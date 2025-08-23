import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';

function calcularCaloriasDiarias({ peso, altura, idade, sexo, nivelAtividade, objetivo }) {
  let tmb = 10 * peso + 6.25 * altura - 5 * idade;
  tmb += sexo === 'M' ? 5 : -161;

  const multiplicadoresAtividade = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725
  };
  let calorias = tmb * (multiplicadoresAtividade[nivelAtividade] || 1.2);
  if (objetivo === 'emagrecer') calorias -= 500;
  if (objetivo === 'ganhar') calorias += 500;
  return Math.round(calorias);
}

export default function TelaMeta() {
  const { token } = usarAutenticacao();
  const [pesoAtual, setPesoAtual] = useState('');
  const [pesoMeta, setPesoMeta] = useState('');
  const [dias, setDias] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('M'); // M/F
  const [nivelAtividade, setNivelAtividade] = useState('moderado');
  const [objetivo, setObjetivo] = useState('emagrecer');
  const [caloriasDiarias, setCaloriasDiarias] = useState(null);

  function lidarComCalculo() {
    const calorias = calcularCaloriasDiarias({
      peso: parseFloat(pesoAtual || '0'),
      altura: parseFloat(altura || '0') * 100, // altura em cm
      idade: parseInt(idade || '0'),
      sexo,
      nivelAtividade,
      objetivo
    });
    setCaloriasDiarias(calorias);
  }

  async function salvarMeta() {
    try {
      await buscarApi('/api/metas', {
        method: 'POST',
        token,
        body: {
          peso_atual: parseFloat(pesoAtual),
          peso_meta: parseFloat(pesoMeta),
          dias: parseInt(dias),
          calorias_diarias: parseInt(caloriasDiarias || '0')
        }
      });
      Alert.alert('Sucesso', 'Meta salva e meta diária definida!');
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Meta de Peso</Text>
      <TextInput placeholder="Peso atual (kg)" keyboardType="numeric" value={pesoAtual} onChangeText={setPesoAtual} style={estilos.entrada} />
      <TextInput placeholder="Peso desejado (kg)" keyboardType="numeric" value={pesoMeta} onChangeText={setPesoMeta} style={estilos.entrada} />
      <TextInput placeholder="Prazo (dias)" keyboardType="numeric" value={dias} onChangeText={setDias} style={estilos.entrada} />
      <TextInput placeholder="Altura (m) ex: 1.75" keyboardType="numeric" value={altura} onChangeText={setAltura} style={estilos.entrada} />
      <TextInput placeholder="Idade" keyboardType="numeric" value={idade} onChangeText={setIdade} style={estilos.entrada} />
      <TextInput placeholder="Sexo (M/F)" value={sexo} onChangeText={setSexo} style={estilos.entrada} />
      <TextInput placeholder="Atividade (sedentario/leve/moderado/intenso)" value={nivelAtividade} onChangeText={setNivelAtividade} style={estilos.entrada} />
      <TextInput placeholder="Objetivo (emagrecer/ganhar/manter)" value={objetivo} onChangeText={setObjetivo} style={estilos.entrada} />
      <TouchableOpacity onPress={lidarComCalculo} style={estilos.botao}><Text style={estilos.textoBotao}>Calcular Calorias</Text></TouchableOpacity>
      {caloriasDiarias && <Text style={estilos.resultado}>Meta diária: {caloriasDiarias} kcal</Text>}
      <TouchableOpacity onPress={salvarMeta} style={[estilos.botao, { backgroundColor:'#2563eb', marginTop:12 }]}><Text style={estilos.textoBotao}>Salvar Meta</Text></TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  titulo: { fontSize:24, fontWeight:'800', color:'#111827', textAlign:'center', marginBottom:16 },
  entrada: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  botao: { backgroundColor:'#10b981', padding:14, borderRadius:12 },
  textoBotao: { color:'#fff', textAlign:'center', fontWeight:'700' },
  resultado: { marginTop:12, textAlign:'center', fontSize:16, fontWeight:'700' }
});