import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { apiFetch } from '../services/api';

function generateWorkoutPlan(daysPerWeek, goal, minutesPerSession, preferredTime) {
  const catalogs = {
    emagrecer: ['Cardio 30-40min', 'HIIT 20min', 'Musculação leve (full body)', 'Ciclismo 40min', 'Caminhada rápida 45min'],
    ganhar: ['Força (peito/tríceps)', 'Força (costas/bíceps)', 'Força (pernas/ombros)', 'Core + estabilidade', 'Cardio leve 20min'],
    manter: ['Musculação moderada', 'Cardio moderado 30min', 'Yoga/alongamento 30min', 'Treino funcional 30min']
  };
  const base = catalogs[goal] || catalogs.manter;
  const plan = [];
  for (let i=0; i<daysPerWeek; i++) {
    plan.push({
      day: `Dia ${i+1}`,
      workout: base[i % base.length],
      time: preferredTime || 'manhã',
      minutes: minutesPerSession || 30
    });
  }
  return plan;
}

export default function WorkoutPlanScreen() {
  const { token } = useAuth();
  const [daysPerWeek, setDaysPerWeek] = useState('3');
  const [goal, setGoal] = useState('emagrecer');
  const [minutes, setMinutes] = useState('30');
  const [preferredTime, setPreferredTime] = useState('manhã');
  const [plan, setPlan] = useState([]);

  function handleGenerate() {
    const p = generateWorkoutPlan(parseInt(daysPerWeek || '3'), goal, parseInt(minutes || '30'), preferredTime);
    setPlan(p);
  }

  async function savePlan() {
    try {
      await apiFetch('/api/workouts', { method:'POST', token, body:{ plan } });
      Alert.alert('Sucesso', 'Plano de treino salvo!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rotina de Treino</Text>
      <TextInput placeholder="Dias por semana (ex: 3)" keyboardType="numeric" value={daysPerWeek} onChangeText={setDaysPerWeek} style={styles.input} />
      <TextInput placeholder="Objetivo (emagrecer/ganhar/manter)" value={goal} onChangeText={setGoal} style={styles.input} />
      <TextInput placeholder="Minutos por sessão" keyboardType="numeric" value={minutes} onChangeText={setMinutes} style={styles.input} />
      <TextInput placeholder="Horário preferido (manhã/tarde/noite)" value={preferredTime} onChangeText={setPreferredTime} style={styles.input} />

      <TouchableOpacity onPress={handleGenerate} style={styles.button}><Text style={styles.btnText}>Gerar</Text></TouchableOpacity>

      <FlatList
        style={{ marginTop:12 }}
        data={plan}
        keyExtractor={(item, idx) => idx.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.day} • {item.time}</Text>
            <Text>{item.workout} — {item.minutes} min</Text>
          </View>
        )}
      />

      {plan.length>0 && <TouchableOpacity onPress={savePlan} style={[styles.button, { backgroundColor:'#2563eb', marginTop:12 }]}><Text style={styles.btnText}>Salvar Plano</Text></TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  title: { fontSize:24, fontWeight:'800', color:'#111827', textAlign:'center', marginBottom:16 },
  input: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  button: { backgroundColor:'#10b981', padding:14, borderRadius:12 },
  btnText: { color:'#fff', textAlign:'center', fontWeight:'700' },
  card: { backgroundColor:'#fff', padding:12, borderRadius:12, borderWidth:1, borderColor:'#e5e7eb', marginBottom:8 },
  cardTitle: { fontWeight:'700', marginBottom:4 }
});
