import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';

export default function TelaRefeicoes() {
  const { token } = usarAutenticacao();
  const [imagem, setImagem] = useState(null);
  const [itens, setItens] = useState([]);
  const [total, setTotal] = useState(0);

  function recalcular(itens) {
    setTotal(itens.reduce((soma, item) => soma + (item.calorias||0), 0));
  }

  async function escolherImagem() {
    const resultado = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 });
    if (!resultado.canceled) {
      const asset = resultado.assets[0];
      setImagem(asset.uri);
      try {
        const dados = await buscarApi('/api/analise', { method:'POST', token, body:{ dadosImagemBase64: asset.base64 } });
        setItens(dados.itens || []);
        recalcular(dados.itens || []);
      } catch (erro) {
        Alert.alert('Erro', erro.message);
      }
    }
  }

  async function salvarRefeicao() {
    try {
      await buscarApi('/api/refeicoes', { method:'POST', token, body:{ itens, calorias_totais: total, timestamp: new Date() } });
      Alert.alert('Sucesso', 'Refeição salva!');
      setImagem(null); setItens([]); setTotal(0);
    } catch (erro) {
      Alert.alert('Erro', erro.message);
    }
  }

  return (
    <View style={estilos.container}>
      <TouchableOpacity onPress={escolherImagem} style={estilos.botao}><Text style={estilos.textoBotao}>Fotografar refeição</Text></TouchableOpacity>

      {imagem && <Image source={{ uri:imagem }} style={{ width:'100%', height:200, marginTop:12, borderRadius:12 }} />}

      <FlatList
        style={{ marginTop:12 }}
        data={itens}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={estilos.cartao}>
            <Text style={{ fontWeight:'700' }}>{item.nome}</Text>
            <Text>{Math.round(item.calorias)} kcal</Text>
          </View>
        )}
        ListFooterComponent={
          itens.length>0 ? <Text style={{ textAlign:'center', marginTop:8, fontWeight:'700' }}>Total: {Math.round(total)} kcal</Text> : null
        }
      />

      {itens.length>0 && <TouchableOpacity onPress={salvarRefeicao} style={[estilos.botao, { backgroundColor:'#2563eb', marginTop:12 }]}><Text style={estilos.textoBotao}>Salvar refeição</Text></TouchableOpacity>}
    </View>
  );
}

const estilos = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  botao: { backgroundColor:'#10b981', padding:14, borderRadius:12 },
  textoBotao: { color:'#fff', textAlign:'center', fontWeight:'700' },
  cartao: { backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#e5e7eb', marginBottom:8 }
});