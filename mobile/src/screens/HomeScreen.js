import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';

export default function TelaPrincipal({ navigation }) {
  const { usuario, token, sair } = usarAutenticacao();
  const [meta, setMeta] = useState(null);
  const [consumido, setConsumido] = useState(0);

  async function carregarDados() {
    try {
      const m = await buscarApi('/api/metas', { token });
      setMeta(m);
      const refeicoes = await buscarApi('/api/refeicoes', { token });
      const hoje = new Date().toDateString();
      const total = refeicoes
        .filter(r => new Date(r.timestamp).toDateString() === hoje)
        .reduce((soma, r) => soma + (r.calorias_totais || 0), 0);
      setConsumido(total);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  const diario = meta?.calorias_diarias || 2000;
  const percentual = Math.min(100, Math.round((consumido / diario) * 100));

  return (
    <View style={estilos.container}>
      <Text style={estilos.ola}>Olá, {usuario?.nome || 'usuário'} 👋</Text>

      <View style={estilos.cartao}>
        <Text style={estilos.tituloCartao}>Meta diária</Text>
        <Text style={estilos.cartaoGrande}>{diario} kcal</Text>
        <View style={estilos.progressoExterno}>
          <View style={[estilos.progressoInterno, { width: percentual + '%' }]} />
        </View>
        <Text style={estilos.textoProgresso}>{consumido} / {diario} kcal ({percentual}%)</Text>
      </View>

      <View style={estilos.linha}>
        <TouchableOpacity onPress={() => navigation.navigate('Refeicoes')} style={estilos.botao}><Text style={estilos.textoBotao}>Refeições</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('IMC')} style={estilos.botao}><Text style={estilos.textoBotao}>IMC</Text></TouchableOpacity>
      </View>
      <View style={estilos.linha}>
        <TouchableOpacity onPress={() => navigation.navigate('Meta')} style={estilos.botao}><Text style={estilos.textoBotao}>Meta de Peso</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('PlanoTreino')} style={estilos.botao}><Text style={estilos.textoBotao}>Treino</Text></TouchableOpacity>
      </View>

      <TouchableOpacity onPress={sair}><Text style={estilos.sair}>Sair</Text></TouchableOpacity>
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  ola: { fontSize:22, fontWeight:'700', marginBottom:12 },
  cartao: { backgroundColor:'#fff', borderRadius:16, padding:16, marginBottom:16, borderWidth:1, borderColor:'#e5e7eb' },
  tituloCartao: { color:'#6b7280', marginBottom:8 },
  cartaoGrande: { fontSize:28, fontWeight:'800', marginBottom:12, color:'#10b981' },
  progressoExterno: { height:10, backgroundColor:'#e5e7eb', borderRadius:999 },
  progressoInterno: { height:10, backgroundColor:'#10b981', borderRadius:999 },
  textoProgresso: { marginTop:8, color:'#374151' },
  linha: { flexDirection:'row', gap:12, marginTop:8 },
  botao: { flex:1, backgroundColor:'#111827', padding:14, borderRadius:12 },
  textoBotao: { color:'#fff', textAlign:'center', fontWeight:'700' },
  sair: { textAlign:'center', color:'#ef4444', marginTop:24 }
});