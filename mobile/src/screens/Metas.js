import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, StatusBar, ScrollView, Dimensions } from 'react-native';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

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
  const { token, modoVisitante } = usarAutenticacao();
  const [pesoAtual, setPesoAtual] = useState('');
  const [pesoMeta, setPesoMeta] = useState('');
  const [dias, setDias] = useState('');
  const [altura, setAltura] = useState('');
  const [idade, setIdade] = useState('');
  const [sexo, setSexo] = useState('M');
  const [nivelAtividade, setNivelAtividade] = useState('moderado');
  const [objetivo, setObjetivo] = useState('emagrecer');
  const [caloriasDiarias, setCaloriasDiarias] = useState(null);
  
  // Estados para foco dos inputs
  const [focusedInputs, setFocusedInputs] = useState({});

  const setInputFocus = (inputName, isFocused) => {
    setFocusedInputs(prev => ({ ...prev, [inputName]: isFocused }));
  };

  function lidarComCalculo() {
    const calorias = calcularCaloriasDiarias({
      peso: parseFloat(pesoAtual || '0'),
      altura: parseFloat(altura || '0') * 100,
      idade: parseInt(idade || '0'),
      sexo,
      nivelAtividade,
      objetivo
    });
    setCaloriasDiarias(calorias);
  }

  async function salvarMeta() {
    if (modoVisitante) {
      Alert.alert('Modo Visitante', 'Metas não podem ser salvas no modo visitante. Faça login para salvar.');
      return;
    }

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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.neutral[50]} />
      
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Meta de Peso</Text>
            <Text style={styles.subtitle}>Defina seus objetivos e calcule suas necessidades calóricas</Text>
          </View>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🎯</Text>
          </View>
        </View>

        {/* Aviso do modo visitante */}
        {modoVisitante && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>
              💡 Modo Visitante - Cálculos funcionam, mas metas não são salvas
            </Text>
          </View>
        )}

        {/* Formulário */}
        <View style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Informações Pessoais</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso Atual (kg)</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInputs.pesoAtual && styles.inputFocused
                  ]}
                  placeholder="Ex: 70.5"
                  placeholderTextColor={colors.neutral[400]}
                  value={pesoAtual}
                  onChangeText={setPesoAtual}
                  onFocus={() => setInputFocus('pesoAtual', true)}
                  onBlur={() => setInputFocus('pesoAtual', false)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Peso Meta (kg)</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInputs.pesoMeta && styles.inputFocused
                  ]}
                  placeholder="Ex: 65.0"
                  placeholderTextColor={colors.neutral[400]}
                  value={pesoMeta}
                  onChangeText={setPesoMeta}
                  onFocus={() => setInputFocus('pesoMeta', true)}
                  onBlur={() => setInputFocus('pesoMeta', false)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Altura (m)</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInputs.altura && styles.inputFocused
                  ]}
                  placeholder="Ex: 1.75"
                  placeholderTextColor={colors.neutral[400]}
                  value={altura}
                  onChangeText={setAltura}
                  onFocus={() => setInputFocus('altura', true)}
                  onBlur={() => setInputFocus('altura', false)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Idade</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInputs.idade && styles.inputFocused
                  ]}
                  placeholder="Ex: 25"
                  placeholderTextColor={colors.neutral[400]}
                  value={idade}
                  onChangeText={setIdade}
                  onFocus={() => setInputFocus('idade', true)}
                  onBlur={() => setInputFocus('idade', false)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Sexo</Text>
                <View style={styles.sexSelector}>
                  <TouchableOpacity
                    style={[
                      styles.sexOption,
                      sexo === 'M' && styles.sexOptionSelected
                    ]}
                    onPress={() => setSexo('M')}
                  >
                    <Text style={[
                      styles.sexOptionText,
                      sexo === 'M' && styles.sexOptionTextSelected
                    ]}>Masculino</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sexOption,
                      sexo === 'F' && styles.sexOptionSelected
                    ]}
                    onPress={() => setSexo('F')}
                  >
                    <Text style={[
                      styles.sexOptionText,
                      sexo === 'F' && styles.sexOptionTextSelected
                    ]}>Feminino</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Prazo (dias)</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInputs.dias && styles.inputFocused
                  ]}
                  placeholder="Ex: 90"
                  placeholderTextColor={colors.neutral[400]}
                  value={dias}
                  onChangeText={setDias}
                  onFocus={() => setInputFocus('dias', true)}
                  onBlur={() => setInputFocus('dias', false)}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Preferências</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Nível de Atividade</Text>
              <View style={styles.activitySelector}>
                {['sedentario', 'leve', 'moderado', 'intenso'].map((nivel) => (
                  <TouchableOpacity
                    key={nivel}
                    style={[
                      styles.activityOption,
                      nivelAtividade === nivel && styles.activityOptionSelected
                    ]}
                    onPress={() => setNivelAtividade(nivel)}
                  >
                    <Text style={[
                      styles.activityOptionText,
                      nivelAtividade === nivel && styles.activityOptionTextSelected
                    ]}>
                      {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Objetivo</Text>
              <View style={styles.objectiveSelector}>
                {['emagrecer', 'manter', 'ganhar'].map((obj) => (
                  <TouchableOpacity
                    key={obj}
                    style={[
                      styles.objectiveOption,
                      objetivo === obj && styles.objectiveOptionSelected
                    ]}
                    onPress={() => setObjetivo(obj)}
                  >
                    <Text style={[
                      styles.objectiveOptionText,
                      objetivo === obj && styles.objectiveOptionTextSelected
                    ]}>
                      {obj.charAt(0).toUpperCase() + obj.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={lidarComCalculo}
            style={styles.calculateButton}
            activeOpacity={0.8}
          >
            <Text style={styles.calculateButtonText}>Calcular Calorias</Text>
          </TouchableOpacity>
        </View>

        {/* Resultado */}
        {caloriasDiarias && (
          <View style={styles.resultContainer}>
            <View style={styles.resultHeader}>
              <Text style={styles.resultTitle}>Meta Diária de Calorias</Text>
              <Text style={styles.resultValue}>{caloriasDiarias}</Text>
              <Text style={styles.resultUnit}>kcal</Text>
            </View>
            
            <Text style={styles.resultDescription}>
              Esta é a quantidade de calorias que você deve consumir diariamente para atingir seu objetivo de {objetivo}.
            </Text>
          </View>
        )}

        {/* Botões de ação */}
        {caloriasDiarias && (
          <View style={styles.actionButtons}>
            {!modoVisitante && (
              <TouchableOpacity
                onPress={salvarMeta}
                style={styles.saveButton}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Salvar Meta</Text>
              </TouchableOpacity>
            )}
            
            {modoVisitante && (
              <View style={styles.visitorAlert}>
                <Text style={styles.visitorAlertText}>
                  Faça login para salvar esta meta
                </Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  scrollView: {
    flex: 1,
  },
  
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  
  titleContainer: {
    flex: 1,
  },
  
  title: {
    fontSize: typography.fontSize['3xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  
  subtitle: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.normal,
  },
  
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
  },
  
  icon: {
    fontSize: 40,
  },
  
  alertContainer: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    marginBottom: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  alertText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  formContainer: {
    gap: spacing.xl,
    marginBottom: spacing.xl,
  },
  
  formSection: {
    gap: spacing.lg,
  },
  
  sectionTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  
  inputGroup: {
    flex: 1,
    gap: spacing.sm,
  },
  
  inputLabel: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
    marginLeft: spacing.sm,
  },
  
  input: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    fontSize: typography.fontSize.base,
    color: colors.neutral[900],
    ...shadows.sm,
  },
  
  inputFocused: {
    borderColor: colors.primary[500],
    borderWidth: borders.width.base,
    ...shadows.base,
  },
  
  sexSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  sexOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    ...shadows.sm,
  },
  
  sexOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  sexOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
  
  sexOptionTextSelected: {
    color: colors.neutral[50],
  },
  
  activitySelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  
  activityOption: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    ...shadows.sm,
  },
  
  activityOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  activityOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[700],
  },
  
  activityOptionTextSelected: {
    color: colors.neutral[50],
  },
  
  objectiveSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  objectiveOption: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    ...shadows.sm,
  },
  
  objectiveOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  objectiveOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
  
  objectiveOptionTextSelected: {
    color: colors.neutral[50],
  },
  
  calculateButton: {
    backgroundColor: colors.primary[600],
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
    ...shadows.lg,
    elevation: 8,
  },
  
  calculateButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  resultContainer: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.xl,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    ...shadows.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  resultHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  
  resultTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    marginBottom: spacing.md,
  },
  
  resultValue: {
    fontSize: typography.fontSize['5xl'],
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary[600],
    lineHeight: typography.lineHeight.tight,
  },
  
  resultUnit: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[600],
    marginTop: spacing.xs,
  },
  
  resultDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
  
  actionButtons: {
    gap: spacing.md,
  },
  
  saveButton: {
    backgroundColor: colors.accent.blue,
    borderRadius: borders.radius.xl,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  
  saveButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  visitorAlert: {
    backgroundColor: colors.accent.yellow + '15',
    padding: spacing.md,
    borderRadius: borders.radius.lg,
    borderWidth: borders.width.thin,
    borderColor: colors.accent.yellow + '30',
  },
  
  visitorAlertText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.accent.yellow + 'DD',
    textAlign: 'center',
    lineHeight: typography.lineHeight.normal,
  },
});