import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { apiFetch } from '../services/api';

export default function HomeScreen({ navigation }) {
  const { user, token, signOut } = useAuth();
  const [goal, setGoal] = useState(null);
  const [consumed, setConsumed] = useState(0);

  async function loadData() {
    try {
      const g = await apiFetch('/api/goals', { token });
      setGoal(g);
      const meals = await apiFetch('/api/meals', { token });
      const today = new Date().toDateString();
      const total = meals
        .filter(m => new Date(m.timestamp).toDateString() === today)
        .reduce((sum, m) => sum + (m.total_calories || 0), 0);
      setConsumed(total);
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  useEffect(() => { loadData(); }, []);

  const daily = goal?.daily_calories || 2000;
  const pct = Math.min(100, Math.round((consumed / daily) * 100));

  return (
    <View style={styles.container}>
      <Text style={styles.hello}>Olá, {user?.name || 'usuário'} 👋</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Meta diária</Text>
        <Text style={styles.cardBig}>{daily} kcal</Text>
        <View style={styles.progressOuter}>
          <View style={[styles.progressInner, { width: pct + '%' }]} />
        </View>
        <Text style={styles.progressText}>{consumed} / {daily} kcal ({pct}%)</Text>
      </View>

      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.navigate('Meals')} style={styles.btn}><Text style={styles.btnText}>Refeições</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('BMI')} style={styles.btn}><Text style={styles.btnText}>IMC</Text></TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => navigation.navigate('Goal')} style={styles.btn}><Text style={styles.btnText}>Meta de Peso</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('WorkoutPlan')} style={styles.btn}><Text style={styles.btnText}>Treino</Text></TouchableOpacity>
      </View>

      <TouchableOpacity onPress={signOut}><Text style={styles.logout}>Sair</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  hello: { fontSize:22, fontWeight:'700', marginBottom:12 },
  card: { backgroundColor:'#fff', borderRadius:16, padding:16, marginBottom:16, borderWidth:1, borderColor:'#e5e7eb' },
  cardTitle: { color:'#6b7280', marginBottom:8 },
  cardBig: { fontSize:28, fontWeight:'800', marginBottom:12, color:'#10b981' },
  progressOuter: { height:10, backgroundColor:'#e5e7eb', borderRadius:999 },
  progressInner: { height:10, backgroundColor:'#10b981', borderRadius:999 },
  progressText: { marginTop:8, color:'#374151' },
  row: { flexDirection:'row', gap:12, marginTop:8 },
  btn: { flex:1, backgroundColor:'#111827', padding:14, borderRadius:12 },
  btnText: { color:'#fff', textAlign:'center', fontWeight:'700' },
  logout: { textAlign:'center', color:'#ef4444', marginTop:24 }
});
