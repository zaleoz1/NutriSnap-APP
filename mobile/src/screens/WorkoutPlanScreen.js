import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';

function gerarPlanoTreino(diasPorSemana, objetivo, minutosPorSessao, horarioPreferido) {
  const catalogo = {
    emagrecer: ['Cardio 30-40min', 'HIIT 20min', 'Musculação leve (full body)', 'Ciclismo 40min', 'Caminhada rápida 45min'],
    ganhar: ['Força (peito/tríceps)', 'Força (costas/bíceps)', 'Força (pernas/ombros)', 'Core + estabilidade', 'Cardio leve 20min'],
    manter: ['Musculação moderada', 'Cardio moderado 30min', 'Yoga/alongamento 30min', 'Treino funcional 30min']
  };
  const base = catalogo[objetivo] || catalogo.manter;
  const plano = [];
  for (let i=0; i<diasPorSemana; i++) {
    plano.push({
      dia: `Dia ${i+1}`,
      treino: base[i % base.length],
      horario: horarioPreferido || 'manhã',
      minutos: minutosPorSessao || 30
    });
  }
  return plano;
}

export default function TelaPlanoTreino() {
  const { token } = usarAutenticacao();
  const [diasPorSemana, setDiasPorSemana] = useState('3');
  const [objetivo, setObjetivo] = useState('emagrecer');
  const [minutos, setMinutos] = useState('30');
  const [horarioPreferido, setHorarioPreferido] = useState('manhã');
  const [plano, setPlano] = useState([]);

  function lidarComGerar() {
    const p = gerarPlanoTreino(parseInt(diasPorSemana || '3'), objetivo, parseInt(minutos || '30'), horarioPreferido);
    setPlano(p);
  }

  async function salvarPlano() {
    try {
      await buscarApi('/api/treinos', { 
        method: 'POST', 
        token, 
        body: { plano } 
      });
      Alert.alert('Sucesso', 'Plano de treino salvo!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <View style={estilos.container}>
      <Text style={estilos.titulo}>Rotina de Treino</Text>
      <TextInput placeholder="Dias por semana (ex: 3)" keyboardType="numeric" value={diasPorSemana} onChangeText={setDiasPorSemana} style={estilos.entrada} />
      <TextInput placeholder="Objetivo (emagrecer/ganhar/manter)" value={objetivo} onChangeText={setObjetivo} style={estilos.entrada} />
      <TextInput placeholder="Minutos por sessão" keyboardType="numeric" value={minutos} onChangeText={setMinutos} style={estilos.entrada} />
      <TextInput placeholder="Horário preferido (manhã/tarde/noite)" value={horarioPreferido} onChangeText={setHorarioPreferido} style={estilos.entrada} />

      <TouchableOpacity onPress={lidarComGerar} style={estilos.botao}><Text style={estilos.textoBotao}>Gerar</Text></TouchableOpacity>

      <FlatList
        style={{ marginTop:12 }}
        data={plano}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={estilos.cartao}>
            <Text style={estilos.tituloCartao}>{item.dia} • {item.horario}</Text>
            <Text>{item.treino} — {item.minutos} min</Text>
          </View>
        )}
      />

      {plano.length>0 && <TouchableOpacity onPress={salvarPlano} style={[estilos.botao, { backgroundColor:'#2563eb', marginTop:12 }]}><Text style={estilos.textoBotao}>Salvar Plano</Text></TouchableOpacity>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  titulo: { fontSize:24, fontWeight:'800', color:'#111827', textAlign:'center', marginBottom:16 },
  entrada: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  botao: { backgroundColor:'#10b981', padding:14, borderRadius:12 },
  textoBotao: { color:'#fff', textAlign:'center', fontWeight:'700' },
  cartao: { backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#e5e7eb', marginBottom:8 },
  tituloCartao: { fontWeight:'700', marginBottom:4 }
});
