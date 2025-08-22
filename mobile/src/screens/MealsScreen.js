import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../services/AuthContext';
import { apiFetch } from '../services/api';

export default function MealsScreen() {
  const { token } = useAuth();
  const [image, setImage] = useState(null);
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);

  function recalc(items) {
    setTotal(items.reduce((s, i) => s + (i.calories||0), 0));
  }

  async function pickImage() {
    const res = await ImagePicker.launchCameraAsync({ base64: true, quality: 0.6 });
    if (!res.canceled) {
      const asset = res.assets[0];
      setImage(asset.uri);
      try {
        const data = await apiFetch('/api/analyze', { method:'POST', token, body:{ base64ImageData: asset.base64 } });
        setItems(data.items || []);
        recalc(data.items || []);
      } catch (e) {
        Alert.alert('Erro', e.message);
      }
    }
  }

  async function saveMeal() {
    try {
      await apiFetch('/api/meals', { method:'POST', token, body:{ items, total_calories: total, timestamp: new Date() } });
      Alert.alert('Sucesso', 'Refeição salva!');
      setImage(null); setItems([]); setTotal(0);
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.button}><Text style={styles.btnText}>Fotografar refeição</Text></TouchableOpacity>

      {image && <Image source={{ uri:image }} style={{ width:'100%', height:200, marginTop:12, borderRadius:12 }} />}

      <FlatList
        style={{ marginTop:12 }}
        data={items}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight:'700' }}>{item.name}</Text>
            <Text>{Math.round(item.calories)} kcal</Text>
          </View>
        )}
        ListFooterComponent={
          items.length>0 ? <Text style={{ textAlign:'center', marginTop:8, fontWeight:'700' }}>Total: {Math.round(total)} kcal</Text> : null
        }
      />

      {items.length>0 && <TouchableOpacity onPress={saveMeal} style={[styles.button, { backgroundColor:'#2563eb', marginTop:12 }]}><Text style={styles.btnText}>Salvar refeição</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  button: { backgroundColor:'#10b981', padding:14, borderRadius:12 },
  btnText: { color:'#fff', textAlign:'center', fontWeight:'700' },
  card: { backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#e5e7eb', marginBottom:8 }
});
