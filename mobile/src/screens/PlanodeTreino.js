import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert, StatusBar, ScrollView, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { usarAutenticacao } from '../services/AuthContext';
import { buscarApi } from '../services/api';
import { colors, typography, spacing, borders, shadows, componentStyles } from '../styles/globalStyles';

const { width } = Dimensions.get('window');

function gerarPlanoTreino(diasPorSemana, objetivo, minutosPorSessao, horarioPreferido) {
  const catalogo = {
    emagrecer: [
      { nome: 'Cardio Intensivo', descricao: 'Corrida ou ciclismo em alta intensidade', duracao: '30-40 min', intensidade: 'Alta' },
      { nome: 'HIIT', descricao: 'Treino intervalado de alta intensidade', duracao: '20 min', intensidade: 'Máxima' },
      { nome: 'Musculação Leve', descricao: 'Full body com pesos moderados', duracao: '45 min', intensidade: 'Média' },
      { nome: 'Ciclismo', descricao: 'Pedalada em ritmo constante', duracao: '40 min', intensidade: 'Média' },
      { nome: 'Caminhada Rápida', descricao: 'Caminhada em ritmo acelerado', duracao: '45 min', intensidade: 'Baixa' }
    ],
    ganhar: [
      { nome: 'Força - Peito/Tríceps', descricao: 'Supino, flexões, tríceps na polia', duracao: '60 min', intensidade: 'Alta' },
      { nome: 'Força - Costas/Bíceps', descricao: 'Puxadas, remadas, roscas', duracao: '60 min', intensidade: 'Alta' },
      { nome: 'Força - Pernas/Ombros', descricao: 'Agachamentos, leg press, desenvolvimento', duracao: '60 min', intensidade: 'Alta' },
      { nome: 'Core + Estabilidade', descricao: 'Planks, abdominais, exercícios de equilíbrio', duracao: '45 min', intensidade: 'Média' },
      { nome: 'Cardio Leve', descricao: 'Caminhada ou natação suave', duracao: '20 min', intensidade: 'Baixa' }
    ],
    manter: [
      { nome: 'Musculação Moderada', descricao: 'Treino equilibrado de força', duracao: '45 min', intensidade: 'Média' },
      { nome: 'Cardio Moderado', descricao: 'Corrida ou ciclismo em ritmo confortável', duracao: '30 min', intensidade: 'Média' },
      { nome: 'Yoga/Alongamento', descricao: 'Flexibilidade e relaxamento', duracao: '30 min', intensidade: 'Baixa' },
      { nome: 'Treino Funcional', descricao: 'Exercícios com peso corporal', duracao: '30 min', intensidade: 'Média' }
    ]
  };
  
  const base = catalogo[objetivo] || catalogo.manter;
  const plano = [];
  
  for (let i = 0; i < diasPorSemana; i++) {
    const treino = base[i % base.length];
    plano.push({
      dia: `Dia ${i + 1}`,
      treino: treino.nome,
      descricao: treino.descricao,
      duracao: treino.duracao,
      intensidade: treino.intensidade,
      horario: horarioPreferido || 'manhã',
      minutos: minutosPorSessao || 30
    });
  }
  
  return plano;
}

export default function TelaPlanoTreino() {
  const { token, modoVisitante } = usarAutenticacao();
  const [diasPorSemana, setDiasPorSemana] = useState('3');
  const [objetivo, setObjetivo] = useState('emagrecer');
  const [minutos, setMinutos] = useState('30');
  const [horarioPreferido, setHorarioPreferido] = useState('manhã');
  const [plano, setPlano] = useState([]);
  
  // Estados para foco dos inputs
  const [focusedInputs, setFocusedInputs] = useState({});

  const setInputFocus = (inputName, isFocused) => {
    setFocusedInputs(prev => ({ ...prev, [inputName]: isFocused }));
  };

  function lidarComGerar() {
    const p = gerarPlanoTreino(parseInt(diasPorSemana || '3'), objetivo, parseInt(minutos || '30'), horarioPreferido);
    setPlano(p);
  }

  async function salvarPlano() {
    if (modoVisitante) {
      Alert.alert('Modo Visitante', 'Planos de treino não podem ser salvos no modo visitante. Faça login para salvar.');
      return;
    }

    try {
      await buscarApi('/api/treinos', { 
        method: 'POST', 
        token, 
        body: { plano } 
      });
      Alert.alert('Sucesso', 'Plano de treino salvo com sucesso!');
    } catch (e) {
      Alert.alert('Erro', e.message);
    }
  }

  function renderizarTreino({ item, index }) {
    const getIntensidadeColor = (intensidade) => {
      switch (intensidade) {
        case 'Baixa': return colors.success;
        case 'Média': return colors.accent.yellow;
        case 'Alta': return colors.accent.orange;
        case 'Máxima': return colors.error;
        default: return colors.neutral[500];
      }
    };

    return (
      <View style={styles.workoutCard}>
        <View style={styles.workoutHeader}>
          <View style={styles.workoutDay}>
            <Text style={styles.workoutDayText}>{item.dia}</Text>
            <Text style={styles.workoutTime}>{item.horario}</Text>
          </View>
          <View style={styles.workoutDuration}>
            <Text style={styles.workoutDurationText}>{item.duracao}</Text>
          </View>
        </View>
        
        <Text style={styles.workoutName}>{item.treino}</Text>
        <Text style={styles.workoutDescription}>{item.descricao}</Text>
        
        <View style={styles.workoutDetails}>
          <View style={styles.workoutDetail}>
            <Text style={styles.workoutDetailLabel}>Duração</Text>
            <Text style={styles.workoutDetailValue}>{item.minutos} min</Text>
          </View>
          <View style={styles.workoutDetail}>
            <Text style={styles.workoutDetailLabel}>Intensidade</Text>
            <View style={styles.intensidadeContainer}>
              <View style={[
                styles.intensidadeDot, 
                { backgroundColor: getIntensidadeColor(item.intensidade) }
              ]} />
              <Text style={[
                styles.workoutDetailValue,
                { color: getIntensidadeColor(item.intensidade) }
              ]}>
                {item.intensidade}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
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
            <Text style={styles.title}>Plano de Treino</Text>
            <Text style={styles.subtitle}>Crie sua rotina personalizada de exercícios</Text>
          </View>
          <View style={styles.iconContainer}>
            <MaterialIcons name="fitness-center" size={40} color={colors.primary[600]} />
          </View>
        </View>

        {/* Aviso do modo visitante */}
        {modoVisitante && (
          <View style={styles.alertContainer}>
            <Text style={styles.alertText}>
              💡 Modo Visitante - Planos são gerados mas não salvos
            </Text>
          </View>
        )}

        {/* Formulário */}
        <View style={styles.formContainer}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Configurações do Plano</Text>
            
            <View style={styles.inputRow}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Dias por Semana</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInputs.diasPorSemana && styles.inputFocused
                  ]}
                  placeholder="Ex: 3"
                  placeholderTextColor={colors.neutral[400]}
                  value={diasPorSemana}
                  onChangeText={setDiasPorSemana}
                  onFocus={() => setInputFocus('diasPorSemana', true)}
                  onBlur={() => setInputFocus('diasPorSemana', false)}
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Minutos por Sessão</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInputs.minutos && styles.inputFocused
                  ]}
                  placeholder="Ex: 30"
                  placeholderTextColor={colors.neutral[400]}
                  value={minutos}
                  onChangeText={setMinutos}
                  onFocus={() => setInputFocus('minutos', true)}
                  onBlur={() => setInputFocus('minutos', false)}
                  keyboardType="numeric"
                />
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

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Horário Preferido</Text>
              <View style={styles.timeSelector}>
                {['manhã', 'tarde', 'noite'].map((horario) => (
                  <TouchableOpacity
                    key={horario}
                    style={[
                      styles.timeOption,
                      horarioPreferido === horario && styles.timeOptionSelected
                    ]}
                    onPress={() => setHorarioPreferido(horario)}
                  >
                    <Text style={[
                      styles.timeOptionText,
                      horarioPreferido === horario && styles.timeOptionTextSelected
                    ]}>
                      {horario.charAt(0).toUpperCase() + horario.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={lidarComGerar}
            style={styles.generateButton}
            activeOpacity={0.8}
          >
            <Text style={styles.generateButtonText}>Gerar Plano de Treino</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de treinos */}
        {plano.length > 0 && (
          <View style={styles.workoutsContainer}>
            <Text style={styles.workoutsTitle}>Seu Plano de Treino</Text>
            <FlatList
              data={plano}
              keyExtractor={(item, idx) => idx.toString()}
              renderItem={renderizarTreino}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Botões de ação */}
        {plano.length > 0 && (
          <View style={styles.actionButtons}>
            {!modoVisitante && (
              <TouchableOpacity
                onPress={salvarPlano}
                style={styles.saveButton}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Salvar Plano</Text>
              </TouchableOpacity>
            )}
            
            {modoVisitante && (
              <View style={styles.visitorAlert}>
                <Text style={styles.visitorAlertText}>
                  Faça login para salvar este plano de treino
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
  
  timeSelector: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  
  timeOption: {
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
  
  timeOptionSelected: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  
  timeOptionText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.neutral[700],
  },
  
  timeOptionTextSelected: {
    color: colors.neutral[50],
  },
  
  generateButton: {
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
  
  generateButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[50],
    letterSpacing: 0.5,
  },
  
  workoutsContainer: {
    marginBottom: spacing.xl,
  },
  
  workoutsTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
    marginBottom: spacing.md,
  },
  
  workoutCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: borders.radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.base,
    borderWidth: borders.width.thin,
    borderColor: colors.neutral[200],
  },
  
  workoutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  
  workoutDay: {
    flex: 1,
  },
  
  workoutDayText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.xs,
  },
  
  workoutTime: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
  },
  
  workoutDuration: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borders.radius.lg,
  },
  
  workoutDurationText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.primary[700],
  },
  
  workoutName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[900],
    marginBottom: spacing.sm,
  },
  
  workoutDescription: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    lineHeight: typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  
  workoutDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: borders.width.thin,
    borderTopColor: colors.neutral[200],
    paddingTop: spacing.md,
  },
  
  workoutDetail: {
    alignItems: 'center',
  },
  
  workoutDetailLabel: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.neutral[600],
    marginBottom: spacing.xs,
  },
  
  workoutDetailValue: {
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[800],
  },
  
  intensidadeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  
  intensidadeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
