import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { useAuth } from '../services/AuthContext';
import { apiFetch } from '../services/api';

function calculateDailyCalories({ weight, height, age, sex, activityLevel, goal }) {
  let tmb = 10 * weight + 6.25 * height - 5 * age;
  tmb += sex === 'M' ? 5 : -161;

  const activityMultipliers = {
    sedentario: 1.2,
    leve: 1.375,
    moderado: 1.55,
    intenso: 1.725
  };
  let calories = tmb * (activityMultipliers[activityLevel] || 1.2);
  if (goal === 'emagrecer') calories -= 500;
  if (goal === 'ganhar') calories += 500;
  return Math.round(calories);
}

export default function GoalScreen() {
  const { token } = useAuth();
  const [currentWeight, setCurrentWeight] = useState('');
  const [goalWeight, setGoalWeight] = useState('');
  const [days, setDays] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('M'); // M/F
  const [activityLevel, setActivityLevel] = useState('moderado');
  const [objective, setObjective] = useState('emagrecer');
  const [dailyCalories, setDailyCalories] = useState(null);

  function handleCalc() {
    const calories = calculateDailyCalories({
      weight: parseFloat(currentWeight || '0'),
      height: parseFloat(height || '0') * 100, // altura em cm
      age: parseInt(age || '0'),
      sex,
      activityLevel,
      goal: objective
    });
    setDailyCalories(calories);
  }

  async function saveGoal() {
    try {
      await apiFetch('/api/goals', {
        method: 'POST',
        token,
        body: {
          current_weight: parseFloat(currentWeight),
          goal_weight: parseFloat(goalWeight),
          days: parseInt(days),
          daily_calories: parseInt(dailyCalories || '0')
        }
      });
      Alert.alert('Sucesso', 'Meta salva e meta diária definida!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meta de Peso</Text>
      <TextInput placeholder="Peso atual (kg)" keyboardType="numeric" value={currentWeight} onChangeText={setCurrentWeight} style={styles.input} />
      <TextInput placeholder="Peso desejado (kg)" keyboardType="numeric" value={goalWeight} onChangeText={setGoalWeight} style={styles.input} />
      <TextInput placeholder="Prazo (dias)" keyboardType="numeric" value={days} onChangeText={setDays} style={styles.input} />
      <TextInput placeholder="Altura (m) ex: 1.75" keyboardType="numeric" value={height} onChangeText={setHeight} style={styles.input} />
      <TextInput placeholder="Idade" keyboardType="numeric" value={age} onChangeText={setAge} style={styles.input} />
      <TextInput placeholder="Sexo (M/F)" value={sex} onChangeText={setSex} style={styles.input} />
      <TextInput placeholder="Atividade (sedentario/leve/moderado/intenso)" value={activityLevel} onChangeText={setActivityLevel} style={styles.input} />
      <TextInput placeholder="Objetivo (emagrecer/ganhar/manter)" value={objective} onChangeText={setObjective} style={styles.input} />
      <TouchableOpacity onPress={handleCalc} style={styles.button}><Text style={styles.btnText}>Calcular Calorias</Text></TouchableOpacity>
      {dailyCalories && <Text style={styles.result}>Meta diária: {dailyCalories} kcal</Text>}
      <TouchableOpacity onPress={saveGoal} style={[styles.button, { backgroundColor:'#2563eb', marginTop:12 }]}><Text style={styles.btnText}>Salvar Meta</Text></TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, backgroundColor:'#f9fafb' },
  title: { fontSize:24, fontWeight:'800', color:'#111827', textAlign:'center', marginBottom:16 },
  input: { backgroundColor:'#fff', padding:14, borderRadius:12, borderColor:'#e5e7eb', borderWidth:1, marginBottom:12 },
  button: { backgroundColor:'#10b981', padding:14, borderRadius:12 },
  btnText: { color:'#fff', textAlign:'center', fontWeight:'700' },
  result: { marginTop:12, textAlign:'center', fontSize:16, fontWeight:'700' }
});
